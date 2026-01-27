import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Clock, MessageSquare } from "lucide-react";

interface SettingsCardProps {
  avgWaitTime: number;
  manualWaitTime: number | null;
  messageGreen: string | null;
  messageYellow: string | null;
  messageRed: string | null;
  onSaveAvgTime: (time: number) => void;
  onSaveManualTime: (time: number | null) => void;
  onSaveMessages: (green: string, yellow: string, red: string) => void;
}

export function SettingsCard({ 
  avgWaitTime, 
  manualWaitTime,
  messageGreen,
  messageYellow,
  messageRed,
  onSaveAvgTime, 
  onSaveManualTime,
  onSaveMessages 
}: SettingsCardProps) {
  const [localAvgTime, setLocalAvgTime] = useState(avgWaitTime);
  const [localManualTime, setLocalManualTime] = useState<string>(
    manualWaitTime !== null ? String(manualWaitTime) : ""
  );
  const [localGreen, setLocalGreen] = useState(messageGreen || "Vem que tá tranquilo!");
  const [localYellow, setLocalYellow] = useState(messageYellow || "Movimento moderado");
  const [localRed, setLocalRed] = useState(messageRed || "Fila cheia, aguarde em casa");

  useEffect(() => {
    setLocalAvgTime(avgWaitTime);
  }, [avgWaitTime]);

  useEffect(() => {
    setLocalManualTime(manualWaitTime !== null ? String(manualWaitTime) : "");
  }, [manualWaitTime]);

  useEffect(() => {
    setLocalGreen(messageGreen || "Vem que tá tranquilo!");
    setLocalYellow(messageYellow || "Movimento moderado");
    setLocalRed(messageRed || "Fila cheia, aguarde em casa");
  }, [messageGreen, messageYellow, messageRed]);

  const handleSaveAvgTime = () => {
    if (localAvgTime > 0 && localAvgTime <= 120) {
      onSaveAvgTime(localAvgTime);
    }
  };

  const handleSaveManualTime = () => {
    const value = localManualTime.trim() === "" ? null : parseInt(localManualTime);
    if (value === null || (value > 0 && value <= 480)) {
      onSaveManualTime(value);
    }
  };

  const handleSaveMessages = () => {
    onSaveMessages(localGreen.trim(), localYellow.trim(), localRed.trim());
  };

  const avgTimeChanged = localAvgTime !== avgWaitTime;
  const manualTimeChanged = (localManualTime.trim() === "" ? null : parseInt(localManualTime)) !== manualWaitTime;
  const messagesChanged = 
    localGreen !== (messageGreen || "Vem que tá tranquilo!") ||
    localYellow !== (messageYellow || "Movimento moderado") ||
    localRed !== (messageRed || "Fila cheia, aguarde em casa");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Configurações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tempo médio por corte */}
        <div>
          <Label htmlFor="avgTime">Tempo médio por corte (minutos)</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="avgTime"
              type="number"
              min={1}
              max={120}
              value={localAvgTime}
              onChange={(e) => setLocalAvgTime(parseInt(e.target.value) || 0)}
              className="text-center text-xl"
            />
            <Button 
              onClick={handleSaveAvgTime}
              disabled={!avgTimeChanged || localAvgTime <= 0 || localAvgTime > 120}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Usado para calcular automaticamente o tempo de espera
          </p>
        </div>

        {/* Tempo manual */}
        <div>
          <Label htmlFor="manualTime">Tempo de espera manual (minutos)</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="manualTime"
              type="number"
              min={0}
              max={480}
              placeholder="Deixe vazio para usar cálculo automático"
              value={localManualTime}
              onChange={(e) => setLocalManualTime(e.target.value)}
              className="text-center"
            />
            <Button 
              onClick={handleSaveManualTime}
              disabled={!manualTimeChanged}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Define um tempo fixo. Deixe vazio para calcular automaticamente.
          </p>
        </div>

        {/* Mensagens personalizadas */}
        <div className="pt-4 border-t">
          <Label className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4" />
            Mensagens do Semáforo
          </Label>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="msgGreen" className="text-green-600 dark:text-green-400 text-sm">
                🟢 Verde (0-2 pessoas)
              </Label>
              <Textarea
                id="msgGreen"
                value={localGreen}
                onChange={(e) => setLocalGreen(e.target.value)}
                placeholder="Mensagem para fila vazia ou curta"
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="msgYellow" className="text-yellow-600 dark:text-yellow-400 text-sm">
                🟡 Amarelo (3-4 pessoas)
              </Label>
              <Textarea
                id="msgYellow"
                value={localYellow}
                onChange={(e) => setLocalYellow(e.target.value)}
                placeholder="Mensagem para fila moderada"
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="msgRed" className="text-red-600 dark:text-red-400 text-sm">
                🔴 Vermelho (5+ pessoas)
              </Label>
              <Textarea
                id="msgRed"
                value={localRed}
                onChange={(e) => setLocalRed(e.target.value)}
                placeholder="Mensagem para fila cheia"
                className="mt-1"
                rows={2}
              />
            </div>

            <Button 
              onClick={handleSaveMessages}
              disabled={!messagesChanged}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Mensagens
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
