import { EditWaitlistForm } from "@/features/waitlist/presentation/EditWaitlistForm";
import { Shell } from "@/presentation/components/layout/Shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWaitlistPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditWaitlistForm waitlistId={id} />
    </Shell>
  );
}
