import { Scissors, Settings, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueueState } from "@/hooks/useQueueState";
import { useQueueNotification } from "@/hooks/useQueueNotification";
import { QueueIndicator } from "@/components/QueueIndicator";
import { BarbershopScene } from "@/components/BarbershopScene";
import { ClosedOverlay } from "@/components/ClosedOverlay";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { queueState, loading, error } = useQueueState();
  
  // Play sound notification when queue count changes
  const { isMuted, toggleMute } = useQueueNotification(queueState?.current_count);

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

  // Show closed overlay only when shop is actually closed
  if (!queueState.is_open) {
    return <ClosedOverlay />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Scissors className="w-8 h-8 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Filômetro <span className="text-primary">Ásperus</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            aria-label={isMuted ? "Ativar som" : "Silenciar"}
            className="text-muted-foreground hover:text-foreground"
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

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <QueueIndicator
          count={queueState.current_count}
          avgWaitTime={queueState.avg_wait_time}
        />
        
        {/* Barbershop scene with professionals */}
        <BarbershopScene queueCount={queueState.current_count} />
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-muted-foreground text-sm">
          Atualizado em tempo real
        </p>
      </footer>
    </div>
  );
};

export default Index;
