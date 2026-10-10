"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Loader2, RotateCcw, Search } from "lucide-react";
import container from "@/core/infrastructure/di/container";
import type { ISalesOrderService } from "@/core/domain/services/ISalesOrderService";
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
import { usePosSessions } from "@/presentation/hooks/usePosSessions";
import { useSalesOrder } from "@/presentation/hooks/useSalesOrders";
import { useSalesOrderLines } from "@/presentation/hooks/useSalesOrderLines";
import { useCreateRefund, useRefundsByOrder } from "@/presentation/hooks/useRefunds";
import type { RefundRequestDto, RefundMethod } from "@/core/application/dtos/RefundDto";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { isUuid, shortId } from "./refund-order-utils";
import { formatMoney as money } from "@/lib/money";

function errorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const anyErr = err as {
      response?: {
        data?: {
          message?: string;
          error?: string | { message?: string; details?: string[] };
        };
      };
      message?: string;
    };
    const body = anyErr?.response?.data;
    const nestedError = body?.error;
    const nestedMessage =
      typeof nestedError === "object" && nestedError !== null
        ? nestedError.message
        : typeof nestedError === "string"
          ? nestedError
          : undefined;
    const msg =
      nestedMessage ??
      body?.message ??
      (typeof body?.error === "string" ? body.error : undefined) ??
      anyErr?.message ??
      undefined;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  if (typeof err === "string" && err.trim()) return err;
  return "Refund failed.";
}

type FormValues = RefundRequestDto;

async function resolveSalesOrderId(input: string): Promise<string | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const service = container.resolve<ISalesOrderService>("salesOrderService");

  if (isUuid(trimmed)) {
    const order = await service.getById(trimmed);
    return order ? String(order.id) : null;
  }

  const result = await service.getAll({ search: trimmed, limit: 25 });
  const exact = result.items.find((order) => order.orderNumber === trimmed);
  if (exact) return String(exact.id);
  if (result.items.length === 1) return String(result.items[0].id);
  return null;
}

