"use client";

import Link from "next/link";
import { MessageSquareText, Ticket, UserRound } from "lucide-react";
import { useCustomer } from "@/presentation/hooks/useCustomers";
import { useCustomerInteractions } from "@/presentation/hooks/useCustomerInteractions";
import { useLoyaltyLedgerEntries } from "@/presentation/hooks/useLoyaltyLedger";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  safeText,
} from "@/presentation/components/detail";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

export function CustomerDetail({ customerId }: { customerId: string }) {
  const { data: customer, isLoading, error } = useCustomer(customerId);
  const {
    data: interactionsData,
    isLoading: interactionsLoading,
  } = useCustomerInteractions(customerId, { page: 1, limit: 5 });
  const interactions = getPaginatedItems(interactionsData);
  const { data: loyaltyEntriesData, isLoading: loyaltyLoading } =
    useLoyaltyLedgerEntries(customerId, { page: 1, limit: 5 });
  const loyaltyEntries = getPaginatedItems(loyaltyEntriesData);

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

  const recentInteractions = interactions.slice(0, 5);
  const recentLoyalty = loyaltyEntries.slice(0, 5);

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/customers"
        backLabel="Customers"
        title={safeText(customer.name)}
        editHref={`/customers/${customer.id}/edit`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-5">
          <DetailSection title="Customer details" icon={UserRound}>
            <DetailRows rows={overviewRows} />
          </DetailSection>
        </div>

        <div className="hidden xl:block xl:col-span-1" />

        <div className="space-y-5 xl:col-span-6">
          <DetailSection title="Recent interactions" icon={MessageSquareText}>
            {interactionsLoading ? (
              <AppLoader
                fullScreen={false}
                size="xs"
                message="Loading interactions..."
              />
            ) : recentInteractions.length === 0 ? (
              <p className="text-sm text-muted">No interactions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 text-left section-label">Type</th>
                      <th className="py-2 text-left section-label">Channel</th>
                      <th className="py-2 text-left section-label">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInteractions.map((row) => (
                      <tr key={String(row.id)} className="border-b border-border/40 last:border-0">
                        <td className="py-2">{safeText(row.interactionType)}</td>
                        <td className="py-2">{safeText(row.interactionChannel)}</td>
                        <td className="py-2">{safeText(row.interactionDate ?? "-")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pt-3">
              <Link href={`/customers/${customer.id}/interactions`}>
                <Button variant="outline" size="sm">
                  Interactions
                </Button>
              </Link>
            </div>
          </DetailSection>

          <DetailSection title="Recent loyalty ledger" icon={Ticket}>
            {loyaltyLoading ? (
              <AppLoader
                fullScreen={false}
                size="xs"
                message="Loading loyalty ledger..."
              />
            ) : recentLoyalty.length === 0 ? (
              <p className="text-sm text-muted">No loyalty entries yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 text-left section-label">Type</th>
                      <th className="py-2 text-left section-label">Points</th>
                      <th className="py-2 text-left section-label">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLoyalty.map((row) => (
                      <tr key={String(row.id)} className="border-b border-border/40 last:border-0">
                        <td className="py-2">{safeText(row.transactionType)}</td>
                        <td className="py-2">{safeText(row.points)}</td>
                        <td className="py-2">{safeText(row.createdAt ?? "-")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pt-3">
              <Link href={`/customers/${customer.id}/loyalty-ledger`}>
                <Button variant="outline" size="sm">
                  Loyalty ledger
                </Button>
              </Link>
            </div>
          </DetailSection>
        </div>
      </div>

    </div>
  );
}

