import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks how many users are currently viewing the page
 * using Supabase Realtime Presence.
 */
export function useOnlinePresence() {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const presenceKey = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `user_${Math.random().toString(36).substring(2)}_${Date.now()}`;

    const channel = supabase.channel("online-users", {
      config: { presence: { key: presenceKey } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return onlineCount;
}
