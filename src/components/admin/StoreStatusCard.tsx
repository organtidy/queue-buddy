import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { StoreClosedTooltip } from "./StoreClosedTooltip";

interface StoreStatusCardProps {
  isOpen: boolean;
  showTooltip: boolean;
  onToggle: () => void;
}

export function StoreStatusCard({ isOpen, showTooltip, onToggle }: StoreStatusCardProps) {
  return (
    <Card className="mb-6 relative">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">Status da Loja</p>
            <p className="text-muted-foreground text-sm">
              {isOpen ? "Aberta para clientes" : "Fechada"}
            </p>
          </div>
          <Switch
            checked={isOpen}
            onCheckedChange={onToggle}
            variant="status"
            className="scale-150"
          />
        </div>
        <StoreClosedTooltip isVisible={showTooltip} />
      </CardContent>
    </Card>
  );
}
