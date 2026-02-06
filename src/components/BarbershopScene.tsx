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
        <div
          className="absolute top-2 right-2 w-5 h-12 rounded-full opacity-15 rotate-12"
          style={{ background: "linear-gradient(180deg, white, transparent)" }}
        />
        <div className="absolute bottom-0 left-1 right-1 h-2 rounded-t bg-muted-foreground/20" />
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
      <div
        className="w-7 h-7 rounded-full border-2 relative"
        style={{ backgroundColor: color, borderColor: darkColor }}
      >
        <div
          className="absolute -top-1 left-0.5 right-0.5 h-3 rounded-t-full"
          style={{ backgroundColor: darkColor }}
        />
      </div>
      <div className="relative -mt-0.5">
        <div className="w-10 h-12 rounded-t-md" style={{ backgroundColor: color }} />
        <svg viewBox="0 0 40 48" className="absolute inset-0 w-10 h-12">
          <path d="M14 0 L20 4 L26 0" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeOpacity="0.5" />
          <path d="M8 6 Q20 12 32 6 L34 48 L6 48 Z" fill="hsl(var(--muted))" fillOpacity="0.92" />
          <path d="M8 6 Q20 12 32 6" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeOpacity="0.4" />
          <rect x="13" y="24" width="14" height="8" rx="1.5" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" strokeOpacity="0.35" />
          <line x1="17" y1="25" x2="19" y2="29" stroke="hsl(var(--muted-foreground))" strokeWidth="0.6" strokeOpacity="0.4" />
          <line x1="21" y1="25" x2="19" y2="29" stroke="hsl(var(--muted-foreground))" strokeWidth="0.6" strokeOpacity="0.4" />
        </svg>
        <div className="absolute -left-2.5 top-2 w-3 h-7 rounded-full" style={{ backgroundColor: color }} />
        <div className="absolute -right-2.5 top-2 w-3 h-7 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <div className="flex gap-0.5">
        <div className="w-3.5 h-5 rounded-b" style={{ backgroundColor: darkColor }} />
        <div className="w-3.5 h-5 rounded-b" style={{ backgroundColor: darkColor }} />
      </div>
    </div>
  );
}

/* ── Client seated on chair (seen from BEHIND — looking at mirror) ── */
function ClientFigure({ color }: { color: string }) {
  const skinColor = `color-mix(in srgb, ${color} 25%, hsl(var(--muted-foreground)))`;
  const hairColor = `color-mix(in srgb, ${skinColor} 35%, black)`;
  const capeColor = `color-mix(in srgb, ${color} 45%, hsl(var(--card)))`;
  const capeDark = `color-mix(in srgb, ${color} 35%, black)`;
  const pantsColor = `color-mix(in srgb, ${skinColor} 50%, black)`;
  const shoeColor = `color-mix(in srgb, ${skinColor} 25%, black)`;
  return (
    <svg viewBox="0 0 56 80" className="w-14 h-20">
      {/* Head (back view) */}
      <circle cx="28" cy="11" r="8" fill={skinColor} />
      {/* Hair covering back of head */}
      <path
        d="M20 10 Q20 2 28 1 Q36 2 36 10 Q35 7 28 6 Q21 7 20 10Z"
        fill={hairColor}
      />
      <path d="M20 11 Q19.5 14 22 16 L20 10Z" fill={hairColor} opacity="0.5" />
      <path d="M36 11 Q36.5 14 34 16 L36 10Z" fill={hairColor} opacity="0.5" />
      {/* Ears */}
      <ellipse cx="19.5" cy="12" rx="1.8" ry="2.2" fill={skinColor} />
      <ellipse cx="36.5" cy="12" rx="1.8" ry="2.2" fill={skinColor} />
      {/* Neck */}
      <rect x="24" y="18" width="8" height="5" rx="3" fill={skinColor} />
      {/* Cape draped over shoulders and torso */}
      <path
        d="M10 27 Q14 22 28 21 Q42 22 46 27 L47 54 Q28 56 9 54 Z"
        fill={capeColor}
        stroke={capeDark}
        strokeWidth="0.7"
      />
      {/* Cape fold details */}
      <path d="M19 29 Q21 40 18 53" fill="none" stroke={capeDark} strokeWidth="0.5" strokeOpacity="0.2" />
      <path d="M37 29 Q35 40 38 53" fill="none" stroke={capeDark} strokeWidth="0.5" strokeOpacity="0.2" />
      <path d="M28 24 L28 53" fill="none" stroke={capeDark} strokeWidth="0.3" strokeOpacity="0.12" />
      {/* Cape collar */}
      <path d="M15 25 Q28 29 41 25" fill="none" stroke={capeDark} strokeWidth="1.2" strokeOpacity="0.4" />
      {/* Legs (bent, seated) */}
      <rect x="19" y="53" width="7" height="14" rx="2.5" fill={pantsColor} />
      <rect x="30" y="53" width="7" height="14" rx="2.5" fill={pantsColor} />
      {/* Lower legs / feet hanging */}
      <rect x="19" y="65" width="7" height="8" rx="2" fill={pantsColor} />
      <rect x="30" y="65" width="7" height="8" rx="2" fill={pantsColor} />
      {/* Shoes */}
      <rect x="18" y="72" width="9" height="4" rx="2" fill={shoeColor} />
      <rect x="29" y="72" width="9" height="4" rx="2" fill={shoeColor} />
    </svg>
  );
}

/* ── Modern Barber Chair ── */
function BarberChair({ color }: { color: string }) {
  const dark = `color-mix(in srgb, ${color} 50%, black)`;
  return (
    <div className="relative flex flex-col items-center">
      {/* Chair back */}
      <div
        className="w-14 h-10 rounded-t-lg border-2 relative overflow-hidden"
        style={{ backgroundColor: color, borderColor: dark }}
      >
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

/* ── Full Station — vertically centered: badge → mirror → chair(+client) + barber → status ── */
function BarberStation({ professional }: { professional: Professional }) {
  const hasClient = professional.clients_queue > 0;

  return (
    <div className="flex flex-col items-center gap-1.5">
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

      {/* Mirror — centered */}
      <Mirror color={professional.color} />

      {/* Chair area with barber to the side */}
      <div className="flex items-end gap-1">
        {/* Barber */}
        <div className="mb-4">
          <BarberFigure color={professional.color} />
        </div>

        {/* Chair + client stack, centered under mirror */}
        <div className="flex flex-col items-center">
          {hasClient && (
            <div className="-mb-8 z-10">
              <ClientFigure color={professional.color} />
            </div>
          )}
          <BarberChair color={professional.color} />
          {/* Status centered under chair */}
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
        <div
          className="absolute bottom-0 left-0 right-0 h-8 opacity-[0.05]"
          style={{
            background: `repeating-conic-gradient(hsl(var(--foreground)) 0% 25%, transparent 0% 50%) 0 0 / 14px 14px`,
          }}
        />

        <div className="relative p-6 pb-10">
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
