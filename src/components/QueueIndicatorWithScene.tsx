import { useProfessionals } from "@/hooks/useProfessionals";
import { QueueIndicator } from "@/components/QueueIndicator";
import { BarbershopScene } from "@/components/BarbershopScene";

interface Props {
  avgWaitTime: number;
}

export function QueueIndicatorWithScene({ avgWaitTime }: Props) {
  const { professionals } = useProfessionals();

  const realCount = professionals.reduce((sum, p) => sum + p.clients_queue, 0);

  return (
    <>
      <QueueIndicator count={realCount} avgWaitTime={avgWaitTime} />
      <BarbershopScene queueCount={realCount} />
    </>
  );
}
