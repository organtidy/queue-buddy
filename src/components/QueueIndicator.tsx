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
    <div className="flex flex-col items-center gap-6">
      {/* Main circle */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-500",
          "w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64",
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
        
        {/* Count number and people text - side by side */}
        <div className="relative flex items-baseline gap-2">
          <span
            className={cn(
              "text-6xl sm:text-7xl md:text-8xl font-bold",
              status === "green" && "text-status-green",
              status === "yellow" && "text-status-yellow",
              status === "red" && "text-status-red"
            )}
          >
            {count}
          </span>
          <span className="text-muted-foreground text-sm sm:text-base">
            {count === 1 ? "pessoa" : "pessoas"}
          </span>
        </div>
      </div>

      {/* Status message */}
      <div
        className={cn(
          "text-lg sm:text-xl font-semibold text-center px-4",
          status === "green" && "text-status-green",
          status === "yellow" && "text-status-yellow",
          status === "red" && "text-status-red"
        )}
      >
        {message}
      </div>

      {/* Wait time - modern font styling */}
      <div className="text-center space-y-1">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-light">
          Tempo estimado de espera
        </p>
        <p className="text-foreground text-xl sm:text-2xl font-semibold tracking-tight">
          {waitTimeFormatted}
        </p>
      </div>
    </div>
  );
}
