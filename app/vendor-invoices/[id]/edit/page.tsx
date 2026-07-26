import { Shell } from "@/presentation/components/layout/Shell";
import { EditVendorInvoiceForm } from "@/features/vendor-invoices/presentation/EditVendorInvoiceForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorInvoiceEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditVendorInvoiceForm invoiceId={id} />
    </Shell>
  );
}
