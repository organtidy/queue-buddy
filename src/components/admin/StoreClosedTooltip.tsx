import { forwardRef } from "react";
import { ArrowUp } from "lucide-react";

interface StoreClosedTooltipProps {
  isVisible: boolean;
}

export const StoreClosedTooltip = forwardRef<HTMLDivElement, StoreClosedTooltipProps>(
  ({ isVisible }, ref) => {
    if (!isVisible) return null;

    return (
      <div 
        ref={ref}
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-72 bg-popover border border-border rounded-lg p-4 shadow-lg z-10"
      >
        <ArrowUp className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 text-border" />
        <p className="text-sm text-foreground text-center font-medium">
          Loja Fechada - Não é possível adicionar ou remover clientes.
        </p>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Clique no botão acima para abrir a loja
        </p>
      </div>
    );
  }
);

StoreClosedTooltip.displayName = "StoreClosedTooltip";
