"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ReceiptText, ListPlus, CreditCard } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { DataTable } from "@/presentation/components/data-table";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useSalesOrder } from "@/presentation/hooks/useSalesOrders";
import { useCreateSalesOrderLine, useDeleteSalesOrderLine, useSalesOrderLines } from "@/presentation/hooks/useSalesOrderLines";
import { useCreateSalesOrderPayment, useDeleteSalesOrderPayment, useSalesOrderPayments } from "@/presentation/hooks/useSalesOrderPayments";
import { usePaymentMethods } from "@/presentation/hooks/usePaymentMethods";
import { usePosSessions } from "@/presentation/hooks/usePosSessions";
import type { SalesOrderLine } from "@/core/domain/entities/SalesOrderLine";
import type { SalesOrderPayment } from "@/core/domain/entities/SalesOrderPayment";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const CREATE_LINE_FORM_ID = "create-sales-order-line";
const CREATE_PAYMENT_FORM_ID = "create-sales-order-payment";

function money(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

export function SalesOrderDetail({ salesOrderId }: { salesOrderId: string }) {
  const { data: order, isLoading, error } = useSalesOrder(salesOrderId);
  const { data: lines = [], isLoading: linesLoading } = useSalesOrderLines(salesOrderId, { page: 1, limit: 50 });
  const { data: payments = [], isLoading: payLoading } = useSalesOrderPayments(salesOrderId, { page: 1, limit: 50 });
  const createLine = useCreateSalesOrderLine(salesOrderId);
  const createPayment = useCreateSalesOrderPayment(salesOrderId);
  const delLine = useDeleteSalesOrderLine(salesOrderId);
  const delPayment = useDeleteSalesOrderPayment(salesOrderId);
  const toast = useToast();
  const confirm = useConfirm();
  const [lineOpen, setLineOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [lineLoading, setLineLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const overviewRows = order ? [
    { label: "Order ID", value: safeText(order.id), mono: true },
    { label: "Order number", value: safeText(order.orderNumber) },
    { label: "Status", value: safeText(order.status) },
    { label: "Channel", value: safeText(order.salesChannel) },
    { label: "Tenant ID", value: safeText(order.tenantId), mono: true },
    { label: "Customer ID", value: safeText(order.customerId), mono: true },
    { label: "Location ID", value: safeText(order.locationId), mono: true },
  ] : [];

  const totalsRows = order ? [
    { label: "Subtotal", value: money(order.subtotal) },
    { label: "Discount", value: money(order.totalDiscount) },
    { label: "Tax", value: money(order.totalTax) },
    { label: "Grand total", value: money(order.grandTotal) },
  ] : [];

  const recordRows = order ? [
    { label: "Created at", value: formatDate(order.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(order.updatedAt ?? undefined) },
    { label: "Idempotency key", value: order.idempotencyKey ? safeText(order.idempotencyKey) : "—", mono: true },
  ] : [];

  const lineColumns = useMemo(() => {
    return [
      {
        key: "variantId",
        header: "Variant",
        render: (r: SalesOrderLine) => (
          <span className="font-mono text-xs text-muted">{r.variantId}</span>
        ),
      },
      {
        key: "quantity",
        header: "Qty",
        render: (r: SalesOrderLine) => (
          <span className="text-muted">{r.quantity}</span>
        ),
      },
      {
        key: "unitPrice",
        header: "Unit price",
        render: (r: SalesOrderLine) => (
          <span className="text-muted">{money(r.unitPrice)}</span>
        ),
      },
      {
        key: "taxAmount",
        header: "Tax",
        render: (r: SalesOrderLine) => (
          <span className="text-muted">{money(r.taxAmount)}</span>
        ),
      },
    ] as any;
  }, []);

  const paymentColumns = useMemo(() => {
    return [
      {
        key: "paymentMethodId",
        header: "Payment method",
        render: (p: SalesOrderPayment) => (
          <span className="font-mono text-xs text-muted">
            {p.paymentMethodId}
          </span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        render: (p: SalesOrderPayment) => (
          <span className="text-muted">{money(p.amount)}</span>
        ),
      },
      {
        key: "transactionReference",
        header: "Reference",
        render: (p: SalesOrderPayment) => (
          <span className="text-muted">{p.transactionReference}</span>
        ),
      },
    ] as any;
  }, []);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading sales order..." />;
  if (error || !order) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Sales order not found or failed to load.</p>
        <Link href="/sales-orders">
          <Button variant="outline">Back to Sales Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/sales-orders"
        backLabel="Sales orders"
        title={safeText(order.orderNumber)}
        editHref={`/sales-orders/${order.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={ReceiptText}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Totals" icon={ReceiptText}>
          <DetailRows rows={totalsRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={ReceiptText} className="lg:col-span-2">
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="section-label">Lines</h2>
          <Button onClick={() => setLineOpen(true)}>
            <ListPlus className="mr-2 h-4 w-4" />
            Add line
          </Button>
        </div>
        <DataTable<SalesOrderLine>
          data={lines}
          columns={lineColumns}
          actions={[
            {
              label: "Delete",
              variant: "destructive",
              onClick: async (row) => {
                const ok = await confirm({
                  title: "Delete line",
                  description: "Remove this order line?",
                  confirmLabel: "Delete",
                  variant: "destructive",
                });
                if (ok) {
                  delLine.mutate(String(row.id), {
                    onSuccess: () => toast.success("Line deleted."),
                    onError: () => toast.error("Failed to delete line."),
                  });
                }
              },
            },
          ]}
          isLoading={linesLoading}
          loadingText="Loading lines..."
          emptyText="No lines yet."
          pageSize={10}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="section-label">Payments</h2>
          <Button variant="outline" onClick={() => setPaymentOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Add payment
          </Button>
        </div>
        <DataTable<SalesOrderPayment>
          data={payments}
          columns={paymentColumns}
          actions={[
            {
              label: "Delete",
              variant: "destructive",
              onClick: async (row) => {
                const ok = await confirm({
                  title: "Delete payment",
                  description: "Remove this payment record?",
                  confirmLabel: "Delete",
                  variant: "destructive",
                });
                if (ok) {
                  delPayment.mutate(String(row.id), {
                    onSuccess: () => toast.success("Payment deleted."),
                    onError: () => toast.error("Failed to delete payment."),
                  });
                }
              },
            },
          ]}
          isLoading={payLoading}
          loadingText="Loading payments..."
          emptyText="No payments yet."
          pageSize={10}
        />
      </div>

      <FormModal
        isOpen={lineOpen}
        onClose={() => setLineOpen(false)}
        title="Add sales order line"
        formId={CREATE_LINE_FORM_ID}
        formContent={
          <CreateLineInline
            onLoadingChange={setLineLoading}
            onSuccess={() => setLineOpen(false)}
            onSubmit={(payload) => createLine.mutate(payload)}
          />
        }
        submitText="Add line"
        loadingText="Saving…"
        isLoading={lineLoading || createLine.isPending}
        maxWidth="lg"
      />

      <FormModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Add payment"
        formId={CREATE_PAYMENT_FORM_ID}
        formContent={
          <CreatePaymentInline
            onLoadingChange={setPaymentLoading}
            onSuccess={() => setPaymentOpen(false)}
            onSubmit={(payload) => createPayment.mutate(payload)}
          />
        }
        submitText="Add payment"
        loadingText="Saving…"
        isLoading={paymentLoading || createPayment.isPending}
        maxWidth="lg"
      />
    </div>
  );
}

function CreateLineInline({
  onSubmit,
  onSuccess,
  onLoadingChange,
}: {
  onSubmit: (payload: any) => void;
  onSuccess: () => void;
  onLoadingChange: (loading: boolean) => void;
}) {
  const toast = useToast();
  const form = useForm({
    defaultValues: {
      variantId: "",
      quantity: 1,
      unitPrice: 0,
      lineDiscount: 0,
      taxRateId: "",
      taxAmount: 0,
      appliedPromotionId: "",
    },
  });
  const submit = (v: any) => {
    onLoadingChange(true);
    onSubmit({
      variantId: v.variantId,
      quantity: v.quantity,
      unitPrice: v.unitPrice,
      lineDiscount: v.lineDiscount,
      taxRateId: v.taxRateId.trim() || null,
      taxAmount: v.taxAmount,
      appliedPromotionId: v.appliedPromotionId.trim() || null,
    });
    onLoadingChange(false);
    toast.success("Line added.");
    onSuccess();
  };
  return (
    <form id={CREATE_LINE_FORM_ID} onSubmit={form.handleSubmit(submit)} className="space-y-4">
      <div className="grid gap-2">
        <Label>Variant ID</Label>
        <Input className="font-mono text-sm" {...form.register("variantId")} placeholder="uuid" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Quantity</Label>
          <Input type="number" step="0.0001" {...form.register("quantity", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <Label>Unit price</Label>
          <Input type="number" step="0.0001" {...form.register("unitPrice", { valueAsNumber: true })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Line discount</Label>
          <Input type="number" step="0.0001" {...form.register("lineDiscount", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <Label>Tax amount</Label>
          <Input type="number" step="0.0001" {...form.register("taxAmount", { valueAsNumber: true })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Tax rate ID</Label>
          <Input className="font-mono text-sm" {...form.register("taxRateId")} placeholder="uuid" />
        </div>
        <div className="grid gap-2">
          <Label>Promotion ID</Label>
          <Input className="font-mono text-sm" {...form.register("appliedPromotionId")} placeholder="uuid" />
        </div>
      </div>
      <Button type="submit">Add</Button>
    </form>
  );
}

function CreatePaymentInline({
  onSubmit,
  onSuccess,
  onLoadingChange,
}: {
  onSubmit: (payload: any) => void;
  onSuccess: () => void;
  onLoadingChange: (loading: boolean) => void;
}) {
  const toast = useToast();
  const { data: paymentMethods = [] } = usePaymentMethods({
    page: 1,
    limit: 200,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: posSessions = [] } = usePosSessions({
    page: 1,
    limit: 200,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const form = useForm({
    defaultValues: {
      tenantId: "",
      paymentMethodId: "",
      posSessionId: "",
      amount: 0,
      transactionReference: "",
    },
  });
  const submit = (v: any) => {
    onLoadingChange(true);
    onSubmit({
      tenantId: v.tenantId,
      paymentMethodId: v.paymentMethodId,
      posSessionId: v.posSessionId,
      amount: v.amount,
      transactionReference: v.transactionReference,
    });
    onLoadingChange(false);
    toast.success("Payment added.");
    onSuccess();
  };
  return (
    <form id={CREATE_PAYMENT_FORM_ID} onSubmit={form.handleSubmit(submit)} className="space-y-4">
      <div className="grid gap-2">
        <Label>Tenant ID</Label>
        <Input className="font-mono text-sm" {...form.register("tenantId")} placeholder="uuid" />
      </div>
      <div className="grid gap-2">
        <Label>Payment method ID</Label>
        <Controller
          control={form.control}
          name="paymentMethodId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((m) => (
                  <SelectItem key={String(m.id)} value={String(m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="grid gap-2">
        <Label>POS session ID</Label>
        <Controller
          control={form.control}
          name="posSessionId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select POS session" />
              </SelectTrigger>
              <SelectContent>
                {posSessions.map((s) => (
                  <SelectItem key={String(s.id)} value={String(s.id)}>
                    {String(s.status ?? "—")} · {String(s.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="grid gap-2">
        <Label>Amount</Label>
        <Input type="number" step="0.0001" {...form.register("amount", { valueAsNumber: true })} />
      </div>
      <div className="grid gap-2">
        <Label>Transaction reference</Label>
        <Input {...form.register("transactionReference")} placeholder="TXN-12345" />
      </div>
      <Button type="submit">Add</Button>
    </form>
  );
}

