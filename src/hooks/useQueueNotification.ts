import { useEffect, useRef, useState, useCallback } from "react";

export function useQueueNotification(count: number | undefined) {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("queue-notification-muted");
    return saved === "true";
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const prevCountRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | null>(null);

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
      return newValue;
    });
  }, []);

  const playNotificationSound = (isIncrease: boolean) => {
    if (isMuted) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (isIncrease) {
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      } else {
        oscillator.frequency.setValueAtTime(660, ctx.currentTime);
      }

      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.log("Audio notification not supported");
    }
  };

  const showBrowserNotification = (isIncrease: boolean, newCount: number) => {
    if (!notificationsEnabled || document.hasFocus()) return;

    try {
      const title = "Filômetro Ásperus";
      const body = isIncrease
        ? `Nova pessoa na fila! Agora são ${newCount} na fila.`
        : `Alguém saiu da fila! Agora são ${newCount} na fila.`;
      const icon = "/pwa-192x192.png";

      new Notification(title, { body, icon, badge: icon, tag: "queue-update" });
    } catch (error) {
      console.log("Browser notification failed:", error);
    }
  };

  useEffect(() => {
    if (prevCountRef.current === undefined) {
      prevCountRef.current = count;
      return;
    }

    if (count !== undefined && count !== prevCountRef.current) {
      const isIncrease = count > prevCountRef.current;
      playNotificationSound(isIncrease);
      showBrowserNotification(isIncrease, count);
      prevCountRef.current = count;
    }
  }, [count, isMuted, notificationsEnabled]);

  return {
    isMuted,
    toggleMute,
    notificationsEnabled,
    requestNotificationPermission,
  };
}
