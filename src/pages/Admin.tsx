import { useState } from "react";
import { useQueueState } from "@/hooks/useQueueState";
import { useProfessionals } from "@/hooks/useProfessionals";
import { Scissors } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LoginForm } from "@/components/admin/LoginForm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StoreStatusCard } from "@/components/admin/StoreStatusCard";
import { QueueControlCard } from "@/components/admin/QueueControlCard";
import { SettingsCard } from "@/components/admin/SettingsCard";
import { supabase } from "@/integrations/supabase/client";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showClosedTooltip, setShowClosedTooltip] = useState(false);

  const {
    queueState,
    loading,
    incrementCount,
    decrementCount,
    resetCount,
    toggleOpen,
    setAvgWaitTime,
    setManualWaitTime,
    setMessages,
    addCutDuration,
  } = useQueueState();

  const { professionals, updateProfessional } = useProfessionals();

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

  const handleResetQueue = async () => {
    // Reset count
    await resetCount();
    
    // Reset all professionals' clients_queue to 0 and clear timers
    for (const professional of professionals) {
      await updateProfessional(professional.id, { clients_queue: 0, current_client_time: null });
    }
  };

  const handleCutComplete = async (duration: number) => {
    await addCutDuration(duration);
  };

  if (loading) {
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
        onIncrement={incrementCount}
        onDecrement={decrementCount}
        onReset={() => handleQueueAction(handleResetQueue, "Fila zerada")}
        onCutComplete={handleCutComplete}
      />

      <SettingsCard
        avgWaitTime={queueState.avg_wait_time}
        manualWaitTime={queueState.manual_wait_time}
        messageGreen={queueState.message_green}
        messageYellow={queueState.message_yellow}
        messageRed={queueState.message_red}
        onSaveAvgTime={(time) => handleAction(() => setAvgWaitTime(time), "Tempo médio atualizado")}
        onSaveManualTime={(time) => handleAction(() => setManualWaitTime(time), time === null ? "Tempo manual removido" : "Tempo manual atualizado")}
        onSaveMessages={(green, yellow, red) => handleAction(() => setMessages(green, yellow, red), "Mensagens atualizadas")}
      />
    </div>
  );
}
