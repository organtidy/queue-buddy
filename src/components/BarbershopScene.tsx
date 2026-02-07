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

/* ── Client upper body on chair (back view — head + torso with cape only) ── */
function ClientFigure({ color }: { color: string }) {
  const headColor = `color-mix(in srgb, ${color} 35%, hsl(var(--muted-foreground)))`;
  const hairColor = `color-mix(in srgb, ${headColor} 30%, black)`;
  const capeColor = `color-mix(in srgb, ${color} 55%, hsl(var(--card)))`;
  const capeDark = `color-mix(in srgb, ${color} 40%, black)`;
  return (
    <svg viewBox="0 0 48 44" className="w-12 h-11">
      {/* Head */}
      <circle cx="24" cy="10" r="8.5" fill={headColor} />
      {/* Hair */}
      <path d="M15.5 8.5 Q15.5 1 24 0 Q32.5 1 32.5 8.5 Q31 5.5 24 5 Q17 5.5 15.5 8.5Z" fill={hairColor} />
      <path d="M16.5 10 Q16 13 18.5 14.5 L16.5 9Z" fill={hairColor} opacity="0.4" />
      <path d="M31.5 10 Q32 13 29.5 14.5 L31.5 9Z" fill={hairColor} opacity="0.4" />
      {/* Ears */}
      <ellipse cx="16" cy="11" rx="1.6" ry="2" fill={headColor} />
      <ellipse cx="32" cy="11" rx="1.6" ry="2" fill={headColor} />
      {/* Neck */}
      <rect x="21" y="17" width="6" height="4" rx="2.5" fill={headColor} />
      {/* Cape (shoulders + torso) */}
      <path d="M6 26 Q10 21 24 20 Q38 21 42 26 L43 44 L5 44 Z" fill={capeColor} stroke={capeDark} strokeWidth="0.6" />
      <path d="M8 25 Q12 20 24 19 Q36 20 40 25" fill="none" stroke={capeDark} strokeWidth="1" strokeOpacity="0.4" />
      {/* Fold details */}
      <path d="M16 27 Q17 34 15 43" fill="none" stroke={capeDark} strokeWidth="0.4" strokeOpacity="0.2" />
      <path d="M32 27 Q31 34 33 43" fill="none" stroke={capeDark} strokeWidth="0.4" strokeOpacity="0.2" />
      <path d="M24 22 L24 43" fill="none" stroke={capeDark} strokeWidth="0.25" strokeOpacity="0.1" />
    </svg>
  );
}

/* ── Modern Barber Chair (back view — facing mirror) ── */
function BarberChair({ color }: { color: string }) {
  const dark = `color-mix(in srgb, ${color} 50%, black)`;
  return (
    <div className="relative flex flex-col items-center">
      {/* Chair back (rounded top — seen from behind) */}
      <div
        className="w-14 h-12 rounded-t-2xl border-2 relative overflow-hidden"
        style={{ backgroundColor: color, borderColor: dark }}
      >
        {/* Upholstery stitching lines */}
        <div className="absolute top-3 left-3 right-3 space-y-2">
          <div className="h-px bg-black/10 rounded" />
          <div className="h-px bg-black/10 rounded" />
        </div>
      </div>
      {/* Seat (narrower, peeking below the back) */}
      <div
        className="w-16 h-2.5 rounded-b-sm border-2 border-t-0"
        style={{ backgroundColor: color, borderColor: dark }}
      />
      {/* Arm rests (wider, visible from back) */}
      <div className="absolute top-5 -left-3 w-3 h-6 rounded-l-lg" style={{ backgroundColor: dark }} />
      <div className="absolute top-5 -right-3 w-3 h-6 rounded-r-lg" style={{ backgroundColor: dark }} />
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

/* ── Full Station — everything centered, barber on individual side ── */
function BarberStation({ professional, barberSide, effectiveQueue }: { professional: Professional; barberSide: "left" | "right"; effectiveQueue: number }) {
  const hasClient = effectiveQueue > 0;

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

      {/* Center column: Mirror → Chair → Status (all centered) */}
      <div className="relative">
        <div className="flex flex-col items-center gap-1.5">
          <Mirror color={professional.color} />

          <div className="flex flex-col items-center relative">
            {hasClient && (
              <div className="absolute -top-8 z-0">
                <ClientFigure color={professional.color} />
              </div>
            )}
            <div className="relative z-10">
              <BarberChair color={professional.color} />
            </div>
          </div>

          <span
            className={cn(
              "text-[11px] font-bold uppercase tracking-widest",
              hasClient ? "text-destructive" : "text-status-green"
            )}
          >
            {hasClient ? "Ocupado" : "Disponível"}
          </span>
        </div>

        {/* Barber positioned on individual side */}
        <div className={cn(
          "absolute bottom-8",
          barberSide === "left" ? "-left-14" : "-right-14"
        )}>
          <BarberFigure color={professional.color} />
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

  // Calculate effective queues: distribute extra global clients to professionals
  const effectiveQueues = new Map<string, number>();
  professionals.forEach(p => effectiveQueues.set(p.id, p.clients_queue));

  const totalFromProfessionals = professionals.reduce((sum, p) => sum + p.clients_queue, 0);
  let extraClients = Math.max(0, queueCount - totalFromProfessionals);
  
  if (extraClients > 0) {
    const activeProfessionals = professionals.filter(p => p.is_active);
    // First pass: fill empty chairs
    for (const p of activeProfessionals) {
      if (extraClients <= 0) break;
      if (effectiveQueues.get(p.id)! === 0) {
        effectiveQueues.set(p.id, 1);
        extraClients--;
      }
    }
    // Second pass: distribute remaining evenly
    let i = 0;
    while (extraClients > 0) {
      const p = activeProfessionals[i % activeProfessionals.length];
      effectiveQueues.set(p.id, effectiveQueues.get(p.id)! + 1);
      extraClients--;
      i++;
    }
  }

  // Calculate waiting clients from effective queues
  const waitingClients: { color: string; name: string }[] = [];
  professionals.forEach((p) => {
    const eq = effectiveQueues.get(p.id) || 0;
    const waitingCount = Math.max(0, eq - 1);
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
            {[...professionals]
              .sort((a, b) => {
                if (a.name.toLowerCase() === "joão") return -1;
                if (b.name.toLowerCase() === "joão") return 1;
                return a.name.localeCompare(b.name);
              })
              .map((professional, index) => (
              <BarberStation
                key={professional.id}
                professional={professional}
                barberSide={index % 2 === 0 ? "left" : "right"}
                effectiveQueue={effectiveQueues.get(professional.id) || 0}
              />
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
