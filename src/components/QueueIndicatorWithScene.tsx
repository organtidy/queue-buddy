import { useProfessionals } from "@/hooks/useProfessionals";
import { QueueIndicator } from "@/components/QueueIndicator";
import { BarbershopScene } from "@/components/BarbershopScene";

interface Props {
  avgWaitTime: number;
  manualWaitTime?: number | null;
}

export function QueueIndicatorWithScene({ avgWaitTime, manualWaitTime }: Props) {
  const { professionals } = useProfessionals();

  const realCount = professionals.reduce((sum, p) => sum + p.clients_queue, 0);
  const effectiveWaitTime = manualWaitTime ?? avgWaitTime;

  return (
    <>
      <QueueIndicator count={realCount} avgWaitTime={effectiveWaitTime} isManual={manualWaitTime != null} />
      <BarbershopScene queueCount={realCount} />
    </>
  );
}
