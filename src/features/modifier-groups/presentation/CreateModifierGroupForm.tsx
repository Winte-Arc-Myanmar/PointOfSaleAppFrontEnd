"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateModifierGroup } from "@/presentation/hooks/useModifierGroups";
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

const schema = z
  .object({
    tenantId: z.string().min(1, "Tenant is required"),
    name: z.string().min(1, "Name is required"),
    minSelection: z.number().int().min(0, "Min must be >= 0"),
    maxSelection: z.number().int().min(0, "Max must be >= 0"),
    isRequired: z.boolean(),
  })
  .refine((data) => data.maxSelection >= data.minSelection, {
    message: "Max must be greater than or equal to min",
    path: ["maxSelection"],
  });

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  name: "",
  minSelection: 0,
  maxSelection: 1,
  isRequired: false,
};

export interface CreateModifierGroupFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateModifierGroupForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateModifierGroupFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateModifierGroup();
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
    create.mutate(
      {
        tenantId: data.tenantId,
        name: data.name.trim(),
        minSelection: data.minSelection,
        maxSelection: data.maxSelection,
        isRequired: data.isRequired,
      },
      {
        onSuccess: () => {
          toast.success("Modifier group created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create modifier group."),
      },
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
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} placeholder="Choose protein" />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="minSelection">Min selection</Label>
          <Input
            id="minSelection"
            type="number"
            {...form.register("minSelection", { valueAsNumber: true })}
          />
          {form.formState.errors.minSelection && (
            <p className="text-sm text-red-600">{form.formState.errors.minSelection.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="maxSelection">Max selection</Label>
          <Input
            id="maxSelection"
            type="number"
            {...form.register("maxSelection", { valueAsNumber: true })}
          />
          {form.formState.errors.maxSelection && (
            <p className="text-sm text-red-600">{form.formState.errors.maxSelection.message}</p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-emerald-500"
          {...form.register("isRequired")}
        />
        <span className="text-sm text-foreground">Required selection</span>
      </label>
    </form>
  );
}
