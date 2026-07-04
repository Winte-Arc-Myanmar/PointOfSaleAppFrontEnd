import { Shell } from "@/presentation/components/layout/Shell";
import { EditVoidReasonForm } from "@/features/void-reasons/presentation/EditVoidReasonForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VoidReasonEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditVoidReasonForm voidReasonId={id} />
    </Shell>
  );
}
