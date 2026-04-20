"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePosSession } from "@/presentation/hooks/usePosSessions";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePosRegisters } from "@/presentation/hooks/usePosRegisters";
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

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  registerId: z.string().min(1, "Register is required"),
  cashierId: z.string().min(1, "Cashier ID is required"),
  openingCashFloat: z.number(),
  expectedClosingCash: z.number(),
  actualClosingCash: z.number().nullable(),
  cashVariance: z.number().nullable(),
  closedAt: z.string(),
  status: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  registerId: "",
  cashierId: "",
  openingCashFloat: 0,
  expectedClosingCash: 0,
  actualClosingCash: null,
  cashVariance: null,
  closedAt: "",
  status: "OPEN",
};

export interface CreatePosSessionFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreatePosSessionForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreatePosSessionFormProps) {
  const create = useCreatePosSession();
  const toast = useToast();
  const { data: tenants = [] } = useTenants();
  const { data: registers = [] } = usePosRegisters({ page: 1, limit: 200 });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  const tenantId = useWatch({ control: form.control, name: "tenantId" });
  const filteredRegisters = useMemo(
    () => registers.filter((r) => (tenantId ? r.tenantId === tenantId : true)),
    [registers, tenantId]
  );

  const onSubmit = (data: FormData) => {
    const closedAt = data.closedAt.trim();
    create.mutate(
      {
        tenantId: data.tenantId,
        registerId: data.registerId,
        cashierId: data.cashierId,
        openingCashFloat: data.openingCashFloat,
        expectedClosingCash: data.expectedClosingCash,
        actualClosingCash: data.actualClosingCash,
        cashVariance: data.cashVariance,
        closedAt: closedAt ? new Date(closedAt).toISOString() : null,
        status: data.status,
      } as any,
      {
        onSuccess: () => {
          toast.success("POS session created.");
          form.reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create POS session."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Tenant</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Input {...form.register("status")} placeholder="OPEN" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Register</Label>
          <Controller
            control={form.control}
            name="registerId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={!tenantId}>
                <SelectTrigger>
                  <SelectValue placeholder={!tenantId ? "Select tenant first" : "Select register"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredRegisters.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label>Cashier ID</Label>
          <Input className="font-mono text-sm" {...form.register("cashierId")} placeholder="uuid" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Opening cash float</Label>
          <Input type="number" step="0.01" {...form.register("openingCashFloat", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <Label>Expected closing cash</Label>
          <Input type="number" step="0.01" {...form.register("expectedClosingCash", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <Label>Actual closing cash</Label>
          <Input
            type="number"
            step="0.01"
            value={form.watch("actualClosingCash") ?? ""}
            onChange={(e) =>
              form.setValue(
                "actualClosingCash",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
          />
        </div>
        <div className="grid gap-2">
          <Label>Cash variance</Label>
          <Input
            type="number"
            step="0.01"
            value={form.watch("cashVariance") ?? ""}
            onChange={(e) =>
              form.setValue(
                "cashVariance",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Closed at (optional)</Label>
        <Input type="datetime-local" {...form.register("closedAt")} />
      </div>

      {!formId && (
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create POS Session"}
        </Button>
      )}
    </form>
  );
}

