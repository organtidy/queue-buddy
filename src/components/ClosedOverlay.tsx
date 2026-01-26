import { Scissors } from "lucide-react";
import { Link } from "react-router-dom";

export function ClosedOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      <Scissors className="w-24 h-24 text-primary mb-6 opacity-50" />
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
        FECHADO
      </h1>
      <p className="text-muted-foreground text-lg sm:text-xl text-center px-4">
        A barbearia está fechada no momento.
        <br />
        Volte mais tarde!
      </p>
      <Link
        to="/admin"
        className="mt-8 text-sm text-muted-foreground hover:text-foreground underline"
      >
        Área do barbeiro
      </Link>
    </div>
  );
}
