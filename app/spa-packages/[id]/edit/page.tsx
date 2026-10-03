import { Shell } from "@/presentation/components/layout/Shell";
import { EditSpaPackageForm } from "@/features/spa/presentation/EditSpaPackageForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SpaPackageEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditSpaPackageForm packageId={id} />
    </Shell>
  );
}
