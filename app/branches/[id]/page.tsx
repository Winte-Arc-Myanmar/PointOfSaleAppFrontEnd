import { Shell } from "@/presentation/components/layout/Shell";
import { BranchDetail } from "@/features/branches/presentation/BranchDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BranchDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <BranchDetail branchId={id} />
    </Shell>
  );
}
