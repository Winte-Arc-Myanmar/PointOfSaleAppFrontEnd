import { EditBundleForm } from "@/features/bundles/presentation/EditBundleForm";
import { Shell } from "@/presentation/components/layout/Shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBundlePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditBundleForm bundleId={id} />
    </Shell>
  );
}
