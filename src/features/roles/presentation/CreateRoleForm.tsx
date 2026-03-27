"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateRole, useRoles } from "@/presentation/hooks/useRoles";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { Label } from "@/presentation/components/ui/label";
import { Input } from "@/presentation/components/ui/input";

const schema = z.object({
  name: z.string().min(1, "Role name is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
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
  const { tenantId } = usePermissions();
  const { data: roles = [] } = useRoles();
  const createRole = useCreateRole();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      tenantId: tenantId ?? "",
      parentId: "",
      isSystemDefault: false,
    },
  });

  useEffect(() => {
    if (tenantId) form.setValue("tenantId", tenantId);
  }, [tenantId, form]);

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
          form.reset({ ...form.getValues(), name: "" });
          onSuccess();
        },
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
          <Label htmlFor="tenantId">Tenant ID</Label>
          <Input
            id="tenantId"
            placeholder="UUID"
            {...form.register("tenantId")}
            disabled={Boolean(tenantId)}
          />
          {form.formState.errors.tenantId && (
            <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="parentId">Parent role ID (optional)</Label>
          <Input id="parentId" placeholder="UUID" {...form.register("parentId")} />
          <p className="text-xs text-muted">
            Use parent roles to build a hierarchy (optional).
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
        <span className="ml-auto text-xs text-muted">
          {roles.length} roles loaded
        </span>
      </div>
    </form>
  );
}

