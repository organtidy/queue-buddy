import { useProfessionals, Professional } from "@/hooks/useProfessionals";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BarbershopSceneProps {
  queueCount: number;
}

// Barber figure (standing behind chair, with apron)
function BarberFigure({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      {/* Head */}
      <div 
        className="w-6 h-6 rounded-full"
        style={{ backgroundColor: color }}
      />
      {/* Body with apron */}
      <div className="relative -mt-0.5">
        {/* Torso */}
        <div 
          className="w-8 h-10 rounded-t-lg"
          style={{ backgroundColor: color }}
        />
        {/* Apron */}
        <div 
          className="absolute top-2 left-1 w-6 h-7 rounded-sm bg-muted"
          style={{ 
            borderTop: `2px solid ${color}`,
          }}
        />
      </div>
      {/* Legs */}
      <div className="flex gap-1 -mt-0.5">
        <div 
          className="w-3 h-6 rounded-b"
          style={{ backgroundColor: color }}
        />
        <div 
          className="w-3 h-6 rounded-b"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// Client figure (seated on chair)
function ClientFigure({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center">
      {/* Head */}
      <div 
        className="w-5 h-5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {/* Body (seated) */}
      <div 
        className="w-6 h-6 rounded-t-lg -mt-0.5"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// Waiting client figure (standing)
function WaitingClientFigure({ professionalColor }: { professionalColor: string }) {
  return (
    <div className="flex flex-col items-center">
      {/* Head */}
      <div 
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: professionalColor }}
      />
      {/* Body */}
      <div 
        className="w-5 h-7 rounded-t-lg -mt-0.5"
        style={{ backgroundColor: professionalColor }}
      />
      {/* Legs */}
      <div className="flex gap-0.5 -mt-0.5">
        <div 
          className="w-2 h-4 rounded-b"
          style={{ backgroundColor: professionalColor }}
        />
        <div 
          className="w-2 h-4 rounded-b"
          style={{ backgroundColor: professionalColor }}
        />
      </div>
    </div>
  );
}

// Barber chair
function BarberChair({ color }: { color: string }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Chair back */}
      <div 
        className="w-14 h-10 rounded-t-xl border-2"
        style={{ 
          backgroundColor: color, 
          borderColor: `color-mix(in srgb, ${color} 60%, black)`,
          boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.2)`
        }}
      />
      {/* Seat */}
      <div 
        className="w-16 h-3 border-2 border-t-0 rounded-b-sm"
        style={{ 
          backgroundColor: color, 
          borderColor: `color-mix(in srgb, ${color} 60%, black)` 
        }}
      />
      {/* Arm rests */}
      <div 
        className="absolute top-6 -left-2 w-2.5 h-5 rounded-l-lg"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 70%, black)` }}
      />
      <div 
        className="absolute top-6 -right-2 w-2.5 h-5 rounded-r-lg"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 70%, black)` }}
      />
      {/* Base pole */}
      <div className="w-3 h-5 bg-muted-foreground rounded-sm" />
      {/* Base */}
      <div className="w-10 h-2 bg-muted-foreground rounded-full" />
    </div>
  );
}

// Barber pole
function BarberPole() {
  return (
    <div className="flex flex-col items-center">
      {/* Top cap */}
      <div className="w-4 h-2 bg-muted-foreground rounded-t-full" />
      {/* Pole body with stripes */}
      <div className="w-3 h-16 bg-background border border-border rounded-sm overflow-hidden relative">
        <div 
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              -45deg,
              hsl(var(--destructive)),
              hsl(var(--destructive)) 4px,
              white 4px,
              white 8px,
              hsl(217 91% 60%) 8px,
              hsl(217 91% 60%) 12px,
              white 12px,
              white 16px
            )`,
            animation: 'barber-pole-spin 2s linear infinite'
          }}
        />
      </div>
      {/* Bottom cap */}
      <div className="w-4 h-2 bg-muted-foreground rounded-b-full" />
    </div>
  );
}

// Barber Station Component (pole + barber + chair + optional client)
function BarberStation({ professional }: { professional: Professional }) {
  const hasClient = professional.clients_queue > 0;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Professional name badge */}
      <div 
        className="px-3 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider"
        style={{ backgroundColor: professional.color }}
      >
        {professional.name}
      </div>

      {/* Station layout: pole - barber - chair */}
      <div className="flex items-end gap-3">
        {/* Barber pole */}
        <BarberPole />
        
        {/* Barber figure */}
        <div className="mb-6">
          <BarberFigure name={professional.name} color={professional.color} />
        </div>

        {/* Chair with optional client */}
        <div className="relative">
          {/* Client on chair */}
          {hasClient && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
              <ClientFigure color={professional.color} />
            </div>
          )}
          <BarberChair color={professional.color} />
        </div>
      </div>

      {/* Status label */}
      <span className={cn(
        "text-xs font-medium uppercase tracking-wider",
        hasClient ? "text-destructive" : "text-status-green"
      )}>
        {hasClient ? "Ocupado" : "Disponível"}
      </span>
    </div>
  );
}

export function BarbershopScene({ queueCount }: BarbershopSceneProps) {
  const { professionals, loading } = useProfessionals();

  if (loading) {
    return (
      <div className="w-full bg-card rounded-2xl p-6 border border-border">
        <div className="flex justify-center gap-8">
          <Skeleton className="w-32 h-48" />
          <Skeleton className="w-32 h-48" />
        </div>
      </div>
    );
  }

  // Build waiting list: for each professional with clients_queue > 1, 
  // show (clients_queue - 1) people waiting
  const waitingClients: { color: string; professionalId: string }[] = [];
  professionals.forEach((p) => {
    const waitingCount = Math.max(0, p.clients_queue - 1);
    for (let i = 0; i < waitingCount; i++) {
      waitingClients.push({ color: p.color, professionalId: p.id });
    }
  });

  return (
    <div className="w-full">
      {/* CSS for barber pole animation */}
      <style>{`
        @keyframes barber-pole-spin {
          from { background-position: 0 0; }
          to { background-position: 0 32px; }
        }
      `}</style>
      
      <div className="relative bg-card rounded-2xl p-6 border border-border overflow-hidden">
        {/* Barber stations */}
        <div className={cn(
          "flex justify-center gap-8 sm:gap-16",
          professionals.length > 3 && "flex-wrap"
        )}>
          {professionals.map((professional) => (
            <BarberStation key={professional.id} professional={professional} />
          ))}
        </div>

        {/* Waiting bench - only show if there are clients waiting beyond chair capacity */}
        {waitingClients.length > 0 && (
          <div className="border-t border-border pt-4 mt-6">
            <p className="text-center text-xs text-muted-foreground mb-3 uppercase tracking-wider">
              Banco de espera
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {waitingClients.slice(0, 10).map((client, idx) => (
                <WaitingClientFigure key={idx} professionalColor={client.color} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
