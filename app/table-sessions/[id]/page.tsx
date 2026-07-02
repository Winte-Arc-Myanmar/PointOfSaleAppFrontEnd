import { Shell } from "@/presentation/components/layout/Shell";
import { TableSessionDetail } from "@/features/table-sessions/presentation/TableSessionDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TableSessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <TableSessionDetail sessionId={id} />
    </Shell>
  );
}
