import { useEffect, useRef, useState, useCallback } from "react";

// Singleton AudioContext for mobile web audio unlock
let globalAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    if (!globalAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        globalAudioCtx = new AudioCtx();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch {
    return null;
  }
}

// Auto-unlock on first touch/click (critical for iOS Safari and Android Chrome)
if (typeof window !== "undefined") {
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  };

  window.addEventListener("click", unlock, { passive: true });
  window.addEventListener("touchstart", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
}

export function playQueueSound(isIncrease: boolean) {
  if (typeof window === "undefined") return;
  const isMuted = localStorage.getItem("queue-notification-muted") === "true";
  if (isMuted) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";

    if (isIncrease) {
      // SOM DE ENTRADA: Tom ascendente brilhante (Ré5 -> Lá5: 587Hz -> 880Hz)
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.36);

      // Vibração no celular se suportado (dois pulsos rápidos)
      if ("vibrate" in navigator) {
        navigator.vibrate([70, 40, 90]);
      }
    } else {
      // SOM DE SAÍDA: Tom descendente suave (Lá5 -> Dó5: 880Hz -> 523Hz)
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.14);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.41);

      // Vibração no celular se suportado (um pulso firme)
      if ("vibrate" in navigator) {
        navigator.vibrate(130);
      }
    }
  } catch (error) {
    console.warn("Audio notification not supported:", error);
  }
}

export function useQueueNotification(count: number | undefined) {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("queue-notification-muted");
    return saved === "true";
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const prevCountRef = useRef<number | undefined>(undefined);

  // Check notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev;
      localStorage.setItem("queue-notification-muted", String(newValue));

      // Se desmutou, desbloqueia o áudio e toca um tom suave de confirmação
      if (!newValue) {
        try {
          const ctx = getAudioContext();
          if (ctx) {
            if (ctx.state === "suspended") ctx.resume().catch(() => {});
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(784, now); // Sol5
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.19);
          }
        } catch {}
      }

      return newValue;
    });
  }, []);

  const showBrowserNotification = useCallback((isIncrease: boolean, newCount: number) => {
    if (!notificationsEnabled || document.hasFocus()) return;

    try {
      const title = "Filômetro Ásperus";
      const body = isIncrease
        ? `Nova pessoa na fila! Agora são ${newCount} na fila.`
        : `Alguém saiu da fila! Agora são ${newCount} na fila.`;
      const icon = "/pwa-192x192.png";

      new Notification(title, { body, icon, badge: icon, tag: "queue-update" });
    } catch (error) {
      console.warn("Browser notification failed:", error);
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    if (count === undefined) return;

    // Primeira carga: registra a contagem inicial sem tocar som
    if (prevCountRef.current === undefined) {
      prevCountRef.current = count;
      return;
    }

    // Se o valor mudou em relação ao anterior
    if (count !== prevCountRef.current) {
      const isIncrease = count > prevCountRef.current;
      playQueueSound(isIncrease);
      showBrowserNotification(isIncrease, count);
      prevCountRef.current = count;
    }
  }, [count, showBrowserNotification]);

  return {
    isMuted,
    toggleMute,
    notificationsEnabled,
    requestNotificationPermission,
    playNotificationSound: playQueueSound,
  };
}
