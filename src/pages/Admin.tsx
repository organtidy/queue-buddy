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


export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("admin-authenticated") === "true";
  });
  const [adminPin, setAdminPin] = useState<string | null>(() => {
    return sessionStorage.getItem("admin-pin");
  });
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
  } = useQueueState(adminPin || undefined);

  const { professionals, updateProfessional } = useProfessionals(adminPin || undefined);

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
    await resetCount();
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

  if (!isAuthenticated || !adminPin) {
    return <LoginForm onSuccess={(pin) => { 
      sessionStorage.setItem("admin-authenticated", "true"); 
      sessionStorage.setItem("admin-pin", pin);
      setAdminPin(pin);
      setIsAuthenticated(true); 
    }} />;
  }

  if (!queueState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Erro ao carregar estado da fila</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <AdminHeader onLogout={() => { 
        sessionStorage.removeItem("admin-authenticated"); 
        sessionStorage.removeItem("admin-pin");
        setAdminPin(null);
        setIsAuthenticated(false); 
      }} />

      <StoreStatusCard
        isOpen={queueState.is_open}
        showTooltip={showClosedTooltip}
        onToggle={() => handleAction(toggleOpen, queueState.is_open ? "Loja fechada" : "Loja aberta")}
      />

      <QueueControlCard
        isOpen={queueState.is_open}
        onReset={() => handleAction(handleResetQueue, "Fila zerada")}
        onCutComplete={handleCutComplete}
        adminPin={adminPin}
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
