"use client";

import Link from "next/link";
import { FileText, Info, Scale } from "lucide-react";
import { useVendorInvoice } from "@/presentation/hooks/useVendorInvoices";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function VendorInvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const { data: invoice, isLoading, error } = useVendorInvoice(invoiceId);

  if (isLoading)
    return <AppLoader fullScreen={false} size="md" message="Loading vendor invoice..." />;
  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Vendor invoice not found or failed to load.</p>
        <Link href="/vendor-invoices">
          <Button variant="outline">Back to Vendor Invoices</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Invoice ID", value: safeText(invoice.id), mono: true },
    { label: "Tenant ID", value: safeText(invoice.tenantId), mono: true },
    { label: "Invoice number", value: safeText(invoice.invoiceNumber) },
    { label: "Invoice type", value: safeText(invoice.invoiceType) },
    { label: "Status", value: safeText(invoice.status) },
    { label: "Vendor ID", value: safeText(invoice.vendorId), mono: true },
    { label: "Total amount", value: safeText(invoice.totalAmount), mono: true },
    { label: "Matched PO ID", value: safeText(invoice.matchedPoId), mono: true },
    { label: "Matched GRN ID", value: safeText(invoice.matchedGrnId), mono: true },
  ];

  const timelineRows = [
    { label: "Created at", value: formatDate(invoice.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(invoice.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/vendor-invoices"
        backLabel="Vendor Invoices"
        title={safeText(invoice.invoiceNumber)}
        editHref={`/vendor-invoices/${invoice.id}/edit`}
      />

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/landed-cost-allocations?sourceInvoiceId=${encodeURIComponent(String(invoice.id))}`}
        >
          <Button variant="outline" size="sm" className="gap-2">
            <Scale className="h-4 w-4" />
            Landed cost allocations
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={FileText}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Timeline" icon={Info}>
          <DetailRows rows={timelineRows} />
        </DetailSection>
      </div>
    </div>
  );
}
