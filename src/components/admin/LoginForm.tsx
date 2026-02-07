import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Home, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useQueueState } from "@/hooks/useQueueState";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [secretPhrase, setSecretPhrase] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [phraseVerified, setPhraseVerified] = useState(false);

  const { validatePin, validateSecretPhrase, resetPinWithPhrase } = useQueueState();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const isValid = await validatePin(pin);

    if (isValid) {
      toast({
        title: "Login realizado",
        description: "Bem-vindo de volta!",
      });
      onSuccess();
    } else {
      toast({
        title: "PIN incorreto",
        description: "Verifique o PIN e tente novamente",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleVerifyPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const isValid = await validateSecretPhrase(secretPhrase);

    if (isValid) {
      setPhraseVerified(true);
      toast({
        title: "Frase verificada!",
        description: "Agora você pode definir um novo PIN.",
      });
    } else {
      toast({
        title: "Frase incorreta",
        description: "A frase secreta não confere",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPin.length !== 4) {
      toast({
        title: "PIN inválido",
        description: "O PIN deve ter 4 dígitos",
        variant: "destructive",
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "PINs não conferem",
        description: "Os PINs digitados são diferentes",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await resetPinWithPhrase(secretPhrase, newPin);
      if (!success) throw new Error("Falha ao redefinir PIN");
      toast({
        title: "PIN atualizado!",
        description: "Seu novo PIN foi salvo com sucesso.",
      });
      // Reset state and go back to login
      setShowForgotPin(false);
      setPhraseVerified(false);
      setSecretPhrase("");
      setNewPin("");
      setConfirmPin("");
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o PIN",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  if (showForgotPin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <KeyRound className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle>Redefinir PIN</CardTitle>
          </CardHeader>
          <CardContent>
            {!phraseVerified ? (
              <form onSubmit={handleVerifyPhrase} className="space-y-4">
                <div>
                  <Label htmlFor="secretPhrase">Frase secreta</Label>
                  <Input
                    id="secretPhrase"
                    type="text"
                    placeholder="Digite sua frase secreta"
                    value={secretPhrase}
                    onChange={(e) => setSecretPhrase(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Verificando..." : "Verificar frase"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowForgotPin(false);
                    setSecretPhrase("");
                  }}
                >
                  Voltar ao login
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPin} className="space-y-4">
                <div>
                  <Label htmlFor="newPin">Novo PIN (4 dígitos)</Label>
                  <Input
                    id="newPin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPin">Confirmar novo PIN</Label>
                  <Input
                    id="confirmPin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar novo PIN"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowForgotPin(false);
                    setPhraseVerified(false);
                    setSecretPhrase("");
                    setNewPin("");
                    setConfirmPin("");
                  }}
                >
                  Cancelar
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Scissors className="w-12 h-12 text-primary mx-auto mb-2" />
          <CardTitle>Área do Barbeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="pin">PIN (4 dígitos)</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                required
                className="text-center text-2xl tracking-[0.5em]"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading || pin.length !== 4}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          
          <button
            type="button"
            onClick={() => setShowForgotPin(true)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
          >
            Esqueci meu PIN
          </button>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 mt-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            Voltar para início
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
