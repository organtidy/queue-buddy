import React, { Component, ErrorInfo, ReactNode } from "react";
import { Scissors, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component tree:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4 text-center">
          <Scissors className="w-16 h-16 text-primary mb-4 opacity-70 animate-pulse" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Ops! Algo deu errado ao carregar
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            Ocorreu uma falha temporária ao inicializar a tela. Clique no botão abaixo para tentar novamente.
          </p>
          {this.state.error && (
            <p className="text-xs text-destructive/80 font-mono max-w-md bg-muted/40 p-2 rounded mb-6 break-words">
              {this.state.error.message}
            </p>
          )}
          <Button onClick={this.handleReload} variant="default" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Recarregar Filômetro
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
