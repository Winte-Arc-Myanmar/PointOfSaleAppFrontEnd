"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTableSessions } from "@/presentation/hooks/useTableSessions";
import { useSalesOrders } from "@/presentation/hooks/useSalesOrders";
import { useFireKdsPendingLines } from "@/presentation/hooks/useKdsTickets";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const NONE = "__NONE__";

const schema = z
  .object({
    sessionId: z.string().optional(),
    salesOrderId: z.string().optional(),
  })
  .refine((data) => Boolean(data.sessionId || data.salesOrderId), {
    message: "Select session or sales order to fire.",
    path: ["sessionId"],
  });

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  sessionId: "",
  salesOrderId: "",
};

export interface FireKdsTicketFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function FireKdsTicketForm({ onSuccess, formId, onLoadingChange }: FireKdsTicketFormProps) {
  const toast = useToast();
  const fire = useFireKdsPendingLines();
  const { data: sessionsResult } = useTableSessions({
    page: 1,
    limit: 200,
    openOnly: true,
    sortBy: "openedAt",
    sortOrder: "desc",
  });
  const { data: salesOrdersResult } = useSalesOrders({
    page: 1,
    limit: 200,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const sessions = getPaginatedItems(sessionsResult);
  const salesOrders = getPaginatedItems(salesOrdersResult);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const sessionId = useWatch({ control: form.control, name: "sessionId" });
  const salesOrderId = useWatch({ control: form.control, name: "salesOrderId" });

  useEffect(() => {
    onLoadingChange?.(fire.isPending ?? false);
  }, [fire.isPending, onLoadingChange]);

  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ id: String(s.id), label: `${s.id} (${s.sessionState})` })),
    [sessions],
  );
  const salesOrderOptions = useMemo(
    () =>
      salesOrders.map((o) => ({
        id: String(o.id),
        label: `${o.orderNumber} (${o.status})`,
      })),
    [salesOrders],
  );

  const onSubmit = (data: FormData) => {
    fire.mutate(
      {
        sessionId: data.sessionId || undefined,
        salesOrderId: data.salesOrderId || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Pending lines fired to KDS.");
          form.reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to fire lines to KDS."),
      },
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label>Dine-in session (optional)</Label>
        <Controller
          control={form.control}
          name="sessionId"
          render={({ field }) => (
            <Select
              value={field.value || NONE}
              onValueChange={(value) => {
                const mapped = value === NONE ? "" : value;
                field.onChange(mapped);
                if (mapped) form.setValue("salesOrderId", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select open table session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                {sessionOptions.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid gap-2">
        <Label>Counter/QSR sales order (optional)</Label>
        <Controller
          control={form.control}
          name="salesOrderId"
          render={({ field }) => (
            <Select
              value={field.value || NONE}
              onValueChange={(value) => {
                const mapped = value === NONE ? "" : value;
                field.onChange(mapped);
                if (mapped) form.setValue("sessionId", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sales order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                {salesOrderOptions.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {form.formState.errors.sessionId && (
        <p className="text-sm text-red-600">{form.formState.errors.sessionId.message}</p>
      )}

      {sessionId || salesOrderId ? (
        <p className="text-xs text-muted">
          This will create KDS tickets from pending lines and route them by station rules.
        </p>
      ) : null}
    </form>
  );
}
