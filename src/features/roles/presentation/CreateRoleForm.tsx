"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateRole } from "@/presentation/hooks/useRoles";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useCreateRoleFormOptions } from "@/presentation/hooks/useCreateRoleFormOptions";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { Label } from "@/presentation/components/ui/label";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const OPTIONAL_PARENT = "__none__";

const schema = z.object({
  name: z.string().min(1, "Role name is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  parentId: z.string().optional(),
  isSystemDefault: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export function CreateRoleForm({
  formId,
  onSuccess,
  onLoadingChange,
}: {
  formId: string;
  onSuccess: () => void;
  onLoadingChange: (loading: boolean) => void;
}) {
  const { tenantId: lockedTenantId } = usePermissions();
  const { data: options, isLoading: isOptionsLoading } =
    useCreateRoleFormOptions();
  const createRole = useCreateRole();
  const toast = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      tenantId: lockedTenantId ?? "",
      parentId: "",
      isSystemDefault: false,
    },
  });

  const selectedTenantId = useWatch({
    control: form.control,
    name: "tenantId",
  });

  const parentRoleOptions = useMemo(
    () =>
      (options?.roles ?? []).filter((r) =>
        selectedTenantId ? r.tenantId === selectedTenantId : false
      ),
    [options?.roles, selectedTenantId]
  );

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    if (isOptionsLoading) return;
    const parentId = form.getValues("parentId");
    if (
      parentId &&
      !parentRoleOptions.some((r) => r.id === parentId)
    ) {
      form.setValue("parentId", "");
    }
  }, [parentRoleOptions, form, isOptionsLoading]);

  useEffect(() => {
    onLoadingChange(createRole.isPending);
  }, [createRole.isPending, onLoadingChange]);

  const onSubmit = (data: FormData) => {
    createRole.mutate(
      {
        name: data.name,
        tenantId: data.tenantId,
        parentId: data.parentId?.trim() ? data.parentId.trim() : undefined,
        isSystemDefault: Boolean(data.isSystemDefault),
      },
      {
        onSuccess: () => {
          toast.success("Role created.");
          form.reset({
            name: "",
            tenantId: lockedTenantId ?? data.tenantId,
            parentId: "",
            isSystemDefault: false,
          });
          onSuccess();
        },
        onError: () => toast.error("Failed to create role."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="roleName">Role name</Label>
        <Input id="roleName" placeholder="Store Manager" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                disabled={isOptionsLoading || Boolean(lockedTenantId)}
              >
                <SelectTrigger id="tenantId">
                  <SelectValue
                    placeholder={
                      isOptionsLoading ? "Loading tenants..." : "Select tenant"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(options?.tenants ?? []).map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
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
          <Label htmlFor="parentId">Parent role (optional)</Label>
          <Controller
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <Select
                value={field.value ? field.value : OPTIONAL_PARENT}
                onValueChange={(value) =>
                  field.onChange(value === OPTIONAL_PARENT ? "" : value)
                }
                disabled={isOptionsLoading || !selectedTenantId}
              >
                <SelectTrigger id="parentId">
                  <SelectValue
                    placeholder={
                      !selectedTenantId
                        ? "Select a tenant first"
                        : isOptionsLoading
                          ? "Loading roles..."
                          : "None (top-level)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OPTIONAL_PARENT}>None (top-level)</SelectItem>
                  {parentRoleOptions.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted">
            Use a parent role to build a hierarchy (optional).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
        <input
          id="isSystemDefault"
          type="checkbox"
          className="h-4 w-4 accent-emerald-500"
          {...form.register("isSystemDefault")}
        />
        <Label htmlFor="isSystemDefault" className="cursor-pointer">
          System default
        </Label>
      </div>
    </form>
  );
}

