import { cn } from "@/lib/utils";
import { Professional } from "@/hooks/useProfessionals";

interface BarberStationProps {
  professional: Professional;
}

// Barber Pole SVG component
function BarberPole() {
  return (
    <div className="relative w-4 h-24 overflow-hidden">
      {/* Pole top cap */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-muted-foreground rounded-t-full" />
      {/* Pole bottom cap */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-muted-foreground rounded-b-full" />
      {/* Pole body with stripes */}
      <div className="absolute inset-0 bg-foreground/90 overflow-hidden">
        <div className="absolute inset-0 animate-[barber-pole_2s_linear_infinite]">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-3 w-full",
                i % 3 === 0 && "bg-[#DC2626]",
                i % 3 === 1 && "bg-white",
                i % 3 === 2 && "bg-[#2563EB]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Barber chair SVG-like component
function BarberChair() {
  return (
    <div className="relative flex flex-col items-center">
      {/* Chair back */}
      <div className="w-16 h-12 bg-[#B91C1C] rounded-t-lg border-2 border-[#991B1B]" />
      {/* Chair seat */}
      <div className="w-20 h-4 bg-[#B91C1C] border-2 border-t-0 border-[#991B1B]" />
      {/* Chair arm rests */}
      <div className="absolute top-8 -left-2 w-3 h-6 bg-muted-foreground rounded-l" />
      <div className="absolute top-8 -right-2 w-3 h-6 bg-muted-foreground rounded-r" />
      {/* Chair base */}
      <div className="w-4 h-6 bg-muted-foreground" />
      <div className="w-12 h-2 bg-muted-foreground rounded-full" />
    </div>
  );
}

// Person figure (barber or client)
function PersonFigure({ isBarber = false }: { isBarber?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      {/* Head */}
      <div className={cn(
        "w-6 h-6 rounded-full",
        isBarber ? "bg-primary" : "bg-primary"
      )} />
      {/* Body */}
      <div className={cn(
        "w-8 h-10 rounded-t-lg -mt-1",
        isBarber ? "bg-primary" : "bg-primary"
      )} />
    </div>
  );
}

export function BarberStation({ professional }: BarberStationProps) {
  const hasCurrentClient = !!professional.current_client_time;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Professional name */}
      <span className="text-xs text-muted-foreground font-medium">
        {professional.name}
      </span>
      
      {/* Time badge if client */}
      {hasCurrentClient && (
        <span className="text-xs text-muted-foreground">
          {professional.current_client_time}
        </span>
      )}

      {/* Station layout */}
      <div className="relative flex items-end gap-2">
        {/* Barber pole left */}
        <BarberPole />
        
        {/* Chair with optional client */}
        <div className="relative flex flex-col items-center">
          {/* Client on chair */}
          {hasCurrentClient && (
            <div className="absolute -top-12 z-10">
              <PersonFigure />
            </div>
          )}
          <BarberChair />
        </div>
        
        {/* Barber pole right */}
        <BarberPole />
      </div>

      {/* Action button */}
      <button
        className={cn(
          "px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide text-foreground",
          "transition-all hover:opacity-80"
        )}
        style={{ backgroundColor: professional.color }}
      >
        {professional.name}
      </button>

      {/* Queue for next clients */}
      {professional.next_clients.length > 0 && (
        <div className="flex gap-4 mt-2">
          {professional.next_clients.slice(0, 2).map((time, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <PersonFigure />
              <span className="text-xs text-muted-foreground mt-1">{time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
