import { useProfessionals, Professional } from "@/hooks/useProfessionals";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BarbershopSceneProps {
  queueCount: number;
}

/* ── Animated Barber Pole (compact, modern) ── */
function BarberPole() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-3 h-1.5 rounded-t-full bg-muted-foreground/60" />
      <div className="w-2.5 h-14 rounded-sm overflow-hidden relative border border-border/50">
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              -45deg,
              #dc2626 0px, #dc2626 3px,
              #fff 3px, #fff 6px,
              #2563eb 6px, #2563eb 9px,
              #fff 9px, #fff 12px
            )`,
            animation: "barber-pole-spin 1.5s linear infinite",
          }}
        />
      </div>
      <div className="w-3 h-1.5 rounded-b-full bg-muted-foreground/60" />
    </div>
  );
}

/* ── Mirror behind station ── */
function Mirror({ color }: { color: string }) {
  return (
    <div
      className="w-16 h-20 rounded-xl border-2 relative overflow-hidden"
      style={{
        borderColor: `color-mix(in srgb, ${color} 50%, hsl(var(--border)))`,
        background: `linear-gradient(170deg, hsl(var(--card)) 0%, hsl(var(--muted)) 40%, hsl(var(--card)) 100%)`,
      }}
    >
      {/* Mirror glare */}
      <div
        className="absolute top-1 right-1 w-4 h-8 rounded-full opacity-20 rotate-12"
        style={{ background: "linear-gradient(180deg, white, transparent)" }}
      />
      {/* Shelf below mirror */}
      <div className="absolute -bottom-0.5 left-1 right-1 h-1.5 rounded-t bg-muted-foreground/30" />
    </div>
  );
}

/* ── Barber Figure with clean apron ── */
function BarberFigure({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center relative">
      {/* Head */}
      <div
        className="w-6 h-6 rounded-full border-2"
        style={{ backgroundColor: color, borderColor: `color-mix(in srgb, ${color} 60%, black)` }}
      />
      {/* Body with apron */}
      <div className="relative -mt-0.5">
        {/* Torso */}
        <div
          className="w-8 h-10 rounded-t-md"
          style={{ backgroundColor: color }}
        />
        {/* Apron overlay — V-neck style */}
        <svg viewBox="0 0 32 40" className="absolute inset-0 w-8 h-10">
          <path
            d="M4 8 L16 14 L28 8 L28 40 L4 40 Z"
            fill="hsl(var(--muted))"
            fillOpacity="0.9"
          />
          <path
            d="M4 8 L16 14 L28 8"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
        </svg>
        {/* Arms */}
        <div
          className="absolute -left-2 top-2 w-2.5 h-6 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute -right-2 top-2 w-2.5 h-6 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {/* Legs */}
      <div className="flex gap-0.5">
        <div className="w-3 h-5 rounded-b" style={{ backgroundColor: color }} />
        <div className="w-3 h-5 rounded-b" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

/* ── Client seated on chair ── */
function ClientFigure({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-5 h-5 rounded-full border"
        style={{ backgroundColor: color, borderColor: `color-mix(in srgb, ${color} 60%, black)` }}
      />
      <div
        className="w-6 h-5 rounded-t-md -mt-0.5"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

/* ── Barber Chair (modern, sleek) ── */
function BarberChairSVG({ color }: { color: string }) {
  const dark = `color-mix(in srgb, ${color} 55%, black)`;
  return (
    <div className="relative flex flex-col items-center">
      {/* Back */}
      <div
        className="w-12 h-9 rounded-t-lg border"
        style={{ backgroundColor: color, borderColor: dark }}
      />
      {/* Seat */}
      <div
        className="w-14 h-2.5 rounded-b-sm border border-t-0"
        style={{ backgroundColor: color, borderColor: dark }}
      />
      {/* Arm rests */}
      <div className="absolute top-5 -left-1.5 w-2 h-4 rounded-l" style={{ backgroundColor: dark }} />
      <div className="absolute top-5 -right-1.5 w-2 h-4 rounded-r" style={{ backgroundColor: dark }} />
      {/* Pedestal */}
      <div className="w-2 h-3 bg-muted-foreground/50 rounded-sm" />
      <div className="w-8 h-1.5 bg-muted-foreground/40 rounded-full" />
    </div>
  );
}

/* ── Waiting client (standing, with name badge) ── */
function WaitingClientFigure({ professionalColor, professionalName }: { professionalColor: string; professionalName: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: professionalColor }}
      />
      <div
        className="w-5 h-6 rounded-t-md -mt-0.5"
        style={{ backgroundColor: professionalColor }}
      />
      <div className="flex gap-px -mt-px">
        <div className="w-2 h-4 rounded-b" style={{ backgroundColor: professionalColor }} />
        <div className="w-2 h-4 rounded-b" style={{ backgroundColor: professionalColor }} />
      </div>
      <span
        className="text-[9px] font-bold uppercase mt-0.5"
        style={{ color: professionalColor }}
      >
        {professionalName}
      </span>
    </div>
  );
}

/* ── Full Barber Station ── */
function BarberStation({ professional }: { professional: Professional }) {
  const hasClient = professional.clients_queue > 0;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Name badge */}
      <div
        className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
        style={{ backgroundColor: professional.color, color: "#fff" }}
      >
        {professional.name}
      </div>

      {/* Station visual */}
      <div className="flex flex-col items-center gap-1">
        {/* Mirror */}
        <Mirror color={professional.color} />

        {/* Barber + chair row with poles */}
        <div className="flex items-end gap-1.5">
          <BarberPole />

          <div className="flex items-end gap-1">
            {/* Barber */}
            <div className="mb-4">
              <BarberFigure color={professional.color} />
            </div>

            {/* Chair with client */}
            <div className="relative">
              {hasClient && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
                  <ClientFigure color={professional.color} />
                </div>
              )}
              <BarberChairSVG color={professional.color} />
            </div>
          </div>

          <BarberPole />
        </div>
      </div>

      {/* Status */}
      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider mt-1",
          hasClient ? "text-destructive" : "text-status-green"
        )}
      >
        {hasClient ? "Ocupado" : "Disponível"}
      </span>
    </div>
  );
}

/* ── Main Scene ── */
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

  const waitingClients: { color: string; name: string }[] = [];
  professionals.forEach((p) => {
    const waitingCount = Math.max(0, p.clients_queue - 1);
    for (let i = 0; i < waitingCount; i++) {
      waitingClients.push({ color: p.color, name: p.name });
    }
  });

  return (
    <div className="w-full">
      <style>{`
        @keyframes barber-pole-spin {
          from { background-position: 0 0; }
          to { background-position: 0 24px; }
        }
      `}</style>

      <div className="relative bg-card rounded-2xl border border-border overflow-hidden">
        {/* Checkered floor pattern */}
        <div
          className="absolute bottom-0 left-0 right-0 h-6 opacity-[0.06]"
          style={{
            background: `repeating-conic-gradient(hsl(var(--foreground)) 0% 25%, transparent 0% 50%) 0 0 / 12px 12px`,
          }}
        />

        <div className="relative p-6 pb-8">
          {/* Stations */}
          <div
            className={cn(
              "flex justify-center gap-6 sm:gap-12",
              professionals.length > 3 && "flex-wrap"
            )}
          >
            {professionals.map((professional) => (
              <BarberStation key={professional.id} professional={professional} />
            ))}
          </div>

          {/* Waiting bench */}
          {waitingClients.length > 0 && (
            <div className="border-t border-border/50 pt-4 mt-6">
              <p className="text-center text-[10px] text-muted-foreground mb-3 uppercase tracking-widest">
                🪑 Banco de espera
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                {waitingClients.slice(0, 10).map((client, idx) => (
                  <WaitingClientFigure
                    key={idx}
                    professionalColor={client.color}
                    professionalName={client.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
