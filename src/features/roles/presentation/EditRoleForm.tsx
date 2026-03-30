"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useRole } from "@/presentation/hooks/useRoles";
import { useCreateRoleFormOptions } from "@/presentation/hooks/useCreateRoleFormOptions";
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

const OPTIONAL_PARENT = "__none__";

// Backend docs don't list PATCH/PUT for roles; we implement "edit" as create-like UI disabled for now.
// This preserves route consistency with the rest of your system without faking an update endpoint.
const schema = z.object({
  name: z.string().min(1, "Role name is required"),
});

type FormData = z.infer<typeof schema>;

export function EditRoleForm({ roleId }: { roleId: string }) {
  const router = useRouter();
  const { data: role, isLoading, error } = useRole(roleId);
  const { data: options, isLoading: isOptionsLoading } =
    useCreateRoleFormOptions();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (role) form.reset({ name: role.name });
  }, [role, form]);

  const tenantSelectValue = role?.tenantId ?? "";
  const parentSelectValue = role?.parentId ?? OPTIONAL_PARENT;

  const tenantLabel = useMemo(() => {
    if (!role?.tenantId) return "";
    const t = options?.tenants?.find((x) => x.id === role.tenantId);
    return t?.name ?? role.tenantId;
  }, [role, options?.tenants]);

  const parentLabel = useMemo(() => {
    if (!role?.parentId) return "";
    const r = options?.roles?.find((x) => x.id === role.parentId);
    return r?.name ?? role.parentId;
  }, [role, options?.roles]);

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !role)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Role not found.</p>
        <Link href="/roles">
          <Button variant="outline">Back to Roles</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/roles/${roleId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit role</h1>
      </div>

      <div className="panel rounded-xl border border-border bg-background p-5">
        <p className="text-sm text-muted">
          Role update endpoint is not available in the provided API docs. You can still manage permissions from the role detail page.
        </p>
      </div>

      <form className="space-y-4 max-w-2xl">
        <div className="grid gap-2">
          <Label htmlFor="name">Role name</Label>
          <Input id="name" {...form.register("name")} disabled />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-tenantId">Tenant</Label>
            <Select
              value={tenantSelectValue}
              disabled
            >
              <SelectTrigger id="edit-tenantId" className="disabled:opacity-80">
                <SelectValue
                  placeholder={
                    isOptionsLoading ? "Loading..." : tenantLabel || "—"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {role?.tenantId && (
                  <SelectItem value={role.tenantId}>
                    {tenantLabel}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-parentId">Parent role</Label>
            <Select
              value={parentSelectValue}
              disabled
            >
              <SelectTrigger id="edit-parentId" className="disabled:opacity-80">
                <SelectValue
                  placeholder={
                    isOptionsLoading
                      ? "Loading..."
                      : role?.parentId
                        ? parentLabel
                        : "None (top-level)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OPTIONAL_PARENT}>None (top-level)</SelectItem>
                {role?.parentId && (
                  <SelectItem value={role.parentId}>{parentLabel}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">Saved.</p>
        )}
        <div className="flex gap-2">
          <Button type="button" onClick={() => router.push(`/roles/${roleId}`)}>
            Back
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowSuccess(false)}>
            Close
          </Button>
        </div>
      </form>
    </div>
  );
}

