import { useProfessionals } from "@/hooks/useProfessionals";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BarbershopSceneProps {
  queueCount: number;
}

// Person figure for the waiting bench
function WaitingPerson() {
  return (
    <div className="flex flex-col items-center">
      {/* Head */}
      <div className="w-5 h-5 rounded-full bg-primary" />
      {/* Body */}
      <div className="w-6 h-8 rounded-t-lg bg-primary -mt-0.5" />
    </div>
  );
}

// Barber Pole SVG component
function BarberPole() {
  return (
    <div className="relative w-3 h-20 overflow-hidden">
      {/* Pole top cap */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-muted-foreground rounded-t-full" />
      {/* Pole bottom cap */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-muted-foreground rounded-b-full" />
      {/* Pole body with stripes */}
      <div className="absolute inset-0 bg-foreground/90 overflow-hidden">
        <div className="absolute inset-0 animate-[barber-pole_2s_linear_infinite]">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2.5 w-full",
                i % 3 === 0 && "bg-[hsl(0,84%,60%)]",
                i % 3 === 1 && "bg-foreground",
                i % 3 === 2 && "bg-[hsl(217,91%,60%)]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Barber chair with optional client
function BarberChair({ hasClient, color }: { hasClient: boolean; color: string }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Client on chair */}
      {hasClient && (
        <div className="absolute -top-10 z-10">
          {/* Head */}
          <div className="w-5 h-5 rounded-full bg-primary mx-auto" />
          {/* Body */}
          <div className="w-6 h-7 rounded-t-lg bg-primary -mt-0.5" />
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
  name, 
  color, 
  clientsInChair 
}: { 
  name: string; 
  color: string; 
  clientsInChair: number;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Professional name */}
      <span className="text-sm font-semibold text-foreground tracking-wide">
        {name}
      </span>

      {/* Station layout */}
      <div className="relative flex items-end gap-1.5">
        {/* Barber pole left */}
        <BarberPole />
        
        {/* Chair with client */}
        <BarberChair hasClient={clientsInChair > 0} color={color} />
        
        {/* Barber pole right */}
        <BarberPole />
      </div>

      {/* Action button */}
      <button
        className={cn(
          "px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wide",
          "transition-all hover:opacity-80 text-foreground"
        )}
        style={{ backgroundColor: color }}
      >
        {name}
      </button>
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

  // Distribute clients across professionals
  const numProfessionals = professionals.length;
  const clientsPerProfessional = numProfessionals > 0 
    ? Math.floor(queueCount / numProfessionals) 
    : 0;
  const remainingClients = numProfessionals > 0 
    ? queueCount % numProfessionals 
    : 0;

  // Calculate how many are in chairs vs waiting bench
  const totalChairCapacity = numProfessionals; // 1 chair per professional
  const clientsInChairs = Math.min(queueCount, totalChairCapacity);
  const clientsOnBench = Math.max(0, queueCount - totalChairCapacity);

  return (
    <div className="w-full">
      <style>{`
        @keyframes barber-pole {
          from { transform: translateY(-20px); }
          to { transform: translateY(0px); }
        }
      `}</style>

      <div className="relative bg-card rounded-2xl p-6 border border-border overflow-hidden">
        {/* Barber stations */}
        <div
          className={cn(
            "flex justify-center gap-6 sm:gap-12",
            professionals.length > 3 && "flex-wrap"
          )}
        >
          {professionals.map((professional, index) => {
            // Distribute clients: first professionals get the extra ones
            const hasClient = index < clientsInChairs;
            return (
              <BarberStation 
                key={professional.id} 
                name={professional.name}
                color={professional.color}
                clientsInChair={hasClient ? 1 : 0}
              />
            );
          })}
        </div>

        {/* Waiting bench - only show if there are clients waiting beyond chair capacity */}
        {clientsOnBench > 0 && (
          <div className="border-t border-border pt-4 mt-6">
            <p className="text-center text-xs text-muted-foreground mb-3 uppercase tracking-wider">
              Banco de espera
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {Array.from({ length: Math.min(clientsOnBench, 10) }).map((_, idx) => (
                <WaitingPerson key={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
