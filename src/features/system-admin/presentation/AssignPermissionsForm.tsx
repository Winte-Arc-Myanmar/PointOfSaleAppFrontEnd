"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAssignPermissions } from "@/presentation/hooks/useSystemAdmin";
import { useAssignPermissionsOptions } from "@/presentation/hooks/useSystemAdminAssignOptions";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const schema = z.object({
  roleId: z.string().min(1, "Role ID is required"),
  permissionIds: z.array(z.string()).min(1, "At least one permission is required"),
});

type FormData = z.infer<typeof schema>;

export function AssignPermissionsForm() {
  const assignPermissions = useAssignPermissions();
  const { data: options, isLoading: isOptionsLoading } = useAssignPermissionsOptions();
  const [showSuccess, setShowSuccess] = useState(false);
  const [nextPermissionId, setNextPermissionId] = useState("");
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { roleId: "", permissionIds: [] },
  });

  const selectedPermissionIds = form.watch("permissionIds");

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    assignPermissions.mutate(
      { roleId: data.roleId, permissionIds: data.permissionIds },
      {
        onSuccess: () => {
          setShowSuccess(true);
          form.reset();
          setNextPermissionId("");
        },
      }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <div className="grid gap-2">
        <Label htmlFor="roleId">Role *</Label>
        <Controller
          control={form.control}
          name="roleId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isOptionsLoading}
            >
              <SelectTrigger id="roleId">
                <SelectValue
                  placeholder={isOptionsLoading ? "Loading roles..." : "Select role"}
                />
              </SelectTrigger>
              <SelectContent>
                {(options?.roles ?? []).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.roleId && <p className="text-sm text-red-600">{form.formState.errors.roleId.message}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="permissionIds">Permissions *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
          <Select
            value={nextPermissionId}
            onValueChange={setNextPermissionId}
            disabled={isOptionsLoading}
          >
            <SelectTrigger id="permissionIds">
              <SelectValue
                placeholder={isOptionsLoading ? "Loading permissions..." : "Select permission"}
              />
            </SelectTrigger>
            <SelectContent>
              {(options?.permissions ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.module}:{p.subject}:{p.action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (!nextPermissionId) return;
              const current = form.getValues("permissionIds");
              if (!current.includes(nextPermissionId)) {
                form.setValue("permissionIds", [...current, nextPermissionId], {
                  shouldValidate: true,
                });
              }
              setNextPermissionId("");
            }}
            disabled={!nextPermissionId}
          >
            Add
          </Button>
        </div>
        {selectedPermissionIds.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedPermissionIds.map((id) => {
              const p = (options?.permissions ?? []).find((x) => x.id === id);
              const label = p ? `${p.module}:${p.subject}:${p.action}` : id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    form.setValue(
                      "permissionIds",
                      selectedPermissionIds.filter((x) => x !== id),
                      { shouldValidate: true }
                    )
                  }
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground hover:bg-mint/10"
                  title="Remove"
                >
                  {label} ×
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted">No permissions selected yet.</p>
        )}
        {form.formState.errors.permissionIds && <p className="text-sm text-red-600">{form.formState.errors.permissionIds.message}</p>}
      </div>

      {showSuccess && <p className="text-sm text-green-600 font-medium">Permissions assigned successfully.</p>}
      {assignPermissions.isError && <p className="text-sm text-red-600">Failed to assign permissions. Please try again.</p>}

      <Button type="submit" disabled={assignPermissions.isPending}>
        {assignPermissions.isPending ? "Assigning..." : "Assign permissions"}
      </Button>
    </form>
  );
}
