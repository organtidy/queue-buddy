import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { useProfessionals } from "@/hooks/useProfessionals";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QueueControlCardProps {
  currentCount: number;
  isOpen: boolean;
  onIncrement: () => Promise<void>;
  onDecrement: () => Promise<void>;
  onReset: () => void;
  onCutComplete?: (duration: number) => Promise<void>;
}

// Chair SVG - same style as public page
const ChairIcon = ({ 
  color, 
  hasClient, 
  isSelected,
  onClick 
}: { 
  color: string; 
  hasClient: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div 
      className={cn(
        "relative flex flex-col items-center cursor-pointer transition-all duration-200 p-2 rounded-lg",
        isSelected && "ring-2 ring-primary ring-offset-2 bg-accent/20",
        onClick && "hover:scale-105 active:scale-95"
      )}
      onClick={onClick}
    >
      {/* Client indicator (person icon) */}
      {hasClient && (
        <div className="absolute -top-10 flex flex-col items-center animate-pulse">
          <div className="w-5 h-5 rounded-full bg-primary" />
          <div className="w-6 h-7 rounded-t-lg bg-primary -mt-0.5" />
        </div>
      )}
      {/* Chair - larger and higher quality */}
      <div 
        className="w-14 h-10 rounded-t-xl border-3"
        style={{ 
          backgroundColor: color, 
          borderColor: `color-mix(in srgb, ${color} 60%, black)`,
          boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15)`
        }}
      />
      <div 
        className="w-16 h-3 border-2 border-t-0 rounded-b-sm"
        style={{ 
          backgroundColor: color, 
          borderColor: `color-mix(in srgb, ${color} 60%, black)` 
        }}
      />
      {/* Arm rests */}
      <div 
        className="absolute top-5 -left-0.5 w-2 h-4 rounded-l-md"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 70%, black)` }}
      />
      <div 
        className="absolute top-5 -right-0.5 w-2 h-4 rounded-r-md"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 70%, black)` }}
      />
      {/* Base */}
      <div className="w-3 h-4 bg-muted-foreground rounded-sm" />
      <div className="w-8 h-1.5 bg-muted-foreground rounded-full" />
    </div>
  );
};

export function QueueControlCard({
  currentCount,
  isOpen,
  onIncrement,
  onDecrement,
  onReset,
  onCutComplete,
}: QueueControlCardProps) {
  const { addClientToProfessional, removeClientFromProfessional, professionals } = useProfessionals();
  const [pendingAction, setPendingAction] = useState<"add" | "remove" | null>(null);

  // Find João and Jacson specifically
  const joao = professionals.find(p => p.name.toLowerCase().includes("joão") || p.name.toLowerCase().includes("joao"));
  const jacson = professionals.find(p => p.name.toLowerCase().includes("jacson"));

  const handleAddClick = () => {
    if (!isOpen) return;
    setPendingAction(pendingAction === "add" ? null : "add");
  };

  const handleRemoveClick = () => {
    if (!isOpen) return;
    setPendingAction(pendingAction === "remove" ? null : "remove");
  };

  const handleChairClick = async (professionalId: string) => {
    if (!isOpen || !pendingAction) return;

    const professional = professionals.find(p => p.id === professionalId);
    if (!professional) return;

    try {
      if (pendingAction === "add") {
        await onIncrement();
        await addClientToProfessional(professionalId);
        toast({ title: "Cliente adicionado", duration: 2000 });
      } else if (pendingAction === "remove") {
        if (professional.clients_queue <= 0) {
          toast({ title: "Sem clientes nesta cadeira", variant: "destructive" });
          return;
        }
        await onDecrement();
        const cutDuration = await removeClientFromProfessional(professionalId);
        
        if (cutDuration !== null && onCutComplete) {
          await onCutComplete(cutDuration);
          toast({ 
            title: "Cliente removido", 
            description: `Tempo de corte: ${cutDuration} min`,
            duration: 3000 
          });
        } else {
          toast({ title: "Cliente removido", duration: 2000 });
        }
      }
    } catch {
      toast({ title: "Erro na operação", variant: "destructive" });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-center">Pessoas na Fila</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Pending action indicator */}
        {pendingAction && (
          <div className="text-center mb-4 p-2 bg-accent rounded-lg">
            <span className="text-sm font-medium">
              {pendingAction === "add" 
                ? "Clique na cadeira para adicionar cliente" 
                : "Clique na cadeira para remover cliente"}
            </span>
          </div>
        )}

        {/* Main layout: João chair - Number - Jacson chair */}
        <div className="flex items-center justify-between gap-2 mb-6">
          {/* João (left) */}
          {joao && (
            <div className="flex flex-col items-center gap-2">
              <span 
                className="text-sm font-semibold"
                style={{ color: joao.color }}
              >
                {joao.name}
              </span>
              <ChairIcon 
                color={joao.color} 
                hasClient={joao.clients_queue > 0}
                isSelected={pendingAction !== null}
                onClick={() => handleChairClick(joao.id)}
              />
              {joao.clients_queue > 0 && (
                <span className="text-xs text-muted-foreground">
                  {joao.clients_queue} cliente{joao.clients_queue > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          {/* Queue count in the center */}
          <div className="flex-1 text-center">
            <span className="text-7xl font-bold text-primary">
              {currentCount}
            </span>
          </div>

          {/* Jacson (right) */}
          {jacson && (
            <div className="flex flex-col items-center gap-2">
              <span 
                className="text-sm font-semibold"
                style={{ color: jacson.color }}
              >
                {jacson.name}
              </span>
              <ChairIcon 
                color={jacson.color} 
                hasClient={jacson.clients_queue > 0}
                isSelected={pendingAction !== null}
                onClick={() => handleChairClick(jacson.id)}
              />
              {jacson.clients_queue > 0 && (
                <span className="text-xs text-muted-foreground">
                  {jacson.clients_queue} cliente{jacson.clients_queue > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Single Add and Remove buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            size="lg"
            className={cn(
              "h-20 text-4xl font-bold",
              pendingAction === "add" && "ring-2 ring-offset-2"
            )}
            onClick={handleAddClick}
            disabled={!isOpen}
          >
            <Plus className="w-10 h-10" />
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className={cn(
              "h-20 text-4xl font-bold",
              pendingAction === "remove" && "ring-2 ring-offset-2"
            )}
            onClick={handleRemoveClick}
            disabled={!isOpen || currentCount === 0}
          >
            <Minus className="w-10 h-10" />
          </Button>
        </div>

        {/* Reset button */}
        <Button
          variant="destructive"
          className="w-full h-14"
          onClick={onReset}
          disabled={!isOpen}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Zerar Fila
        </Button>
      </CardContent>
    </Card>
  );
}
