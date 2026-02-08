import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Professional {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
  current_client_time: string | null;
  next_clients: string[];
  clients_queue: number;
  created_at: string;
}

export interface CutDuration {
  duration: number;
  timestamp: string;
}

const MIN_CUT_DURATION = 5; // minutes
const MAX_CUT_DURATION = 120; // minutes
const MAX_STORED_CUTS = 10;

export function useProfessionals(adminPin?: string) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const profRef = useRef<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep ref in sync
  useEffect(() => {
    profRef.current = professionals;
  }, [professionals]);

  const fetchProfessionals = useCallback(async () => {
    const { data, error } = await supabase
      .from("professionals")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setProfessionals(
        (data || []).map((p) => ({
          ...p,
          next_clients: Array.isArray(p.next_clients) 
            ? (p.next_clients as string[]) 
            : [],
          clients_queue: p.clients_queue ?? 0,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfessionals();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("professionals_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "professionals",
        },
        () => {
          fetchProfessionals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateProfessional = useCallback(async (
    id: string,
    updates: Partial<Omit<Professional, "id" | "created_at">>
  ) => {
    if (!adminPin) throw new Error("Not authorized");

    const { data, error } = await supabase.rpc("admin_update_professional" as any, {
      pin_input: adminPin,
      prof_id: id,
      updates: updates,
    });

    if (error || data === false) {
      throw new Error(error?.message || "PIN inválido");
    }
  }, [adminPin]);

  const addClientToProfessional = useCallback(async (professionalId: string) => {
    const professional = profRef.current.find((p) => p.id === professionalId);
    if (!professional) return;

    const newCount = professional.clients_queue + 1;
    const updates: Partial<Professional> = { clients_queue: newCount };
    
    if (professional.clients_queue === 0) {
      updates.current_client_time = new Date().toISOString();
    }

    // Optimistic local update
    setProfessionals(prev => prev.map(p => 
      p.id === professionalId 
        ? { ...p, clients_queue: newCount, current_client_time: updates.current_client_time ?? p.current_client_time }
        : p
    ));

    await updateProfessional(professionalId, updates);
  }, [updateProfessional]);

  const removeClientFromProfessional = useCallback(async (professionalId: string): Promise<number | null> => {
    const professional = profRef.current.find((p) => p.id === professionalId);
    if (!professional || professional.clients_queue <= 0) return null;

    let cutDuration: number | null = null;

    if (professional.current_client_time) {
      const startTime = new Date(professional.current_client_time);
      const now = new Date();
      const durationMinutes = Math.round((now.getTime() - startTime.getTime()) / 60000);
      if (durationMinutes >= MIN_CUT_DURATION && durationMinutes <= MAX_CUT_DURATION) {
        cutDuration = durationMinutes;
      }
    }

    const newCount = professional.clients_queue - 1;
    const newTime = newCount > 0 ? new Date().toISOString() : null;
    
    // Optimistic local update
    setProfessionals(prev => prev.map(p => 
      p.id === professionalId 
        ? { ...p, clients_queue: newCount, current_client_time: newTime }
        : p
    ));

    await updateProfessional(professionalId, { 
      clients_queue: newCount, 
      current_client_time: newTime 
    });
    
    return cutDuration;
  }, [updateProfessional]);

  const addClientToQueue = async (professionalId: string, time: string) => {
    const professional = professionals.find((p) => p.id === professionalId);
    if (!professional) return;

    const newClients = [...professional.next_clients, time];
    await updateProfessional(professionalId, { next_clients: newClients });
  };

  const removeClientFromQueue = async (professionalId: string) => {
    const professional = professionals.find((p) => p.id === professionalId);
    if (!professional) return;

    const newClients = professional.next_clients.slice(1);
    await updateProfessional(professionalId, { next_clients: newClients });
  };

  const setCurrentClient = async (
    professionalId: string,
    time: string | null
  ) => {
    await updateProfessional(professionalId, { current_client_time: time });
  };

  return {
    professionals,
    loading,
    error,
    refetch: fetchProfessionals,
    updateProfessional,
    addClientToProfessional,
    removeClientFromProfessional,
    addClientToQueue,
    removeClientFromQueue,
    setCurrentClient,
    MIN_CUT_DURATION,
    MAX_CUT_DURATION,
    MAX_STORED_CUTS,
  };
}
