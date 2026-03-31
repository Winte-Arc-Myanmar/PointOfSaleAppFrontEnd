import { Shell } from "@/presentation/components/layout/Shell";
import { VendorDetail } from "@/features/vendors/presentation/VendorDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <VendorDetail vendorId={id} />
    </Shell>
  );
}

