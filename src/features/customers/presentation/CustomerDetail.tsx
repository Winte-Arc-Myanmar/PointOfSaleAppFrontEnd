"use client";

import Link from "next/link";
import {
  Activity,
  History,
  MessageSquareText,
  ShoppingBag,
  Ticket,
  UserRound,
  WalletCards,
} from "lucide-react";
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
import {
  calculateAge,
  getCustomerDemoProfile,
} from "./customer-demo-profile";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

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
  const demoProfile = customer ? getCustomerDemoProfile(customer) : null;

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
          <div className="space-y-5">
            <DetailSection title="Customer details" icon={UserRound}>
              <DetailRows rows={overviewRows} />
            </DetailSection>

            {demoProfile ? (
              <DetailSection title="Personal profile (demo)" icon={UserRound}>
                <p className="mb-3 text-xs leading-5 text-muted">
                  Preview-only information. These fields are not saved to the
                  customer API yet.
                </p>
                <DetailRows
                  rows={[
                    { label: "Gender", value: demoProfile.gender },
                    {
                      label: "Date of birth",
                      value: `${demoProfile.dateOfBirth} (${calculateAge(demoProfile.dateOfBirth)} years old)`,
                    },
                    { label: "Address", value: demoProfile.address },
                    ...demoProfile.socialAccounts.map((account) => ({
                      label: account.platform,
                      value: (
                        <a
                          href={account.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-mint underline-offset-4 hover:underline"
                        >
                          {account.username}
                        </a>
                      ),
                    })),
                  ]}
                />
              </DetailSection>
            ) : null}
          </div>
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

      {demoProfile ? (
        <section className="space-y-4" aria-labelledby="customer-history-title">
          <div>
            <h2
              id="customer-history-title"
              className="text-lg font-semibold tracking-tight"
            >
              Customer history (demo)
            </h2>
            <p className="mt-1 text-sm text-muted">
              Preview-only history for UI review. It is not loaded from or
              saved to the customer API.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <DetailSection title="Tier history" icon={History}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 text-left section-label">Tier</th>
                      <th className="py-2 text-left section-label">Date</th>
                      <th className="py-2 text-left section-label">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoProfile.tierHistory.map((entry) => (
                      <tr
                        key={`${entry.tier}-${entry.achievedAt}`}
                        className="border-b border-border/40 last:border-0"
                      >
                        <td className="py-2 font-medium">{entry.tier}</td>
                        <td className="py-2 whitespace-nowrap text-muted">
                          {entry.achievedAt}
                        </td>
                        <td className="py-2 text-muted">{entry.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DetailSection>

            <DetailSection title="Order history" icon={ShoppingBag}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 text-left section-label">Order</th>
                      <th className="py-2 text-left section-label">Date</th>
                      <th className="py-2 text-left section-label">Status</th>
                      <th className="py-2 text-right section-label">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoProfile.orders.map((order) => (
                      <tr
                        key={order.orderNumber}
                        className="border-b border-border/40 last:border-0"
                      >
                        <td className="py-2 font-mono text-xs">
                          {order.orderNumber}
                        </td>
                        <td className="py-2 whitespace-nowrap text-muted">
                          {order.date}
                        </td>
                        <td className="py-2">{order.status}</td>
                        <td className="py-2 text-right tabular-nums">
                          {moneyFormatter.format(order.total)} MMK
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DetailSection>

            <DetailSection title="Order activities" icon={Activity}>
              <div className="space-y-3">
                {demoProfile.orderActivities.map((entry) => (
                  <div
                    key={`${entry.activity}-${entry.date}`}
                    className="border-b border-border/40 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <p className="text-sm font-medium">{entry.activity}</p>
                      <time className="shrink-0 text-xs text-muted">
                        {entry.date}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-muted">{entry.detail}</p>
                  </div>
                ))}
              </div>
            </DetailSection>

            <DetailSection title="Spend history" icon={WalletCards}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 text-left section-label">Period</th>
                      <th className="py-2 text-center section-label">Orders</th>
                      <th className="py-2 text-right section-label">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoProfile.spendHistory.map((entry) => (
                      <tr
                        key={entry.period}
                        className="border-b border-border/40 last:border-0"
                      >
                        <td className="py-2">{entry.period}</td>
                        <td className="py-2 text-center tabular-nums text-muted">
                          {entry.orderCount}
                        </td>
                        <td className="py-2 text-right font-medium tabular-nums">
                          {moneyFormatter.format(entry.total)} MMK
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border">
                      <td className="pt-3 font-semibold">Total</td>
                      <td className="pt-3 text-center font-semibold tabular-nums">
                        {demoProfile.spendHistory.reduce(
                          (total, entry) => total + entry.orderCount,
                          0,
                        )}
                      </td>
                      <td className="pt-3 text-right font-semibold tabular-nums">
                        {moneyFormatter.format(
                          demoProfile.spendHistory.reduce(
                            (total, entry) => total + entry.total,
                            0,
                          ),
                        )}{" "}
                        MMK
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </DetailSection>
          </div>
        </section>
      ) : null}

    </div>
  );
}

