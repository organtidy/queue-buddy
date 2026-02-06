import { useProfessionals, Professional } from "@/hooks/useProfessionals";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BarbershopSceneProps {
  queueCount: number;
}

/* ── Modern Mirror with LED frame ── */
function Mirror({ color }: { color: string }) {
  return (
    <div className="relative">
      {/* LED glow behind */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-30 blur-sm"
        style={{ backgroundColor: color }}
      />
      <div
        className="relative w-20 h-28 rounded-2xl border-2 overflow-hidden"
        style={{
          borderColor: `color-mix(in srgb, ${color} 60%, hsl(var(--border)))`,
          background: `linear-gradient(170deg, hsl(var(--card)) 0%, hsl(var(--muted)) 30%, hsl(var(--card)/0.8) 100%)`,
        }}
      >
        {/* Mirror glare */}
        <div
          className="absolute top-2 right-2 w-5 h-12 rounded-full opacity-15 rotate-12"
          style={{ background: "linear-gradient(180deg, white, transparent)" }}
        />
        {/* Shelf */}
        <div className="absolute bottom-0 left-1 right-1 h-2 rounded-t bg-muted-foreground/20" />
        {/* Products on shelf */}
        <div className="absolute bottom-1.5 left-2 w-1.5 h-3 rounded-t-sm bg-muted-foreground/30" />
        <div className="absolute bottom-1.5 left-5 w-1 h-2.5 rounded-t-sm bg-muted-foreground/25" />
        <div className="absolute bottom-1.5 right-3 w-1.5 h-2 rounded-t-sm bg-muted-foreground/20" />
      </div>
    </div>
  );
}

/* ── Barber Figure with detailed apron ── */
function BarberFigure({ color }: { color: string }) {
  const darkColor = `color-mix(in srgb, ${color} 55%, black)`;
  return (
    <div className="flex flex-col items-center relative">
      {/* Head */}
      <div
        className="w-7 h-7 rounded-full border-2 relative"
        style={{ backgroundColor: color, borderColor: darkColor }}
      >
        {/* Hair */}
        <div
          className="absolute -top-1 left-0.5 right-0.5 h-3 rounded-t-full"
          style={{ backgroundColor: darkColor }}
        />
      </div>
      {/* Body */}
      <div className="relative -mt-0.5">
        {/* Torso */}
        <div className="w-10 h-12 rounded-t-md" style={{ backgroundColor: color }} />
        {/* Apron — full bib style with pocket */}
        <svg viewBox="0 0 40 48" className="absolute inset-0 w-10 h-12">
          {/* Neck strap */}
          <path d="M14 0 L20 4 L26 0" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeOpacity="0.5" />
          {/* Main apron body */}
          <path
            d="M8 6 Q20 12 32 6 L34 48 L6 48 Z"
            fill="hsl(var(--muted))"
            fillOpacity="0.92"
          />
          {/* Apron border/seam */}
          <path
            d="M8 6 Q20 12 32 6"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          {/* Pocket */}
          <rect x="13" y="24" width="14" height="8" rx="1.5"
            fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" strokeOpacity="0.35" />
          {/* Scissors in pocket */}
          <line x1="17" y1="25" x2="19" y2="29" stroke="hsl(var(--muted-foreground))" strokeWidth="0.6" strokeOpacity="0.4" />
          <line x1="21" y1="25" x2="19" y2="29" stroke="hsl(var(--muted-foreground))" strokeWidth="0.6" strokeOpacity="0.4" />
        </svg>
        {/* Arms */}
        <div className="absolute -left-2.5 top-2 w-3 h-7 rounded-full" style={{ backgroundColor: color }} />
        <div className="absolute -right-2.5 top-2 w-3 h-7 rounded-full" style={{ backgroundColor: color }} />
      </div>
      {/* Legs */}
      <div className="flex gap-0.5">
        <div className="w-3.5 h-5 rounded-b" style={{ backgroundColor: darkColor }} />
        <div className="w-3.5 h-5 rounded-b" style={{ backgroundColor: darkColor }} />
      </div>
    </div>
  );
}

/* ── Client seated on chair ── */
function ClientFigure({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-6 h-6 rounded-full border"
        style={{ backgroundColor: color, borderColor: `color-mix(in srgb, ${color} 60%, black)` }}
      />
      {/* Cape/cloth over body */}
      <div className="relative -mt-0.5">
        <div className="w-10 h-7 rounded-t-md" style={{ backgroundColor: `color-mix(in srgb, ${color} 70%, white)` }} />
        {/* Cape shimmer */}
        <div className="absolute top-1 left-1 w-2 h-4 rounded-full opacity-20 bg-white" />
      </div>
    </div>
  );
}

/* ── Modern Barber Chair ── */
function BarberChair({ color, hasClient }: { color: string; hasClient: boolean }) {
  const dark = `color-mix(in srgb, ${color} 50%, black)`;
  return (
    <div className="relative flex flex-col items-center">
      {/* Client sitting ON the chair */}
      {hasClient && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-10">
          <ClientFigure color={color} />
        </div>
      )}
      {/* Chair back */}
      <div
        className="w-14 h-10 rounded-t-lg border-2 relative overflow-hidden"
        style={{ backgroundColor: color, borderColor: dark }}
      >
        {/* Tufted cushion lines */}
        <div className="absolute top-2 left-2 right-2 space-y-1.5">
          <div className="h-px bg-black/10 rounded" />
          <div className="h-px bg-black/10 rounded" />
          <div className="h-px bg-black/10 rounded" />
        </div>
      </div>
      {/* Seat */}
      <div
        className="w-16 h-3 rounded-b-sm border-2 border-t-0"
        style={{ backgroundColor: color, borderColor: dark }}
      />
      {/* Arm rests */}
      <div className="absolute top-6 -left-2 w-2.5 h-5 rounded-l-md" style={{ backgroundColor: dark }} />
      <div className="absolute top-6 -right-2 w-2.5 h-5 rounded-r-md" style={{ backgroundColor: dark }} />
      {/* Chrome pedestal */}
      <div className="w-3 h-4 bg-muted-foreground/40 rounded-sm" />
      {/* Chrome base */}
      <div className="w-10 h-2 bg-muted-foreground/30 rounded-full" />
    </div>
  );
}

