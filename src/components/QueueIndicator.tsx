import { cn } from "@/lib/utils";

interface QueueIndicatorProps {
  count: number;
  avgWaitTime: number;
}

type QueueStatus = "green" | "yellow" | "red";

function getQueueStatus(count: number): QueueStatus {
  if (count <= 2) return "green";
  if (count <= 4) return "yellow";
  return "red";
}

function getStatusMessage(status: QueueStatus): string {
  switch (status) {
    case "green":
      return "Vem que tá tranquilo!";
    case "yellow":
      return "Movimento moderado";
    case "red":
      return "Fila cheia, aguarde em casa";
  }
}

function formatWaitTime(minutes: number): string {
  if (minutes === 0) return "Sem espera";
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} minuto${remainingMinutes !== 1 ? "s" : ""}`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hora${hours !== 1 ? "s" : ""}`;
  }

  return `${hours} hora${hours !== 1 ? "s" : ""} e ${remainingMinutes} minuto${remainingMinutes !== 1 ? "s" : ""}`;
}

export function QueueIndicator({ count, avgWaitTime }: QueueIndicatorProps) {
  const status = getQueueStatus(count);
  const message = getStatusMessage(status);
  const totalWaitTime = count * avgWaitTime;
  const waitTimeFormatted = formatWaitTime(totalWaitTime);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Main circle */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-500",
          "w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80",
          "border-4",
          status === "green" && "border-status-green bg-status-green/10",
          status === "yellow" && "border-status-yellow bg-status-yellow/10",
          status === "red" && "border-status-red bg-status-red/10 animate-pulse"
        )}
      >
        {/* Glow effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-30",
            status === "green" && "bg-status-green",
            status === "yellow" && "bg-status-yellow",
            status === "red" && "bg-status-red"
          )}
        />
        
        {/* Count number */}
        <span
          className={cn(
            "relative text-7xl sm:text-8xl md:text-9xl font-bold",
            status === "green" && "text-status-green",
            status === "yellow" && "text-status-yellow",
            status === "red" && "text-status-red"
          )}
        >
          {count}
        </span>
      </div>

      {/* Status message */}
      <div
        className={cn(
          "text-xl sm:text-2xl font-semibold text-center px-4",
          status === "green" && "text-status-green",
          status === "yellow" && "text-status-yellow",
          status === "red" && "text-status-red"
        )}
      >
        {message}
      </div>

      {/* Wait time and people count - closer together */}
      <div className="text-center space-y-1">
        <p className="text-muted-foreground text-sm uppercase tracking-wider">
          Tempo estimado de espera
        </p>
        <p className="text-foreground text-2xl sm:text-3xl font-bold">
          {waitTimeFormatted}
        </p>
        <p className="text-muted-foreground text-base">
          {count === 1 ? "pessoa na fila" : "pessoas na fila"}
        </p>
      </div>
    </div>
  );
}
