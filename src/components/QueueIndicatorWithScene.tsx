import { useProfessionals } from "@/hooks/useProfessionals";
import { QueueIndicator } from "@/components/QueueIndicator";
import { BarbershopScene } from "@/components/BarbershopScene";

interface Props {
  avgWaitTime: number;
  onRefetchReady?: (refetch: () => Promise<void>) => void;
}

export function QueueIndicatorWithScene({ avgWaitTime, onRefetchReady }: Props) {
  const { professionals, loading, refetch } = useProfessionals();

  // Expose refetch to parent
  if (onRefetchReady) {
    onRefetchReady(refetch);
  }

  const realCount = professionals.reduce((sum, p) => sum + p.clients_queue, 0);

  return (
    <>
      <QueueIndicator count={realCount} avgWaitTime={avgWaitTime} />
      <BarbershopScene queueCount={realCount} />
    </>
  );
}
