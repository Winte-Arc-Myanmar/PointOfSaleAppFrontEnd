"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAssignRole } from "@/presentation/hooks/useSystemAdmin";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

const schema = z.object({
  userId: z.string().min(1, "User ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  branchId: z.string().min(1, "Branch ID is required"),
});

type FormData = z.infer<typeof schema>;

export function AssignRoleForm() {
  const assignRole = useAssignRole();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { userId: "", roleId: "", tenantId: "", branchId: "" },
  });

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    assignRole.mutate(data, {
      onSuccess: () => {
        setShowSuccess(true);
        form.reset();
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="userId">User ID *</Label>
          <Input id="userId" {...form.register("userId")} placeholder="UUID" />
          {form.formState.errors.userId && <p className="text-sm text-red-600">{form.formState.errors.userId.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="roleId">Role ID *</Label>
          <Input id="roleId" {...form.register("roleId")} placeholder="UUID" />
          {form.formState.errors.roleId && <p className="text-sm text-red-600">{form.formState.errors.roleId.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant ID *</Label>
          <Input id="tenantId" {...form.register("tenantId")} placeholder="UUID" />
          {form.formState.errors.tenantId && <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="branchId">Branch ID *</Label>
          <Input id="branchId" {...form.register("branchId")} placeholder="UUID" />
          {form.formState.errors.branchId && <p className="text-sm text-red-600">{form.formState.errors.branchId.message}</p>}
        </div>
      </div>

      {showSuccess && <p className="text-sm text-green-600 font-medium">Role assigned successfully.</p>}
      {assignRole.isError && <p className="text-sm text-red-600">Failed to assign role. Please try again.</p>}

      <Button type="submit" disabled={assignRole.isPending}>
        {assignRole.isPending ? "Assigning..." : "Assign role"}
      </Button>
    </form>
  );
}
