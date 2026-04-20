"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { RotateCcw } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { DetailSection, DetailRows } from "@/presentation/components/detail";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { usePosSessions } from "@/presentation/hooks/usePosSessions";
import { useCreateRefund, useRefundsByOrder } from "@/presentation/hooks/useRefunds";
import type { RefundRequestDto, RefundMethod } from "@/core/application/dtos/RefundDto";

function money(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

function errorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const anyErr = err as any;
    const msg =
      anyErr?.response?.data?.message ??
      anyErr?.response?.data?.error ??
      anyErr?.message ??
      undefined;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  if (typeof err === "string" && err.trim()) return err;
  return "Refund failed.";
}

type FormValues = RefundRequestDto;

export function RefundSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { tenantId } = usePermissions();
  const create = useCreateRefund();

  const prefillOrderId = searchParams.get("salesOrderId");

  const { data: sessions = [] } = usePosSessions({
    page: 1,
    limit: 200,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [orderIdForList, setOrderIdForList] = useState<string | null>(prefillOrderId);
  const { data: existingRefunds = [] } = useRefundsByOrder(orderIdForList);

  const form = useForm<FormValues>({
    defaultValues: {
      tenantId: tenantId ?? "",
      salesOrderId: prefillOrderId ?? "",
      reason: "",
      refundMethod: "CASH",
      posSessionId: "",
      items: [{ salesOrderLineId: "", returnedQuantity: 1 }],
    },
  });

  useEffect(() => {
    if (!form.getValues("tenantId") && tenantId) form.setValue("tenantId", tenantId);
  }, [tenantId]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = useFieldArray({ control: form.control, name: "items" });

  const summary = useMemo(() => {
    if (!existingRefunds.length) return null;
    const total = existingRefunds.reduce((sum, r) => sum + (Number(r.totalRefund) || 0), 0);
    return { count: existingRefunds.length, total };
  }, [existingRefunds]);

  const onSubmit = (v: FormValues) => {
    if (!v.tenantId?.trim()) return toast.error("Tenant ID is required.");
    if (!v.salesOrderId?.trim()) return toast.error("Sales order ID is required.");
    if (!v.posSessionId?.trim()) return toast.error("POS session is required.");
    if (!v.reason?.trim()) return toast.error("Reason is required.");
    if (!Array.isArray(v.items) || v.items.length === 0) return toast.error("Add at least one item.");

    create.mutate(v, {
      onSuccess: (res) => {
        toast.success("Refund processed.");
        setOrderIdForList(v.salesOrderId);
        router.push(`/refunds/${res.returnId}`);
      },
      onError: (e: unknown) => {
        toast.error(errorMessage(e));
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <DetailSection title="Process refund" icon={RotateCcw}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label>Tenant ID</Label>
            <Input className="font-mono text-sm" {...form.register("tenantId")} placeholder="tenant-uuid" />
          </div>
          <div className="grid gap-2">
            <Label>Sales order ID</Label>
            <Input
              className="font-mono text-sm"
              {...form.register("salesOrderId")}
              placeholder="order-uuid"
              onBlur={(e) => setOrderIdForList(e.target.value.trim() || null)}
            />
            <p className="text-xs text-muted">
              Tip: open a receipt and click “Start refund” to prefill this.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Refund method</Label>
              <Controller
                control={form.control}
                name="refundMethod"
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {(["CASH", "ORIGINAL_PAYMENT", "STORE_CREDIT"] as RefundMethod[]).map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label>POS session</Label>
              <Controller
                control={form.control}
                name="posSessionId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select POS session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((s) => (
                        <SelectItem key={String(s.id)} value={String(s.id)}>
                          {String(s.status ?? "—")} · {String(s.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Reason</Label>
            <Input {...form.register("reason")} placeholder="Defective product" />
          </div>

          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="section-label">Items</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => items.append({ salesOrderLineId: "", returnedQuantity: 1 })}
              >
                Add item
              </Button>
            </div>

            <div className="space-y-3">
              {items.fields.map((f, idx) => (
                <div key={f.id} className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-8 grid gap-2">
                    <Label>Sales order line ID</Label>
                    <Input
                      className="font-mono text-sm"
                      {...form.register(`items.${idx}.salesOrderLineId` as const)}
                      placeholder="line-uuid"
                    />
                  </div>
                  <div className="lg:col-span-3 grid gap-2">
                    <Label>Returned qty</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      {...form.register(`items.${idx}.returnedQuantity` as const, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="lg:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => items.remove(idx)}
                      disabled={items.fields.length === 1}
                      className="w-full"
                    >
                      Del
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Processing..." : "Process refund"}
          </Button>
        </form>
      </DetailSection>

      <DetailSection title="Refunds for order" icon={RotateCcw}>
        <DetailRows
          rows={[
            { label: "Sales order ID", value: orderIdForList ?? "—", mono: true },
            { label: "Refund count", value: summary ? String(summary.count) : "—" },
            { label: "Total refunded", value: summary ? money(summary.total) : "—" },
          ]}
        />

        <div className="mt-4 space-y-3">
          {existingRefunds.length === 0 ? (
            <p className="text-sm text-muted">No refunds found for this order.</p>
          ) : (
            existingRefunds.map((r) => (
              <button
                key={String(r.returnId)}
                type="button"
                onClick={() => router.push(`/refunds/${r.returnId}`)}
                className="w-full text-left rounded-lg border border-border p-3 hover:bg-mint/5 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{r.returnNumber || String(r.returnId)}</div>
                  <div className="text-sm text-muted">{money(r.totalRefund)}</div>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {r.refundMethod} · {r.orderStatus}
                </div>
              </button>
            ))
          )}
        </div>
      </DetailSection>
    </div>
  );
}

