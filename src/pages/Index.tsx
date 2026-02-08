import { useState, useRef, useCallback } from "react";
import { Scissors, Settings, Volume2, VolumeX, Bell, BellOff, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueueState } from "@/hooks/useQueueState";
import { useQueueNotification } from "@/hooks/useQueueNotification";
import { QueueIndicatorWithScene } from "@/components/QueueIndicatorWithScene";
import { ClosedOverlay } from "@/components/ClosedOverlay";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { queueState, loading, error, refetch } = useQueueState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const profRefetchRef = useRef<(() => Promise<void>) | null>(null);
  
  const { isMuted, toggleMute, notificationsEnabled, requestNotificationPermission } =
    useQueueNotification(queueState?.current_count);

  const handleProfRefetchReady = useCallback((fn: () => Promise<void>) => {
    profRefetchRef.current = fn;
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        profRefetchRef.current?.(),
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Skeleton className="w-56 h-56 sm:w-72 sm:h-72 rounded-full" />
        <Skeleton className="h-8 w-48 mt-8" />
        <Skeleton className="h-6 w-32 mt-4" />
      </div>
    );
  }

  if (error || !queueState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <p className="text-destructive text-xl">Erro ao carregar dados</p>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  if (!queueState.is_open) {
    return <ClosedOverlay />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background pt-[env(safe-area-inset-top)]">
      <header className="flex items-center justify-between px-3 py-2 sm:p-6">
        <div className="flex items-center gap-3">
          <Scissors className="w-8 h-8 text-primary" />
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Filômetro <span className="text-primary font-bold">Ásperus</span>
          </h1>
        </div>
        <div className="flex items-center gap-1">
          {!notificationsEnabled && (
            <Button
              variant="ghost"
              size="icon"
              onClick={requestNotificationPermission}
              aria-label="Ativar notificações"
              className="text-muted-foreground hover:text-foreground"
              title="Ativar notificações do navegador"
            >
              <BellOff className="w-5 h-5" />
            </Button>
          )}
          {notificationsEnabled && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notificações ativadas"
              className="text-primary cursor-default"
              title="Notificações ativadas"
            >
              <Bell className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            aria-label={isMuted ? "Ativar som" : "Silenciar"}
            className="text-muted-foreground hover:text-foreground"
            title={isMuted ? "Ativar som" : "Silenciar notificações sonoras"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Link to="/admin">
            <Button variant="secondary" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Área do Barbeiro
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-3 py-2 gap-4">
        <QueueIndicatorWithScene
          avgWaitTime={queueState.avg_wait_time}
          onRefetchReady={handleProfRefetchReady}
        />
      </main>

      <footer className="py-3 flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="lg"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 text-base px-6"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Atualizando..." : "Atualizar fila"}
        </Button>
        <p className="text-muted-foreground text-xs">
          Atualizado em tempo real
        </p>
      </footer>
    </div>
  );
};

export default Index;
