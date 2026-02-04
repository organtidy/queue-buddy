import { useProfessionals } from "@/hooks/useProfessionals";
import { BarberStation } from "@/components/BarberStation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BarbershopSceneProps {
  queueCount: number;
}

// Person figure for the general queue
function QueuePerson({ time }: { time: string }) {
  return (
    <div className="flex flex-col items-center">
      {/* Head */}
      <div className="w-5 h-5 rounded-full bg-primary" />
      {/* Body */}
      <div className="w-6 h-8 rounded-t-lg bg-primary -mt-0.5" />
      {/* Time */}
      <span className="text-xs text-muted-foreground mt-1">{time}</span>
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

  return (
    <div className="w-full">
      <style>{`
        @keyframes barber-pole {
          from { transform: translateY(-24px); }
          to { transform: translateY(0px); }
        }
      `}</style>

      <div className="relative bg-card rounded-2xl p-6 border border-border overflow-hidden">
        {/* Barber stations */}
        <div
          className={cn(
            "flex justify-center gap-8 sm:gap-16",
            professionals.length > 2 && "flex-wrap"
          )}
        >
          {professionals.map((professional) => (
            <BarberStation key={professional.id} professional={professional} />
          ))}
        </div>

        {/* Queue count in center */}
        <div className="flex flex-col items-center my-8">
          <span className="text-6xl sm:text-7xl font-bold text-primary">
            {queueCount}
          </span>
        </div>

        {/* General queue visualization */}
        {queueCount > 0 && (
          <div className="border-t border-border pt-4">
            <div className="flex justify-center gap-6 flex-wrap">
              {/* Show waiting people based on queue count - simplified times */}
              {Array.from({ length: Math.min(queueCount, 8) }).map((_, idx) => {
                const hour = 17 + Math.floor(idx / 2);
                const minute = (idx % 2) * 30;
                const time = `${hour}:${minute.toString().padStart(2, "0")}`;
                return <QueuePerson key={idx} time={time} />;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
