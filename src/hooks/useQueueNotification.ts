import { useEffect, useRef, useState, useCallback } from "react";

export function useQueueNotification(count: number | undefined) {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("queue-notification-muted");
    return saved === "true";
  });
  const prevCountRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | null>(null);

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
      
      // Different tones for increase vs decrease
      if (isIncrease) {
        // Higher pitched double beep for new person
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      } else {
        // Lower pitched single tone for person leaving
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

  useEffect(() => {
    // Skip initial load
    if (prevCountRef.current === undefined) {
      prevCountRef.current = count;
      return;
    }

    // Only play if count actually changed
    if (count !== undefined && count !== prevCountRef.current) {
      const isIncrease = count > prevCountRef.current;
      playNotificationSound(isIncrease);
      prevCountRef.current = count;
    }
  }, [count, isMuted]);

  return { isMuted, toggleMute };
}
