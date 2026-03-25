"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAssignPermissions } from "@/presentation/hooks/useSystemAdmin";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

const schema = z.object({
  roleId: z.string().min(1, "Role ID is required"),
  permissionIds: z.string().min(1, "At least one permission ID is required"),
});

type FormData = z.infer<typeof schema>;

export function AssignPermissionsForm() {
  const assignPermissions = useAssignPermissions();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { roleId: "", permissionIds: "" },
  });

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    const ids = data.permissionIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    assignPermissions.mutate(
      { roleId: data.roleId, permissionIds: ids },
      {
        onSuccess: () => {
          setShowSuccess(true);
          form.reset();
        },
      }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <div className="grid gap-2">
        <Label htmlFor="roleId">Role ID *</Label>
        <Input id="roleId" {...form.register("roleId")} placeholder="UUID of the role" />
        {form.formState.errors.roleId && <p className="text-sm text-red-600">{form.formState.errors.roleId.message}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="permissionIds">Permission IDs *</Label>
        <Input id="permissionIds" {...form.register("permissionIds")} placeholder="uuid1, uuid2, uuid3" />
        <p className="text-xs text-muted">Comma-separated list of permission UUIDs.</p>
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
