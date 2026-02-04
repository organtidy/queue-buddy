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

// Chair SVG component - same style as public page
function ChairIcon({ color, hasClient }: { color: string; hasClient: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Client indicator (person icon) */}
      {hasClient && (
        <div className="absolute -top-8 flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <div className="w-5 h-6 rounded-t-lg bg-primary -mt-0.5" />
        </div>
      )}
      {/* Chair */}
      <div 
        className="w-10 h-7 rounded-t-lg border-2"
        style={{ backgroundColor: color, borderColor: `color-mix(in srgb, ${color} 70%, black)` }}
      />
      <div 
        className="w-12 h-2.5 border-2 border-t-0"
        style={{ backgroundColor: color, borderColor: `color-mix(in srgb, ${color} 70%, black)` }}
      />
      {/* Arm rests */}
      <div className="absolute top-4 -left-1 w-1.5 h-3 bg-muted-foreground rounded-l" />
      <div className="absolute top-4 -right-1 w-1.5 h-3 bg-muted-foreground rounded-r" />
      {/* Base */}
      <div className="w-2 h-3 bg-muted-foreground" />
      <div className="w-6 h-1 bg-muted-foreground rounded-full" />
    </div>
  );
}

export function QueueControlCard({
  currentCount,
  isOpen,
  onIncrement,
  onDecrement,
  onReset,
  onCutComplete,
}: QueueControlCardProps) {
  const { addClientToProfessional, removeClientFromProfessional, professionals } = useProfessionals();

  // Find João and Jacson specifically
  const joao = professionals.find(p => p.name.toLowerCase().includes("joão") || p.name.toLowerCase().includes("joao"));
  const jacson = professionals.find(p => p.name.toLowerCase().includes("jacson"));

  const handleAdd = async (professionalId: string) => {
    if (!isOpen) return;
    
    try {
      await onIncrement();
      await addClientToProfessional(professionalId);
      toast({ title: "Cliente adicionado", duration: 2000 });
    } catch {
      toast({ title: "Erro ao adicionar cliente", variant: "destructive" });
    }
  };

  const handleRemove = async (professionalId: string) => {
    if (!isOpen) return;
    
    const professional = professionals.find(p => p.id === professionalId);
    if (!professional || professional.clients_queue <= 0) {
      toast({ 
        title: "Sem clientes nesta cadeira", 
        variant: "destructive" 
      });
      return;
    }

    try {
      await onDecrement();
      const cutDuration = await removeClientFromProfessional(professionalId);
      
      // If we got a valid cut duration, record it
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
    } catch {
      toast({ title: "Erro ao remover cliente", variant: "destructive" });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-center">Pessoas na Fila</CardTitle>
      </CardHeader>
      <CardContent>
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
              />
              {jacson.clients_queue > 0 && (
                <span className="text-xs text-muted-foreground">
                  {jacson.clients_queue} cliente{jacson.clients_queue > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Original large + and - buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            size="lg"
            className="h-20 text-4xl font-bold"
            onClick={() => joao && handleAdd(joao.id)}
            disabled={!isOpen || !joao}
          >
            <Plus className="w-10 h-10 mr-1" />
            João
          </Button>
          <Button
            size="lg"
            className="h-20 text-4xl font-bold"
            onClick={() => jacson && handleAdd(jacson.id)}
            disabled={!isOpen || !jacson}
          >
            <Plus className="w-10 h-10 mr-1" />
            Jacson
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            size="lg"
            variant="secondary"
            className="h-16 text-2xl font-bold"
            onClick={() => joao && handleRemove(joao.id)}
            disabled={!isOpen || !joao || (joao?.clients_queue ?? 0) === 0}
          >
            <Minus className="w-8 h-8 mr-1" />
            João
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-16 text-2xl font-bold"
            onClick={() => jacson && handleRemove(jacson.id)}
            disabled={!isOpen || !jacson || (jacson?.clients_queue ?? 0) === 0}
          >
            <Minus className="w-8 h-8 mr-1" />
            Jacson
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
