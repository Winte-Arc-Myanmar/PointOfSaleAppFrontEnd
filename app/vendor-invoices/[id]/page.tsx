import { Shell } from "@/presentation/components/layout/Shell";
import { VendorInvoiceDetail } from "@/features/vendor-invoices/presentation/VendorInvoiceDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorInvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <VendorInvoiceDetail invoiceId={id} />
    </Shell>
  );
}
