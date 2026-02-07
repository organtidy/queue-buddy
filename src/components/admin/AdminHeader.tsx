import { Scissors, Home, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onLogout: () => void;
}

export function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Scissors className="w-6 h-6 text-primary" />
        <h1 className="text-lg font-bold">Painel Admin</h1>
      </div>
      <div className="flex items-center gap-1">
        <Link to="/">
          <Button variant="outline" size="sm" className="h-10 px-3 gap-1.5">
            <Home className="w-4 h-4" />
            <span className="text-xs">Início</span>
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="h-10 px-3 gap-1.5" onClick={onLogout}>
          <LogOut className="w-4 h-4" />
          <span className="text-xs">Sair</span>
        </Button>
      </div>
    </header>
  );
}