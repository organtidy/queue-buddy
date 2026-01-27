import { useEffect, useState, useRef } from "react";
import { User, Armchair } from "lucide-react";
import { cn } from "@/lib/utils";

interface BarbershopAnimationProps {
  count: number;
}

// Barber pole component
function BarberPole() {
  return (
    <div className="relative w-4 h-24 bg-foreground/20 rounded-full overflow-hidden">
      <div className="absolute inset-0 animate-[barber-pole_2s_linear_infinite]">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 w-full",
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

// Barber chair component
function BarberChair({ hasCustomer }: { hasCustomer: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Customer on chair */}
      <div
        className={cn(
          "absolute -top-8 transition-all duration-500",
          hasCustomer ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}
      >
        <User className="w-8 h-8 text-primary" />
      </div>
      
      {/* Chair */}
      <Armchair className="w-16 h-16 text-status-red" />
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
        "absolute bottom-4 z-10",
        direction === "in"
          ? "animate-[walk-in_1s_ease-out_forwards]"
          : "animate-[walk-out_1s_ease-out_forwards]"
      )}
    >
      <User className="w-10 h-10 text-primary" />
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

  // Show max 2 chairs with customers based on queue
  const chair1HasCustomer = count >= 1;
  const chair2HasCustomer = count >= 2;

  return (
    <div className="w-full max-w-md mx-auto">
      <style>{`
        @keyframes barber-pole {
          from { transform: translateY(-24px); }
          to { transform: translateY(0px); }
        }
        @keyframes walk-in {
          from { left: -40px; opacity: 0; }
          to { left: 50%; opacity: 1; transform: translateX(-50%); }
        }
        @keyframes walk-out {
          from { left: 50%; transform: translateX(-50%); opacity: 1; }
          to { left: calc(100% + 40px); opacity: 0; }
        }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Armchair className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Movimentação do Dia</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Acompanhe a quantidade de agendamentos do dia
      </p>

      {/* Animation container */}
      <div className="relative bg-card rounded-lg p-6 min-h-[180px] overflow-hidden border border-border">
        {/* Barber poles */}
        <div className="absolute left-4 top-4">
          <BarberPole />
        </div>
        <div className="absolute right-4 top-4">
          <BarberPole />
        </div>

        {/* Chairs */}
        <div className="flex justify-center gap-12 mt-8">
          <BarberChair hasCustomer={chair1HasCustomer} />
          <BarberChair hasCustomer={chair2HasCustomer} />
        </div>

        {/* Count indicator */}
        <div className="text-center mt-6">
          <span className="text-5xl font-bold text-primary">{count}</span>
        </div>

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
