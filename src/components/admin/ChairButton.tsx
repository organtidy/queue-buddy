import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChairButtonProps {
  professionalName: string;
  professionalColor: string;
  clientsQueue: number;
  onAdd: () => void;
  onRemove: () => void;
  disabled?: boolean;
  position: "left" | "right";
}

export function ChairButton({
  professionalName,
  professionalColor,
  clientsQueue,
  onAdd,
  onRemove,
  disabled = false,
  position,
}: ChairButtonProps) {
  const hasClients = clientsQueue > 0;

  return (
    <div className={cn(
      "flex flex-col items-center gap-2",
      position === "left" ? "items-start" : "items-end"
    )}>
      {/* Chair SVG with client indicator */}
      <div 
        className={cn(
          "relative w-16 h-16 rounded-lg flex items-center justify-center transition-all",
          hasClients 
            ? "bg-primary/20 ring-2 ring-primary" 
            : "bg-muted"
        )}
        style={{ 
          borderColor: professionalColor,
          borderWidth: hasClients ? 2 : 0,
        }}
      >
        {/* Chair icon */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          {/* Seat */}
          <rect x="4" y="8" width="16" height="4" rx="1" fill={hasClients ? professionalColor : "currentColor"} opacity={hasClients ? 0.8 : 0.3} />
          {/* Back */}
          <rect x="4" y="2" width="16" height="6" rx="1" fill={hasClients ? professionalColor : "currentColor"} opacity={hasClients ? 0.6 : 0.2} />
          {/* Legs */}
          <line x1="6" y1="12" x2="6" y2="22" strokeWidth="2" />
          <line x1="18" y1="12" x2="18" y2="22" strokeWidth="2" />
        </svg>
        
        {/* Client count badge */}
        {clientsQueue > 0 && (
          <div 
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
            style={{ backgroundColor: professionalColor }}
          >
            {clientsQueue}
          </div>
        )}
      </div>
      
      {/* Professional name */}
      <span 
        className="text-sm font-medium"
        style={{ color: professionalColor }}
      >
        {professionalName}
      </span>
      
      {/* Action buttons */}
      <div className="flex gap-1">
        <Button
          size="icon"
          variant="default"
          className="h-10 w-10"
          onClick={onAdd}
          disabled={disabled}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10"
          onClick={onRemove}
          disabled={disabled || clientsQueue === 0}
        >
          <Minus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
