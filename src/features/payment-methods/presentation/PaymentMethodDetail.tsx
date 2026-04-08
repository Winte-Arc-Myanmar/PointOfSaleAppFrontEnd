"use client";

import Link from "next/link";
import { CreditCard, Info } from "lucide-react";
import { usePaymentMethod } from "@/presentation/hooks/usePaymentMethods";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function PaymentMethodDetail({ paymentMethodId }: { paymentMethodId: string }) {
  const { data: method, isLoading, error } = usePaymentMethod(paymentMethodId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading payment method..." />;
  if (error || !method) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Payment method not found or failed to load.</p>
        <Link href="/payment-methods">
          <Button variant="outline">Back to Payment methods</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "Payment method ID", value: safeText(method.id), mono: true },
    { label: "Name", value: safeText(method.name) },
    { label: "Tenant ID", value: safeText(method.tenantId), mono: true },
    { label: "GL account ID", value: safeText(method.glAccountId), mono: true },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(method.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(method.updatedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/payment-methods"
        backLabel="Payment methods"
        title={safeText(method.name)}
        editHref={`/payment-methods/${method.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={CreditCard}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>
    </div>
  );
}