/* ── Waiting client (standing, with professional name) ── */
function WaitingClientFigure({ color, name }: { color: string; name: string }) {
  const dark = `color-mix(in srgb, ${color} 55%, black)`;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
      <div className="w-6 h-7 rounded-t-md -mt-0.5" style={{ backgroundColor: color }} />
      <div className="flex gap-px -mt-px">
        <div className="w-2.5 h-4 rounded-b" style={{ backgroundColor: dark }} />
        <div className="w-2.5 h-4 rounded-b" style={{ backgroundColor: dark }} />
      </div>
      <span className="text-[9px] font-bold uppercase mt-0.5" style={{ color }}>
        {name}
      </span>
    </div>
  );
}

/* ── Full Station ── */
function BarberStation({ professional }: { professional: Professional }) {
  const hasClient = professional.clients_queue > 0;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Name badge */}
      <div
        className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-lg"
        style={{
          backgroundColor: professional.color,
          color: "#fff",
          boxShadow: `0 4px 15px ${professional.color}40`,
        }}
      >
        {professional.name}
      </div>

      {/* Mirror */}
      <Mirror color={professional.color} />

      {/* Barber + chair side by side */}
      <div className="flex items-end gap-2">
        <div className="mb-5">
          <BarberFigure color={professional.color} />
        </div>
        <div className="flex flex-col items-center">
          <BarberChair color={professional.color} hasClient={hasClient} />
          {/* Status centered under the chair */}
          <span
            className={cn(
              "text-[11px] font-bold uppercase tracking-widest mt-2",
              hasClient ? "text-destructive" : "text-status-green"
            )}
          >
            {hasClient ? "Ocupado" : "Disponível"}
          </span>
        </div>
      </div>
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
      <div className="relative bg-card rounded-2xl border border-border overflow-hidden">
        {/* Subtle grid background for tech feel */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Checkered floor */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 opacity-[0.05]"
          style={{
            background: `repeating-conic-gradient(hsl(var(--foreground)) 0% 25%, transparent 0% 50%) 0 0 / 14px 14px`,
          }}
        />

        <div className="relative p-6 pb-10">
          {/* Stations */}
          <div
            className={cn(
              "flex justify-center gap-8 sm:gap-14",
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
              <div className="flex justify-center gap-4 flex-wrap">
                {waitingClients.slice(0, 10).map((client, idx) => (
                  <WaitingClientFigure
                    key={idx}
                    color={client.color}
                    name={client.name}
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
