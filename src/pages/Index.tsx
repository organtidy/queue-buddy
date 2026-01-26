import { Scissors, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueueState } from "@/hooks/useQueueState";
import { QueueIndicator } from "@/components/QueueIndicator";
import { ClosedOverlay } from "@/components/ClosedOverlay";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { queueState, loading, error } = useQueueState();

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
        <Link
          to="/admin"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Área administrativa"
        >
          <Settings className="w-6 h-6" />
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <QueueIndicator
          count={queueState.current_count}
          avgWaitTime={queueState.avg_wait_time}
        />
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-muted-foreground text-sm">
          Atualizado em tempo real
        </p>
      </footer>

      {/* Closed overlay */}
      {!queueState.is_open && <ClosedOverlay />}
    </div>
  );
};

export default Index;
