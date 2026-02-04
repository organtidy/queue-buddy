import { useProfessionals, Professional } from "@/hooks/useProfessionals";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BarbershopSceneProps {
  queueCount: number;
}

// Person figure with name label
function PersonFigure({ name }: { name?: string }) {
  return (
    <div className="flex flex-col items-center">
      {/* Name above head */}
      {name && (
        <span className="text-[10px] font-semibold text-primary mb-0.5 whitespace-nowrap">
          {name}
        </span>
      )}
      {/* Head */}
      <div className="w-5 h-5 rounded-full bg-primary" />
      {/* Body */}
      <div className="w-6 h-8 rounded-t-lg bg-primary -mt-0.5" />
    </div>
  );
}

// Barber chair with optional client
function BarberChairPublic({ 
  hasClient, 
  color, 
  clientName,
  isOccupied 
}: { 
  hasClient: boolean; 
  color: string;
  clientName?: string;
  isOccupied: boolean;
}) {
  const dimmed = isOccupied;
  
  return (
    <div className={cn(
      "relative flex flex-col items-center transition-all",
      dimmed && !hasClient && "opacity-40"
    )}>
      {/* Client on chair */}
      {hasClient && (
        <div className="absolute -top-14 z-10">
          <PersonFigure name={clientName} />
        </div>
      )}
      {/* Chair back */}
      <div 
        className="w-12 h-9 rounded-t-lg border-2"
        style={{ backgroundColor: color, borderColor: `color-mix(in srgb, ${color} 70%, black)` }}
      />
      {/* Chair seat */}
      <div 
        className="w-14 h-3 border-2 border-t-0"
        style={{ backgroundColor: color, borderColor: `color-mix(in srgb, ${color} 70%, black)` }}
      />
      {/* Chair arm rests */}
      <div className="absolute top-6 -left-1.5 w-2 h-4 bg-muted-foreground rounded-l" />
      <div className="absolute top-6 -right-1.5 w-2 h-4 bg-muted-foreground rounded-r" />
      {/* Chair base */}
      <div className="w-3 h-4 bg-muted-foreground" />
      <div className="w-8 h-1.5 bg-muted-foreground rounded-full" />
    </div>
  );
}

// Barber Station Component
function BarberStation({ 
  professional
}: { 
  professional: Professional;
}) {
  const hasClient = professional.clients_queue > 0;
  const isOccupied = hasClient;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Professional name */}
      <span className="text-sm font-semibold text-foreground tracking-wide">
        {professional.name}
      </span>

      {/* Chair with client */}
      <BarberChairPublic 
        hasClient={hasClient} 
        color={professional.color}
        clientName={hasClient ? professional.name : undefined}
        isOccupied={isOccupied}
      />

      {/* Status label */}
      <span className={cn(
        "text-xs font-medium uppercase tracking-wider",
        isOccupied ? "text-destructive" : "text-status-green"
      )}>
        {isOccupied ? "Ocupado" : "Disponível"}
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

  // Build waiting bench: for each professional with clients_queue > 1, 
  // show (clients_queue - 1) people waiting with that professional's name
  const waitingClients: { name: string; professionalId: string }[] = [];
  professionals.forEach((p) => {
    const waitingCount = Math.max(0, p.clients_queue - 1);
    for (let i = 0; i < waitingCount; i++) {
      waitingClients.push({ name: p.name, professionalId: p.id });
    }
  });

  return (
    <div className="w-full">
      <div className="relative bg-card rounded-2xl p-6 border border-border overflow-hidden">
        {/* Barber stations */}
        <div
          className={cn(
            "flex justify-center gap-6 sm:gap-12",
            professionals.length > 3 && "flex-wrap"
          )}
        >
          {professionals.map((professional) => (
            <BarberStation 
              key={professional.id} 
              professional={professional}
            />
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
                <PersonFigure key={idx} name={client.name} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
