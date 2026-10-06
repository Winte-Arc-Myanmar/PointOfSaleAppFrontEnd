import { Shell } from "@/presentation/components/layout/Shell";
import { EditHostessForm } from "@/features/hostesses/presentation/EditHostessForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HostessEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditHostessForm hostessId={id} />
    </Shell>
  );
}
