import { Shell } from "@/presentation/components/layout/Shell";
import { EditVendorForm } from "@/features/vendors/presentation/EditVendorForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditVendorForm vendorId={id} />
    </Shell>
  );
}

