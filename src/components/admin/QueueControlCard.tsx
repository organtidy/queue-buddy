import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, RotateCcw } from "lucide-react";

interface QueueControlCardProps {
  currentCount: number;
  isOpen: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
}

export function QueueControlCard({
  currentCount,
  isOpen,
  onIncrement,
  onDecrement,
  onReset,
}: QueueControlCardProps) {
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
            onClick={onIncrement}
            disabled={!isOpen}
          >
            <Plus className="w-10 h-10" />
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-24 text-3xl"
            onClick={onDecrement}
            disabled={!isOpen || currentCount === 0}
          >
            <Minus className="w-10 h-10" />
          </Button>
        </div>

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
