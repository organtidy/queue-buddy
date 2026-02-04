import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Professional {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
  current_client_time: string | null;
  next_clients: string[];
  created_at: string;
}

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessionals = async () => {
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
          }))
        );
      }
      setLoading(false);
    };

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

  const updateProfessional = async (
    id: string,
    updates: Partial<Omit<Professional, "id" | "created_at">>
  ) => {
    const { error } = await supabase
      .from("professionals")
      .update(updates)
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  };

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
    updateProfessional,
    addClientToQueue,
    removeClientFromQueue,
    setCurrentClient,
  };
}
