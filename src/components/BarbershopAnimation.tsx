import { useEffect, useState, useRef } from "react";
import { User, Armchair } from "lucide-react";
import { cn } from "@/lib/utils";

interface BarbershopAnimationProps {
  count: number;
}

// Barber pole component - taller and more detailed
function BarberPole() {
  return (
    <div className="relative w-6 h-32 bg-foreground/20 rounded-full overflow-hidden border-2 border-foreground/30">
      <div className="absolute inset-0 animate-[barber-pole_2s_linear_infinite]">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 w-full",
              i % 3 === 0 && "bg-status-red",
              i % 3 === 1 && "bg-foreground",
              i % 3 === 2 && "bg-blue-500"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Barber chair component - larger and more visible
function BarberChair({ hasCustomer, index }: { hasCustomer: boolean; index: number }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Customer on chair */}
      <div
        className={cn(
          "absolute -top-10 transition-all duration-500",
          hasCustomer ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}
      >
        <User className="w-10 h-10 text-primary" />
      </div>
      
      {/* Chair */}
      <Armchair className="w-20 h-20 text-status-red" />
      
      {/* Chair base */}
      <div className="w-8 h-2 bg-muted-foreground/50 rounded-full mt-1" />
    </div>
  );
}

// Person walking animation
function WalkingPerson({
  direction,
  onComplete,
}: {
  direction: "in" | "out";
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={cn(
        "absolute bottom-8 z-10",
        direction === "in"
          ? "animate-[walk-in_1s_ease-out_forwards]"
          : "animate-[walk-out_1s_ease-out_forwards]"
      )}
    >
      <User className="w-12 h-12 text-primary" />
    </div>
  );
}

export function BarbershopAnimation({ count }: BarbershopAnimationProps) {
  const previousCount = useRef(count);
  const [walkingPersons, setWalkingPersons] = useState<
    { id: number; direction: "in" | "out" }[]
  >([]);
  const [animationId, setAnimationId] = useState(0);

  useEffect(() => {
    if (previousCount.current !== count) {
      const direction = count > previousCount.current ? "in" : "out";
      const newId = animationId + 1;
      setAnimationId(newId);
      setWalkingPersons((prev) => [...prev, { id: newId, direction }]);
      previousCount.current = count;
    }
  }, [count, animationId]);

  const removeWalkingPerson = (id: number) => {
    setWalkingPersons((prev) => prev.filter((p) => p.id !== id));
  };

  // Show max 3 chairs with customers based on queue
  const chair1HasCustomer = count >= 1;
  const chair2HasCustomer = count >= 2;
  const chair3HasCustomer = count >= 3;

  return (
    <div className="w-full">
      <style>{`
        @keyframes barber-pole {
          from { transform: translateY(-32px); }
          to { transform: translateY(0px); }
        }
        @keyframes walk-in {
          from { left: -60px; opacity: 0; }
          to { left: 50%; opacity: 1; transform: translateX(-50%); }
        }
        @keyframes walk-out {
          from { left: 50%; transform: translateX(-50%); opacity: 1; }
          to { left: calc(100% + 60px); opacity: 0; }
        }
        @keyframes scissors-cut {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
        }
      `}</style>

      {/* Full width barbershop container */}
      <div className="relative bg-card rounded-2xl p-8 min-h-[280px] overflow-hidden border border-border">
        {/* Shop name banner */}
        <div className="absolute top-0 left-0 right-0 bg-primary/10 py-2 text-center border-b border-border">
          <span className="text-sm font-medium text-primary uppercase tracking-widest">Barbearia</span>
        </div>

        {/* Barber poles on sides */}
        <div className="absolute left-6 top-16 bottom-8 flex items-center">
          <BarberPole />
        </div>
        <div className="absolute right-6 top-16 bottom-8 flex items-center">
          <BarberPole />
        </div>

        {/* Main content area */}
        <div className="flex flex-col items-center justify-center pt-10">
          {/* Chairs row */}
          <div className="flex justify-center gap-8 sm:gap-16 mb-8">
            <BarberChair hasCustomer={chair1HasCustomer} index={0} />
            <BarberChair hasCustomer={chair2HasCustomer} index={1} />
            <BarberChair hasCustomer={chair3HasCustomer} index={2} />
          </div>

          {/* Count indicator - centered in the barbershop */}
          <div className="flex flex-col items-center">
            <span className="text-6xl sm:text-7xl font-bold text-primary">{count}</span>
            <span className="text-muted-foreground text-sm mt-1">
              {count === 1 ? "pessoa" : "pessoas"} na fila
            </span>
          </div>
        </div>

        {/* Floor pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-muted/50 to-transparent" />

        {/* Walking persons */}
        {walkingPersons.map((person) => (
          <WalkingPerson
            key={person.id}
            direction={person.direction}
            onComplete={() => removeWalkingPerson(person.id)}
          />
        ))}
      </div>
    </div>
  );
}
