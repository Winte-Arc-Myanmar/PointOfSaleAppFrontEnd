"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/presentation/providers/ToastProvider";
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
import { AppLoader } from "@/presentation/components/loader";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePosRegisters } from "@/presentation/hooks/usePosRegisters";
import { usePosSession, useUpdatePosSession } from "@/presentation/hooks/usePosSessions";

const schema = z.object({
  tenantId: z.string().min(1),
  registerId: z.string().min(1),
  cashierId: z.string().min(1),
  openingCashFloat: z.number(),
  expectedClosingCash: z.number(),
  actualClosingCash: z.number().nullable(),
  cashVariance: z.number().nullable(),
  closedAt: z.string(),
  status: z.string().min(1),
});

type FormData = z.infer<typeof schema>;
const REDIRECT_DELAY_MS = 1500;

function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function EditPosSessionForm({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdatePosSession();
  const { data: session, isLoading, error } = usePosSession(sessionId);
  const { data: tenants = [] } = useTenants();
  const { data: registers = [] } = usePosRegisters({ page: 1, limit: 200 });
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      registerId: "",
      cashierId: "",
      openingCashFloat: 0,
      expectedClosingCash: 0,
      actualClosingCash: null,
      cashVariance: null,
      closedAt: "",
      status: "OPEN",
    },
  });

  useEffect(() => {
    if (session) {
      form.reset({
        tenantId: session.tenantId,
        registerId: session.registerId,
        cashierId: session.cashierId,
        openingCashFloat: session.openingCashFloat,
        expectedClosingCash: session.expectedClosingCash,
        actualClosingCash: session.actualClosingCash ?? null,
        cashVariance: session.cashVariance ?? null,
        closedAt: toLocalInputValue(session.closedAt ?? undefined),
        status: session.status,
      });
    }
  }, [session, form]);

  const tenantId = useWatch({ control: form.control, name: "tenantId" });
  const filteredRegisters = useMemo(
    () => registers.filter((r) => (tenantId ? r.tenantId === tenantId : true)),
    [registers, tenantId]
  );

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    const closedAt = data.closedAt.trim();
    update.mutate(
      {
        id: sessionId,
        data: {
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
      },
      {
        onSuccess: () => {
          toast.success("POS session updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/pos-sessions/${sessionId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update POS session."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !session) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">POS session not found.</p>
        <Link href="/pos-sessions">
          <Button variant="outline">Back to POS sessions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/pos-sessions/${sessionId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit POS session</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
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
            <Input {...form.register("status")} />
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
            <Input className="font-mono text-sm" {...form.register("cashierId")} />
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

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            POS session updated successfully. Redirecting...
          </p>
        )}
        {update.isError && <p className="text-sm text-red-600">Failed to update POS session.</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/pos-sessions/${sessionId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

