import { Scissors, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ClosedOverlay() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Admin button in top right */}
      <header className="flex justify-end p-4 sm:p-6">
        <Link to="/admin">
          <Button variant="secondary" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Área do Barbeiro
          </Button>
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <Scissors className="w-24 h-24 text-primary mb-6 opacity-50" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
          FECHADO
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl text-center">
          A barbearia está fechada no momento.
          <br />
          Volte mais tarde!
        </p>
      </main>
    </div>
  );
}
