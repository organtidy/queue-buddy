import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueueState } from "@/hooks/useQueueState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Plus, Minus, RotateCcw, LogOut, Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const ADMIN_PIN = "1234"; // PIN simples para demo

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const {
    queueState,
    loading,
    incrementCount,
    decrementCount,
    resetCount,
    toggleOpen,
    setAvgWaitTime,
  } = useQueueState();

  useEffect(() => {
    // Check if user is already authenticated with Supabase
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demo purposes, also accept the hardcoded PIN
    if (pin === ADMIN_PIN) {
      // Try to sign in with the pre-created user
      const { error } = await supabase.auth.signInWithPassword({
        email: "admin@asperus.com",
        password: pin,
      });
      
      if (error) {
        // If Supabase auth fails, still allow access with PIN for demo
        setIsAuthenticated(true);
        toast({
          title: "Acesso concedido",
          description: "Bem-vindo, barbeiro!",
        });
      } else {
        setIsAuthenticated(true);
        toast({
          title: "Login realizado",
          description: "Bem-vindo de volta!",
        });
      }
    } else {
      toast({
        title: "PIN incorreto",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setPin("");
  };

  const handleAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action();
      toast({ title: successMessage });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Scissors className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Scissors className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle>Área do Barbeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <Label htmlFor="pin">PIN de Acesso</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Digite o PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-2xl tracking-widest"
                  maxLength={4}
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Entrar
              </Button>
            </form>
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

  if (!queueState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Erro ao carregar estado da fila</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Scissors className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-bold">Painel Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Store status toggle */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">Status da Loja</p>
              <p className="text-muted-foreground text-sm">
                {queueState.is_open ? "Aberta para clientes" : "Fechada"}
              </p>
            </div>
            <Switch
              checked={queueState.is_open}
              onCheckedChange={() => handleAction(toggleOpen, queueState.is_open ? "Loja fechada" : "Loja aberta")}
              variant="status"
              className="scale-150"
            />
          </div>
        </CardContent>
      </Card>

      {/* Queue counter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">Pessoas na Fila</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <span className="text-7xl font-bold text-primary">
              {queueState.current_count}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Button
              size="lg"
              className="h-24 text-3xl"
              onClick={() => handleAction(incrementCount, "Cliente adicionado")}
            >
              <Plus className="w-10 h-10" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-24 text-3xl"
              onClick={() => handleAction(decrementCount, "Cliente removido")}
              disabled={queueState.current_count === 0}
            >
              <Minus className="w-10 h-10" />
            </Button>
          </div>

          <Button
            variant="destructive"
            className="w-full h-14"
            onClick={() => handleAction(resetCount, "Fila zerada")}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Zerar Fila
          </Button>
        </CardContent>
      </Card>

      {/* Settings */}
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
                value={queueState.avg_wait_time}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value > 0 && value <= 120) {
                    handleAction(() => setAvgWaitTime(value), "Tempo atualizado");
                  }
                }}
                className="text-center text-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
