"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useCustomer } from "@/presentation/hooks/useCustomers";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  safeText,
} from "@/presentation/components/detail";

export function CustomerDetail({ customerId }: { customerId: string }) {
  const { data: customer, isLoading, error } = useCustomer(customerId);

  const overviewRows = customer
    ? [
        { label: "Customer ID", value: safeText(customer.id), mono: true },
        { label: "Name", value: safeText(customer.name) },
        { label: "Tenant ID", value: safeText(customer.tenantId), mono: true },
        { label: "Account type", value: safeText(customer.accountType) },
        { label: "Phone", value: safeText(customer.phone || "-") },
        { label: "Email", value: safeText(customer.email || "-") },
        { label: "Has credit account", value: customer.hasCreditAccount ? "Yes" : "No" },
        { label: "Max credit limit", value: safeText(customer.maxCreditLimit), mono: true },
        { label: "Current credit balance", value: safeText(customer.currentCreditBalance), mono: true },
        { label: "Payment terms (days)", value: safeText(customer.paymentTermsDays), mono: true },
        { label: "Loyalty tier", value: safeText(customer.loyaltyTier) },
        { label: "Lifetime points earned", value: safeText(customer.lifetimePointsEarned), mono: true },
      ]
    : [];

  if (isLoading)
    return (
      <AppLoader fullScreen={false} size="md" message="Loading customer..." />
    );

  if (error || !customer)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Customer not found or failed to load.</p>
        <Link href="/customers">
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/customers"
        backLabel="Customers"
        title={safeText(customer.name)}
        editHref={`/customers/${customer.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={UserRound}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/customers/${customer.id}/interactions`}>
          <Button variant="outline" size="sm">
            Interactions
          </Button>
        </Link>
        <Link href={`/customers/${customer.id}/loyalty-ledger`}>
          <Button variant="outline" size="sm">
            Loyalty ledger
          </Button>
        </Link>
      </div>
    </div>
  );
}

