import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useProfessionals } from "@/hooks/useProfessionals";
import { toast } from "@/hooks/use-toast";
import { ChairButton } from "./ChairButton";

interface QueueControlCardProps {
  currentCount: number;
  isOpen: boolean;
  onIncrement: () => Promise<void>;
  onDecrement: () => Promise<void>;
  onReset: () => void;
  onCutComplete?: (duration: number) => Promise<void>;
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
        {/* Main layout: João - Number - Jacson */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* João (left) */}
          {joao ? (
            <ChairButton
              professionalName={joao.name}
              professionalColor={joao.color}
              clientsQueue={joao.clients_queue}
              onAdd={() => handleAdd(joao.id)}
              onRemove={() => handleRemove(joao.id)}
              disabled={!isOpen}
              position="left"
            />
          ) : (
            <div className="w-16" /> // Placeholder if not found
          )}

          {/* Queue count in the center */}
          <div className="flex-1 text-center">
            <span className="text-7xl font-bold text-primary">
              {currentCount}
            </span>
          </div>

          {/* Jacson (right) */}
          {jacson ? (
            <ChairButton
              professionalName={jacson.name}
              professionalColor={jacson.color}
              clientsQueue={jacson.clients_queue}
              onAdd={() => handleAdd(jacson.id)}
              onRemove={() => handleRemove(jacson.id)}
              disabled={!isOpen}
              position="right"
            />
          ) : (
            <div className="w-16" /> // Placeholder if not found
          )}
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
