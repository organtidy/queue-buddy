import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { BarbershopScene } from "@/components/BarbershopScene";
import { useProfessionals } from "@/hooks/useProfessionals";
import { toast } from "@/hooks/use-toast";

interface QueueControlCardProps {
  currentCount: number;
  isOpen: boolean;
  onIncrement: () => Promise<void>;
  onDecrement: () => Promise<void>;
  onReset: () => void;
}

export function QueueControlCard({
  currentCount,
  isOpen,
  onIncrement,
  onDecrement,
  onReset,
}: QueueControlCardProps) {
  const [pendingAction, setPendingAction] = useState<"add" | "remove" | null>(null);
  const { addClientToProfessional, removeClientFromProfessional, professionals } = useProfessionals();

  const handleAddClick = async () => {
    if (!isOpen) return;
    
    // If only one professional, do everything in one click
    if (professionals.length === 1) {
      try {
        await onIncrement();
        await addClientToProfessional(professionals[0].id);
        toast({ title: "Cliente adicionado", duration: 3000 });
      } catch {
        toast({ title: "Erro ao adicionar cliente", variant: "destructive" });
      }
      return;
    }
    
    // Otherwise, wait for chair selection
    setPendingAction("add");
    toast({ 
      title: "Clique na cadeira do profissional", 
      description: "Selecione a cadeira para adicionar o cliente",
      duration: 5000 
    });
  };

  const handleRemoveClick = async () => {
    if (!isOpen || currentCount === 0) return;
    
    // If only one professional, do everything in one click
    if (professionals.length === 1) {
      try {
        await onDecrement();
        await removeClientFromProfessional(professionals[0].id);
        toast({ title: "Cliente removido", duration: 3000 });
      } catch {
        toast({ title: "Erro ao remover cliente", variant: "destructive" });
      }
      return;
    }
    
    // Otherwise, wait for chair selection
    setPendingAction("remove");
    toast({ 
      title: "Clique na cadeira do profissional", 
      description: "Selecione a cadeira para remover o cliente",
      duration: 5000 
    });
  };

  const handleChairClick = async (professionalId: string) => {
    if (!pendingAction) return;

    try {
      if (pendingAction === "add") {
        await onIncrement();
        await addClientToProfessional(professionalId);
        toast({ title: "Cliente adicionado", duration: 3000 });
      } else {
        const professional = professionals.find(p => p.id === professionalId);
        if (!professional || professional.clients_queue <= 0) {
          toast({ 
            title: "Sem clientes nesta cadeira", 
            description: "Escolha outra cadeira",
            variant: "destructive" 
          });
          return;
        }
        await onDecrement();
        await removeClientFromProfessional(professionalId);
        toast({ title: "Cliente removido", duration: 3000 });
      }
    } catch {
      toast({ 
        title: "Erro", 
        description: "Não foi possível completar a ação",
        variant: "destructive" 
      });
    }

    setPendingAction(null);
  };

  const handleCancelAction = () => {
    setPendingAction(null);
    toast({ title: "Ação cancelada", duration: 2000 });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-center">Pessoas na Fila</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <span className="text-7xl font-bold text-primary">
            {currentCount}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            size="lg"
            className="h-24 text-3xl"
            onClick={handleAddClick}
            disabled={!isOpen || pendingAction !== null}
          >
            <Plus className="w-10 h-10" />
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-24 text-3xl"
            onClick={handleRemoveClick}
            disabled={!isOpen || currentCount === 0 || pendingAction !== null}
          >
            <Minus className="w-10 h-10" />
          </Button>
        </div>

        {/* Barbershop scene for chair selection */}
        {pendingAction && (
          <div className="mb-4">
            <p className="text-center text-sm text-muted-foreground mb-3">
              Clique na cadeira do profissional para {pendingAction === "add" ? "adicionar" : "remover"} o cliente
            </p>
            <BarbershopScene 
              queueCount={currentCount}
              isAdmin={true}
              pendingAction={pendingAction}
              onChairClick={handleChairClick}
            />
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={handleCancelAction}
            >
              Cancelar
            </Button>
          </div>
        )}

        <Button
          variant="destructive"
          className="w-full h-14"
          onClick={onReset}
          disabled={!isOpen || pendingAction !== null}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Zerar Fila
        </Button>
      </CardContent>
    </Card>
  );
}
