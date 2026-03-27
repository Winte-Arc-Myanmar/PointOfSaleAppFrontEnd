"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAssignRole } from "@/presentation/hooks/useSystemAdmin";
import { useAssignRoleOptions } from "@/presentation/hooks/useSystemAdminAssignOptions";
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
  userId: z.string().min(1, "User ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  branchId: z.string().min(1, "Branch ID is required"),
});

type FormData = z.infer<typeof schema>;

export function AssignRoleForm() {
  const assignRole = useAssignRole();
  const { data: options, isLoading: isOptionsLoading } = useAssignRoleOptions();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { userId: "", roleId: "", tenantId: "", branchId: "" },
  });
  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });
  const filteredRoles = (options?.roles ?? []).filter((r) =>
    selectedTenantId ? r.tenantId === selectedTenantId : true
  );
  const filteredBranches = (options?.branches ?? []).filter((b) =>
    selectedTenantId ? b.tenantId === selectedTenantId : true
  );

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
          <Label htmlFor="userId">User *</Label>
          <Controller
            control={form.control}
            name="userId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isOptionsLoading}
              >
                <SelectTrigger id="userId">
                  <SelectValue
                    placeholder={isOptionsLoading ? "Loading users..." : "Select user"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(options?.users ?? [])
                    .filter((u) => typeof u.id === "string" && u.id.length > 0)
                    .map((u) => (
                    <SelectItem key={u.id} value={u.id as string}>
                      {u.fullName} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.userId && <p className="text-sm text-red-600">{form.formState.errors.userId.message}</p>}
        </div>
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
                  {filteredRoles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.roleId && <p className="text-sm text-red-600">{form.formState.errors.roleId.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant *</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  // reset dependent selections
                  form.setValue("roleId", "");
                  form.setValue("branchId", "");
                }}
                disabled={isOptionsLoading}
              >
                <SelectTrigger id="tenantId">
                  <SelectValue
                    placeholder={isOptionsLoading ? "Loading tenants..." : "Select tenant"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(options?.tenants ?? []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.tenantId && <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="branchId">Branch *</Label>
          <Controller
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isOptionsLoading}
              >
                <SelectTrigger id="branchId">
                  <SelectValue
                    placeholder={isOptionsLoading ? "Loading branches..." : "Select branch"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredBranches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} ({b.branchCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
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
