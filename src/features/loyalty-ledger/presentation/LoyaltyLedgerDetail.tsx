"use client";

import Link from "next/link";
import { Gift, ReceiptText, UserRound } from "lucide-react";
import { useLoyaltyLedgerEntry } from "@/presentation/hooks/useLoyaltyLedger";
import { useCustomer } from "@/presentation/hooks/useCustomers";
import { useSalesOrder } from "@/presentation/hooks/useSalesOrders";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  safeText,
} from "@/presentation/components/detail";

export interface LoyaltyLedgerDetailProps {
  customerId: string;
  entryId: string;
  listHref?: string;
}

export function LoyaltyLedgerDetail({
  customerId,
  entryId,
  listHref: listHrefProp,
}: LoyaltyLedgerDetailProps) {
  const { data: entry, isLoading, error } = useLoyaltyLedgerEntry(
    customerId,
    entryId
  );
  const { data: customer } = useCustomer(customerId);
  const { data: order } = useSalesOrder(entry?.referenceOrderId ?? null);

  const listHref =
    listHrefProp ?? `/customers/${customerId}/loyalty-ledger`;

  const rows = entry
    ? [
        { label: "Entry ID", value: safeText(entry.id), mono: true },
        { label: "Customer ID", value: safeText(entry.customerId), mono: true },
        { label: "Tenant ID", value: safeText(entry.tenantId), mono: true },
        { label: "Transaction type", value: safeText(entry.transactionType) },
        { label: "Points", value: safeText(entry.points), mono: true },
        {
          label: "Reference order ID",
          value: safeText(entry.referenceOrderId ?? "—"),
          mono: true,
        },
        {
          label: "Expiry date",
          value: safeText(entry.expiryDate ?? "—"),
        },
        {
          label: "Created",
          value: entry.createdAt
            ? new Date(entry.createdAt).toLocaleString()
            : "—",
        },
        {
          label: "Updated",
          value: entry.updatedAt
            ? new Date(entry.updatedAt).toLocaleString()
            : "—",
        },
      ]
    : [];

  const customerRows = customer
    ? [
        { label: "Name", value: safeText(customer.name) },
        { label: "Tier", value: safeText(customer.loyaltyTier) },
        { label: "Email", value: safeText(customer.email) },
        { label: "Phone", value: safeText(customer.phone) },
      ]
    : [{ label: "Customer ID", value: safeText(customerId), mono: true }];

  const orderRows = order
    ? [
        { label: "Order number", value: safeText(order.orderNumber) },
        { label: "Order status", value: safeText(order.status) },
        { label: "Sales channel", value: safeText(order.salesChannel) },
        { label: "Grand total", value: safeText(order.grandTotal), mono: true },
      ]
    : [
        {
          label: "Order ID",
          value: safeText(entry?.referenceOrderId ?? "—"),
          mono: true,
        },
      ];

  if (isLoading)
    return (
      <AppLoader
        fullScreen={false}
        size="md"
        message="Loading loyalty entry..."
      />
    );

  if (error || !entry)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Entry not found or failed to load.</p>
        <Link href={listHref}>
          <Button variant="outline">Back to ledger</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref={listHref}
        backLabel="Loyalty ledger"
        title={`${entry.transactionType} · ${entry.points} pts`}
        editHref={`${listHref}/${entry.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Details" icon={Gift}>
          <DetailRows rows={rows} />
        </DetailSection>
        <DetailSection title="Customer information" icon={UserRound}>
          <DetailRows rows={customerRows} />
        </DetailSection>
        <DetailSection title="Order details" icon={ReceiptText} className="lg:col-span-2">
          <DetailRows rows={orderRows} />
          {order && entry.referenceOrderId ? (
            <div className="mt-4">
              <Link href={`/sales-orders/${entry.referenceOrderId}`}>
                <Button variant="outline" size="sm">
                  View order #{order.orderNumber}
                </Button>
              </Link>
            </div>
          ) : null}
        </DetailSection>
      </div>
    </div>
  );
}
