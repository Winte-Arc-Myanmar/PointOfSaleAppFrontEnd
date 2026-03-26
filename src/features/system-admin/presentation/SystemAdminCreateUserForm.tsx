"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSystemAdminCreateUser } from "@/presentation/hooks/useSystemAdmin";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(1, "Username is required"),
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string(),
  avatarUrl: z.string().url("Invalid URL").or(z.literal("")),
  jobTitle: z.string(),
  roleId: z.string().min(1, "Role ID is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  preferredLanguage: z.string(),
});

type FormData = z.infer<typeof schema>;

export function SystemAdminCreateUserForm() {
  const router = useRouter();
  const createUser = useSystemAdminCreateUser();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "", password: "", username: "", fullName: "",
      phoneNumber: "", avatarUrl: "", jobTitle: "",
      roleId: "", branchId: "", tenantId: "", preferredLanguage: "EN",
    },
  });

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    createUser.mutate(
      {
        email: data.email,
        password: data.password,
        username: data.username,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || undefined,
        avatarUrl: data.avatarUrl || undefined,
        jobTitle: data.jobTitle || undefined,
        roleId: data.roleId,
        branchId: data.branchId,
        tenantId: data.tenantId,
        preferredLanguage: data.preferredLanguage || undefined,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          form.reset();
          setTimeout(() => router.push("/users"), 1500);
        },
      }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full name *</Label>
          <Input id="fullName" {...form.register("fullName")} />
          {form.formState.errors.fullName && <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="username">Username *</Label>
          <Input id="username" {...form.register("username")} />
          {form.formState.errors.username && <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email && <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password *</Label>
          <Input id="password" type="password" {...form.register("password")} placeholder="••••••••" />
          {form.formState.errors.password && <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div className="grid gap-2">
          <Label htmlFor="roleId">Role ID *</Label>
          <Input id="roleId" {...form.register("roleId")} placeholder="UUID" />
          {form.formState.errors.roleId && <p className="text-sm text-red-600">{form.formState.errors.roleId.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="phoneNumber">Phone</Label>
          <Input id="phoneNumber" {...form.register("phoneNumber")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="jobTitle">Job title</Label>
          <Input id="jobTitle" {...form.register("jobTitle")} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="avatarUrl">Avatar URL</Label>
          <Input id="avatarUrl" type="url" {...form.register("avatarUrl")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="preferredLanguage">Preferred language</Label>
          <Input id="preferredLanguage" {...form.register("preferredLanguage")} />
        </div>
      </div>

      {showSuccess && <p className="text-sm text-green-600 font-medium">User created successfully. Redirecting...</p>}
      {createUser.isError && <p className="text-sm text-red-600">Failed to create user. Please try again.</p>}

      <Button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? "Creating..." : "Create user"}
      </Button>
    </form>
  );
}
