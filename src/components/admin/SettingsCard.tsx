import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SettingsCardProps {
  avgWaitTime: number;
  onSave: (time: number) => void;
}

export function SettingsCard({ avgWaitTime, onSave }: SettingsCardProps) {
  const [localTime, setLocalTime] = useState(avgWaitTime);

  useEffect(() => {
    setLocalTime(avgWaitTime);
  }, [avgWaitTime]);

  const handleSave = () => {
    if (localTime > 0 && localTime <= 120) {
      onSave(localTime);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="avgTime">Tempo médio por corte (minutos)</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="avgTime"
              type="number"
              min={1}
              max={120}
              value={localTime}
              onChange={(e) => setLocalTime(parseInt(e.target.value) || 0)}
              className="text-center text-xl"
            />
            <Button 
              onClick={handleSave}
              disabled={localTime === avgWaitTime || localTime <= 0 || localTime > 120}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
