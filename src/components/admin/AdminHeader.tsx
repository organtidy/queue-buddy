import { Scissors, Home, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onLogout: () => void;
}

export function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Scissors className="w-6 h-6 text-primary" />
        <h1 className="text-lg font-bold">Painel Admin</h1>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/">
          <Button variant="ghost" size="icon" title="Voltar para início">
            <Home className="w-5 h-5" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={onLogout} title="Sair">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}