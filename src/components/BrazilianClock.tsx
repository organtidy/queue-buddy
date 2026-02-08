import { useState, useEffect } from "react";

function getBrazilianDateTime() {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const dateStr = now.toLocaleDateString("pt-BR", options);
  // Capitalize first letter
  const capitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const timeStr = now.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return { date: capitalized, time: timeStr };
}

export function BrazilianClock() {
  const [clock, setClock] = useState(getBrazilianDateTime);

  useEffect(() => {
    const interval = setInterval(() => setClock(getBrazilianDateTime()), 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center space-y-0.5">
      <p className="text-muted-foreground text-sm">{clock.date}</p>
      <p className="text-foreground text-2xl font-semibold tracking-tight">{clock.time}</p>
    </div>
  );
}
