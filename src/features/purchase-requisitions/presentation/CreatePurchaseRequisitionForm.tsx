"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePurchaseRequisition } from "@/presentation/hooks/usePurchaseRequisitions";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  department: z.string().min(1, "Department is required"),
  justification: z.string().min(1, "Justification is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  department: "",
  justification: "",
};

const textAreaClass =
  "flex min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tracking-[0.02em] text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

export interface CreatePurchaseRequisitionFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

function sessionUserId(session: ReturnType<typeof useSession>["data"]): string {
  return session?.user && "id" in session.user
    ? String((session.user as { id?: string }).id ?? "")
    : "";
}

export function CreatePurchaseRequisitionForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreatePurchaseRequisitionFormProps) {
  const { data: session } = useSession();
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreatePurchaseRequisition();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    const requestedBy = sessionUserId(session).trim();
    if (!requestedBy) {
      toast.error("Sign in so we can send requestedBy.");
      return;
    }
    create.mutate(
      {
        tenantId: data.tenantId,
        requestedBy,
        department: data.department.trim(),
        justification: data.justification.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Purchase requisition created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create purchase requisition."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={Boolean(lockedTenantId)}
              >
                <SelectTrigger id="tenantId">
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
          {form.formState.errors.tenantId && (
            <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            {...form.register("department")}
            placeholder="e.g. Operations"
          />
          {form.formState.errors.department && (
            <p className="text-sm text-red-600">{form.formState.errors.department.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="justification">Justification</Label>
        <textarea
          id="justification"
          className={textAreaClass}
          rows={4}
          {...form.register("justification")}
          placeholder="Why is this purchase needed?"
        />
        {form.formState.errors.justification && (
          <p className="text-sm text-red-600">{form.formState.errors.justification.message}</p>
        )}
      </div>

      {!session?.user && (
        <p className="text-xs text-muted">
          Sign in so we can send <code className="text-xs">requestedBy</code> when
          your API requires it.
        </p>
      )}
    </form>
  );
}
