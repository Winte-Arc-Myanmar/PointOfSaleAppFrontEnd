import { WaitlistDetail } from "@/features/waitlist/presentation/WaitlistDetail";
import { Shell } from "@/presentation/components/layout/Shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WaitlistDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <WaitlistDetail waitlistId={id} />
    </Shell>
  );
}
