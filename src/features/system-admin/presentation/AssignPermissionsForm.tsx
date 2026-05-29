"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useAssignPermissions } from "@/presentation/hooks/useSystemAdmin";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useAssignPermissionsOptions } from "@/presentation/hooks/useSystemAdminAssignOptions";
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
import { cn } from "@/lib/utils";

const schema = z.object({
  roleId: z.string().min(1, "Role ID is required"),
  permissionIds: z.array(z.string()).min(1, "At least one permission is required"),
});

type FormData = z.infer<typeof schema>;

export function AssignPermissionsForm() {
  const assignPermissions = useAssignPermissions();
  const toast = useToast();
  const { data: options, isLoading: isOptionsLoading } =
    useAssignPermissionsOptions();
  const [showSuccess, setShowSuccess] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [isPermissionMenuOpen, setIsPermissionMenuOpen] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { roleId: "", permissionIds: [] },
  });

  const selectedPermissionIds = form.watch("permissionIds");

  const filteredPermissions = useMemo(() => {
    const query = permissionSearch.trim().toLowerCase();
    const permissions = options?.permissions ?? [];

    if (!query) return permissions;

    return permissions.filter((permission) => {
      const label = `${permission.module}:${permission.subject}:${permission.action}`;
      return label.toLowerCase().includes(query);
    });
  }, [options?.permissions, permissionSearch]);

  const togglePermission = (permissionId: string) => {
    const current = form.getValues("permissionIds");
    const next = current.includes(permissionId)
      ? current.filter((id) => id !== permissionId)
      : [...current, permissionId];

    form.setValue("permissionIds", next, { shouldValidate: true });
  };

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    assignPermissions.mutate(
      { roleId: data.roleId, permissionIds: data.permissionIds },
      {
        onSuccess: () => {
          toast.success("Permissions assigned.");
          setShowSuccess(true);
          form.reset();
          setPermissionSearch("");
          setIsPermissionMenuOpen(false);
        },
        onError: () => toast.error("Failed to assign permissions."),
      }
    );
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-3xl space-y-4"
    >
      <div className="grid max-w-xl gap-2">
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
        {form.formState.errors.roleId ? (
          <p className="text-sm text-red-600">
            {form.formState.errors.roleId.message}
          </p>
        ) : null}
      </div>

      <div className="grid max-w-xl gap-2">
        <Label htmlFor="permission-trigger">Permissions *</Label>
        <div className="relative">
          <button
            id="permission-trigger"
            type="button"
            onClick={() => setIsPermissionMenuOpen((open) => !open)}
            className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-background px-3 text-left text-sm text-foreground transition hover:border-mint/40 focus:outline-none focus:ring-2 focus:ring-mint/30"
          >
            <span className="truncate pr-3 text-muted">
              {selectedPermissionIds.length > 0
                ? `${selectedPermissionIds.length} permission${selectedPermissionIds.length === 1 ? "" : "s"} selected`
                : isOptionsLoading
                  ? "Loading permissions..."
                  : "Select permissions"}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted transition-transform",
                isPermissionMenuOpen && "rotate-180",
              )}
            />
          </button>

          {isPermissionMenuOpen ? (
            <div className="absolute z-30 mt-2 w-full rounded-xl border border-border bg-background p-3 shadow-lg">
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                    <Input
                      id="permission-search"
                      value={permissionSearch}
                      onChange={(event) => setPermissionSearch(event.target.value)}
                      placeholder={
                        isOptionsLoading
                          ? "Loading permissions..."
                          : "Search permissions"
                      }
                      disabled={isOptionsLoading}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={filteredPermissions.length === 0}
                      onClick={() => {
                        const current = new Set(form.getValues("permissionIds"));
                        filteredPermissions.forEach((permission) =>
                          current.add(permission.id),
                        );
                        form.setValue("permissionIds", Array.from(current), {
                          shouldValidate: true,
                        });
                      }}
                    >
                      Select all
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={selectedPermissionIds.length === 0}
                      onClick={() =>
                        form.setValue("permissionIds", [], {
                          shouldValidate: true,
                        })
                      }
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto rounded-lg border border-border/70 bg-background/50">
                  {filteredPermissions.length > 0 ? (
                    <div className="divide-y divide-border/60">
                      {filteredPermissions.map((permission) => {
                        const label = `${permission.module}:${permission.subject}:${permission.action}`;
                        const isSelected = selectedPermissionIds.includes(permission.id);

                        return (
                          <button
                            key={permission.id}
                            type="button"
                            onClick={() => togglePermission(permission.id)}
                            className={cn(
                              "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                              isSelected
                                ? "bg-mint/10 text-foreground"
                                : "text-muted hover:bg-mint/5 hover:text-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-5 shrink-0 items-center justify-center rounded border",
                                isSelected
                                  ? "border-mint bg-mint/20 text-mint"
                                  : "border-border text-transparent",
                              )}
                            >
                              <Check className="size-3.5" />
                            </span>
                            <span className="break-all">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="px-3 py-4 text-sm text-muted">
                      No permissions match your search.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted">
                    {selectedPermissionIds.length} permission
                    {selectedPermissionIds.length === 1 ? "" : "s"} selected.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsPermissionMenuOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {selectedPermissionIds.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedPermissionIds.map((id) => {
              const permission = (options?.permissions ?? []).find((item) => item.id === id);
              const label = permission
                ? `${permission.module}:${permission.subject}:${permission.action}`
                : id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => togglePermission(id)}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground hover:bg-mint/10"
                  title="Remove"
                >
                  <span>{label}</span>
                  <X className="ml-1 inline size-3" />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted">No permissions selected yet.</p>
        )}

        {form.formState.errors.permissionIds ? (
          <p className="text-sm text-red-600">
            {form.formState.errors.permissionIds.message}
          </p>
        ) : null}
      </div>

      {showSuccess ? (
        <p className="font-medium text-sm text-green-600">
          Permissions assigned successfully.
        </p>
      ) : null}
      {assignPermissions.isError ? (
        <p className="text-sm text-red-600">
          Failed to assign permissions. Please try again.
        </p>
      ) : null}

      <Button type="submit" disabled={assignPermissions.isPending}>
        {assignPermissions.isPending ? "Assigning..." : "Assign permissions"}
      </Button>
    </form>
  );
}
