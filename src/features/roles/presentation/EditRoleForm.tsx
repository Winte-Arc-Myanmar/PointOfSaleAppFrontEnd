"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useRole, useCreateRole } from "@/presentation/hooks/useRoles";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";

// Backend docs don't list PATCH/PUT for roles; we implement "edit" as create-like UI disabled for now.
// This preserves route consistency with the rest of your system without faking an update endpoint.
const schema = z.object({
  name: z.string().min(1, "Role name is required"),
});

type FormData = z.infer<typeof schema>;

export function EditRoleForm({ roleId }: { roleId: string }) {
  const router = useRouter();
  const { data: role, isLoading, error } = useRole(roleId);
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (role) form.reset({ name: role.name });
  }, [role, form]);

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