export function RefundSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const create = useCreateRefund();

  const prefillOrderId = searchParams.get("salesOrderId")?.trim() ?? "";

  const { data: sessionsData } = usePosSessions({
    page: 1,
    limit: 200,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const sessions = getPaginatedItems(sessionsData);
  const openSessions = useMemo(
    () => sessions.filter((session) => String(session.status ?? "").toUpperCase() === "OPEN"),
    [sessions],
  );

  const [orderInput, setOrderInput] = useState(prefillOrderId);
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(
    prefillOrderId && isUuid(prefillOrderId) ? prefillOrderId : null,
  );
  const [isResolvingOrder, setIsResolvingOrder] = useState(false);
  const prefilledLinesForOrder = useRef<string | null>(null);

  const { data: order } = useSalesOrder(resolvedOrderId);
  const { data: linesResult, isLoading: linesLoading } = useSalesOrderLines(resolvedOrderId, {
    page: 1,
    limit: 200,
  });
  const orderLines = getPaginatedItems(linesResult);

  const { data: existingRefundsData } = useRefundsByOrder(resolvedOrderId);
  const existingRefunds = existingRefundsData ?? [];

  const form = useForm<FormValues>({
    defaultValues: {
      salesOrderId: resolvedOrderId ?? "",
      reason: "",
      refundMethod: "CASH",
      posSessionId: "",
      items: [{ salesOrderLineId: "", returnedQuantity: 1 }],
    },
  });

  const items = useFieldArray({ control: form.control, name: "items" });

  const loadOrder = useCallback(
    async (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) {
        setResolvedOrderId(null);
        prefilledLinesForOrder.current = null;
        form.setValue("salesOrderId", "");
        return;
      }

      setIsResolvingOrder(true);
      try {
        const id = await resolveSalesOrderId(trimmed);
        if (!id) {
          toast.error("No sales order found for that ID or order number.");
          setResolvedOrderId(null);
          form.setValue("salesOrderId", "");
          return;
        }
        setResolvedOrderId(id);
        form.setValue("salesOrderId", id);
        prefilledLinesForOrder.current = null;
      } catch {
        toast.error("Could not load the sales order.");
      } finally {
        setIsResolvingOrder(false);
      }
    },
    [form, toast],
  );

  useEffect(() => {
    if (prefillOrderId) {
      setOrderInput(prefillOrderId);
      void loadOrder(prefillOrderId);
    }
  }, [prefillOrderId, loadOrder]);

  useEffect(() => {
    if (order?.orderNumber && resolvedOrderId) {
      setOrderInput(order.orderNumber);
    }
  }, [order?.orderNumber, resolvedOrderId]);

  useEffect(() => {
    if (!resolvedOrderId || !orderLines.length) return;
    if (prefilledLinesForOrder.current === resolvedOrderId) return;
    prefilledLinesForOrder.current = resolvedOrderId;
    form.setValue(
      "items",
      orderLines.map((line) => ({
        salesOrderLineId: String(line.id),
        returnedQuantity: line.quantity,
      })),
    );
  }, [resolvedOrderId, orderLines, form]);

  useEffect(() => {
    if (form.getValues("posSessionId")) return;
    if (openSessions.length !== 1) return;
    form.setValue("posSessionId", String(openSessions[0].id));
  }, [openSessions, form]);

  const summary = useMemo(() => {
    if (!existingRefunds.length) return null;
    const total = existingRefunds.reduce((sum, refund) => sum + (Number(refund.totalRefund) || 0), 0);
    return { count: existingRefunds.length, total };
  }, [existingRefunds]);

  const onSubmit = (values: FormValues) => {
    if (!values.salesOrderId?.trim()) return toast.error("Load a sales order first.");
    if (!values.posSessionId?.trim()) return toast.error("POS session is required.");
    if (!values.reason?.trim()) return toast.error("Reason is required.");
    if (!Array.isArray(values.items) || values.items.length === 0) {
      return toast.error("Add at least one item.");
    }
    const invalidLine = values.items.find(
      (item) => !item.salesOrderLineId?.trim() || !Number.isFinite(item.returnedQuantity),
    );
    if (invalidLine) return toast.error("Each item needs a line and returned quantity.");

    create.mutate(values, {
        onSuccess: (res) => {
          toast.success("Refund processed.");
          router.push(`/refunds/${res.returnId}`);
        },
        onError: (error: unknown) => {
          toast.error(errorMessage(error));
        },
      },
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <DetailSection title="Process refund" icon={RotateCcw}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...form.register("salesOrderId")} />

          <div className="grid gap-2">
            <Label htmlFor="refund-order-lookup">Sales order</Label>
            <div className="flex gap-2">
              <Input
                id="refund-order-lookup"
                className="font-mono text-sm"
                value={orderInput}
                placeholder="Order number or UUID"
                onChange={(event) => setOrderInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void loadOrder(orderInput);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isResolvingOrder || !orderInput.trim()}
                onClick={() => void loadOrder(orderInput)}
              >
                {isResolvingOrder ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="sr-only">Load order</span>
              </Button>
            </div>
            <p className="text-xs text-muted">
              Enter an order number (for example SO-RET-20230927-0004) or paste the order UUID.
              From a receipt, use Start refund to open this form with the order already loaded.
            </p>
          </div>

          {order ? (
            <DetailRows
              rows={[
                { label: "Order number", value: order.orderNumber },
                { label: "Status", value: order.status },
                { label: "Grand total", value: money(order.grandTotal) },
                { label: "Order ID", value: String(order.id), mono: true },
              ]}
            />
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      {(["CASH", "ORIGINAL_PAYMENT", "STORE_CREDIT"] as RefundMethod[]).map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
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
                      <SelectValue placeholder="Select open session" />
                    </SelectTrigger>
                    <SelectContent>
                      {(openSessions.length ? openSessions : sessions).map((session) => (
                        <SelectItem key={String(session.id)} value={String(session.id)}>
                          {String(session.status ?? "—")} · register {shortId(String(session.registerId))}
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

          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="section-label">Items to refund</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => items.append({ salesOrderLineId: "", returnedQuantity: 1 })}
              >
                Add line
              </Button>
            </div>

            {!resolvedOrderId ? (
              <p className="text-sm text-muted">Load a sales order to fill refund lines automatically.</p>
            ) : linesLoading ? (
              <p className="text-sm text-muted">Loading order lines…</p>
            ) : orderLines.length === 0 ? (
              <p className="text-sm text-muted">This order has no lines to refund.</p>
            ) : (
              <div className="space-y-3">
                {items.fields.map((field, index) => {
                  const lineId = form.watch(`items.${index}.salesOrderLineId`);
                  const matchedLine = orderLines.find((line) => String(line.id) === lineId);
                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 gap-3 rounded-md border border-border/60 p-3 lg:grid-cols-12"
                    >
                      <div className="lg:col-span-7 space-y-1">
                        <Label className="text-xs text-muted">Line</Label>
                        {matchedLine ? (
                          <p className="text-sm font-medium">
                            Variant {shortId(String(matchedLine.variantId), 12)} · qty sold{" "}
                            {matchedLine.quantity}
                          </p>
                        ) : (
                          <Input
                            className="font-mono text-sm"
                            {...form.register(`items.${index}.salesOrderLineId` as const)}
                            placeholder="Line UUID"
                          />
                        )}
                      </div>
                      <div className="lg:col-span-3 grid gap-2">
                        <Label>Returned qty</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          min={0}
                          {...form.register(`items.${index}.returnedQuantity` as const, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="lg:col-span-2 flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => items.remove(index)}
                          disabled={items.fields.length === 1}
                          className="w-full"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button type="submit" disabled={create.isPending || !resolvedOrderId}>
            {create.isPending ? "Processing..." : "Process refund"}
          </Button>
        </form>
      </DetailSection>

      <DetailSection title="Refunds for order" icon={RotateCcw}>
        <DetailRows
          rows={[
            {
              label: "Sales order",
              value: order?.orderNumber ?? (resolvedOrderId ? shortId(resolvedOrderId, 16) : "—"),
            },
            { label: "Refund count", value: summary ? String(summary.count) : "—" },
            { label: "Total refunded", value: summary ? money(summary.total) : "—" },
          ]}
        />

        <div className="mt-4 space-y-3">
          {!resolvedOrderId ? (
            <p className="text-sm text-muted">Load a sales order to see existing refunds.</p>
          ) : existingRefunds.length === 0 ? (
            <p className="text-sm text-muted">No refunds found for this order.</p>
          ) : (
            existingRefunds.map((refund) => (
              <button
                key={String(refund.returnId)}
                type="button"
                onClick={() => router.push(`/refunds/${refund.returnId}`)}
                className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-mint/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{refund.returnNumber || String(refund.returnId)}</div>
                  <div className="text-sm text-muted">{money(refund.totalRefund)}</div>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {refund.refundMethod} · {refund.orderStatus}
                </div>
              </button>
            ))
          )}
        </div>
      </DetailSection>
    </div>
  );
}
