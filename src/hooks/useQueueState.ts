import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CutDuration {
  duration: number;
  timestamp: string;
}

export interface QueueState {
  id: string;
  current_count: number;
  is_open: boolean;
  avg_wait_time: number;
  last_updated: string;
  manual_wait_time: number | null;
  message_green: string | null;
  message_yellow: string | null;
  message_red: string | null;
  cut_durations: CutDuration[];
}

const MAX_STORED_CUTS = 10;

export function useQueueState() {
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial state
    const fetchQueueState = async () => {
      const { data, error } = await supabase
        .from("queue_state")
        .select("*")
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (data) {
        const rawDurations = data.cut_durations;
        const parsedDurations: CutDuration[] = Array.isArray(rawDurations) 
          ? rawDurations.map((d: unknown) => {
              const item = d as { duration?: number; timestamp?: string };
              return {
                duration: item.duration ?? 0,
                timestamp: item.timestamp ?? "",
              };
            })
          : [];
        setQueueState({
          ...data,
          cut_durations: parsedDurations,
        });
      }
      setLoading(false);
    };

    fetchQueueState();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("queue_state_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_state",
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as Record<string, unknown>;
            const rawDurations = newData.cut_durations;
            const parsedDurations: CutDuration[] = Array.isArray(rawDurations) 
              ? rawDurations.map((d: unknown) => {
                  const item = d as { duration?: number; timestamp?: string };
                  return {
                    duration: item.duration ?? 0,
                    timestamp: item.timestamp ?? "",
                  };
                })
              : [];
            setQueueState({
              ...newData,
              cut_durations: parsedDurations,
            } as QueueState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateQueueState = async (updates: Partial<Omit<QueueState, "id" | "last_updated">>) => {
    if (!queueState) return;

    // Optimistic update - immediately reflect in UI
    setQueueState(prev => prev ? { ...prev, ...updates, last_updated: new Date().toISOString() } : prev);

    // Convert cut_durations to JSON-compatible format if present
    const dbUpdates: Record<string, unknown> = {
      ...updates,
      last_updated: new Date().toISOString(),
    };
    
    if (updates.cut_durations) {
      dbUpdates.cut_durations = updates.cut_durations.map(d => ({
        duration: d.duration,
        timestamp: d.timestamp,
      }));
    }

    const { error } = await supabase
      .from("queue_state")
      .update(dbUpdates)
      .eq("id", queueState.id);

    if (error) {
      // Revert optimistic update on error
      setQueueState(queueState);
      throw new Error(error.message);
    }
  };

  const incrementCount = async () => {
    if (!queueState) return;
    await updateQueueState({ current_count: queueState.current_count + 1 });
  };

  const decrementCount = async () => {
    if (!queueState || queueState.current_count <= 0) return;
    await updateQueueState({ current_count: queueState.current_count - 1 });
  };

  const resetCount = async () => {
    await updateQueueState({ current_count: 0 });
  };

  const toggleOpen = async () => {
    if (!queueState) return;
    await updateQueueState({ is_open: !queueState.is_open });
  };

  const setAvgWaitTime = async (time: number) => {
    await updateQueueState({ avg_wait_time: time });
  };

  const setManualWaitTime = async (time: number | null) => {
    await updateQueueState({ manual_wait_time: time });
  };

  const setMessages = async (green: string, yellow: string, red: string) => {
    await updateQueueState({ 
      message_green: green, 
      message_yellow: yellow, 
      message_red: red 
    });
  };

  const addCutDuration = async (duration: number) => {
    if (!queueState) return;

    const newCutDuration: CutDuration = {
      duration,
      timestamp: new Date().toISOString(),
    };

    // Get current durations and add new one
    const currentDurations = queueState.cut_durations || [];
    const updatedDurations = [...currentDurations, newCutDuration]
      .slice(-MAX_STORED_CUTS); // Keep only last 10

    // Calculate new average
    const validDurations = updatedDurations.map(d => d.duration);
    const newAvg = validDurations.length > 0 
      ? Math.round(validDurations.reduce((a, b) => a + b, 0) / validDurations.length)
      : queueState.avg_wait_time;

    await updateQueueState({ 
      cut_durations: updatedDurations,
      avg_wait_time: newAvg,
    });
  };

  const validatePin = async (pin: string): Promise<{ valid: boolean; locked: boolean; retry_after?: number; attempts_remaining?: number }> => {
    const { data, error } = await supabase.rpc("validate_admin_pin", { pin_input: pin });
    if (error) return { valid: false, locked: false };
    const result = data as { valid: boolean; locked: boolean; retry_after?: number; attempts_remaining?: number };
    return result;
  };

  const validateSecretPhrase = async (phrase: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc("validate_secret_phrase", { phrase_input: phrase });
    if (error) return false;
    return data === true;
  };

  const updatePin = async (newPin: string) => {
    // This requires knowing the current PIN - handled in LoginForm via reset_admin_pin
    throw new Error("Use resetPinWithPhrase instead");
  };

  const resetPinWithPhrase = async (phrase: string, newPin: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc("reset_admin_pin", { phrase_input: phrase, new_pin: newPin });
    if (error) return false;
    return data === true;
  };

  // Get effective wait time (manual takes priority)
  const getEffectiveWaitTime = (): number => {
    if (!queueState) return 30;
    return queueState.manual_wait_time ?? queueState.avg_wait_time;
  };

  return {
    queueState,
    loading,
    error,
    incrementCount,
    decrementCount,
    resetCount,
    toggleOpen,
    setAvgWaitTime,
    setManualWaitTime,
    setMessages,
    addCutDuration,
    validatePin,
    validateSecretPhrase,
    resetPinWithPhrase,
    getEffectiveWaitTime,
  };
}
