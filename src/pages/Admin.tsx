import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueueState } from "@/hooks/useQueueState";
import { Scissors } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LoginForm } from "@/components/admin/LoginForm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StoreStatusCard } from "@/components/admin/StoreStatusCard";
import { QueueControlCard } from "@/components/admin/QueueControlCard";
import { SettingsCard } from "@/components/admin/SettingsCard";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showClosedTooltip, setShowClosedTooltip] = useState(false);

  const {
    queueState,
    loading,
    incrementCount,
    decrementCount,
    resetCount,
    toggleOpen,
    setAvgWaitTime,
  } = useQueueState();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action();
      toast({ title: successMessage, duration: 5000 });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleQueueAction = async (action: () => Promise<void>, successMessage: string) => {
    if (!queueState?.is_open) {
      setShowClosedTooltip(true);
      setTimeout(() => setShowClosedTooltip(false), 5000);
      return;
    }
    await handleAction(action, successMessage);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Scissors className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  if (!queueState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Erro ao carregar estado da fila</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <AdminHeader />

      <StoreStatusCard
        isOpen={queueState.is_open}
        showTooltip={showClosedTooltip}
        onToggle={() => handleAction(toggleOpen, queueState.is_open ? "Loja fechada" : "Loja aberta")}
      />

      <QueueControlCard
        currentCount={queueState.current_count}
        isOpen={queueState.is_open}
        onIncrement={() => handleQueueAction(incrementCount, "Cliente adicionado")}
        onDecrement={() => handleQueueAction(decrementCount, "Cliente removido")}
        onReset={() => handleQueueAction(resetCount, "Fila zerada")}
      />

      <SettingsCard
        avgWaitTime={queueState.avg_wait_time}
        onSave={(time) => handleAction(() => setAvgWaitTime(time), "Tempo atualizado")}
      />
    </div>
  );
}
