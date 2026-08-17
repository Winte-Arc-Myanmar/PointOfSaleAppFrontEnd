"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSystemAdminCreateUser } from "@/presentation/hooks/useSystemAdmin";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useSystemAdminCreateUserOptions } from "@/presentation/hooks/useSystemAdminCreateUserOptions";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { ImageUploadField } from "@/presentation/components/upload/ImageUploadField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import {
  createUserDefaultValues,
  optionalUrl,
  USER_PREFERRED_LANGUAGES,
} from "@/features/users/presentation/user-form-schema";
import {
  systemAdminCreateUserSchema,
  type SystemAdminCreateUserFormData,
} from "./system-admin-form-schema";

export function SystemAdminCreateUserForm() {
  const router = useRouter();
  const createUser = useSystemAdminCreateUser();
  const toast = useToast();
  const { data: options, isLoading: isOptionsLoading } = useSystemAdminCreateUserOptions();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<SystemAdminCreateUserFormData>({
    resolver: zodResolver(systemAdminCreateUserSchema),
    defaultValues: {
      ...createUserDefaultValues,
      tenantId: "",
    },
  });

  const onSubmit = (data: SystemAdminCreateUserFormData) => {
    setShowSuccess(false);
    createUser.mutate(
      {
        email: data.email,
        password: data.password,
        username: data.username,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        avatarUrl: optionalUrl(data.avatarUrl),
        jobTitle: data.jobTitle,
        roleId: data.roleId,
        branchId: data.branchId,
        tenantId: data.tenantId,
        preferredLanguage: data.preferredLanguage,
      },
      {
        onSuccess: () => {
          toast.success("User created.");
          setShowSuccess(true);
          form.reset();
          setTimeout(() => router.push("/users"), 1500);
        },
        onError: () => toast.error("Failed to create user."),
      }
    );
  };

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });
  const filteredRoles = (options?.roles ?? []).filter((r) =>
    selectedTenantId ? r.tenantId === selectedTenantId : true
  );
  const filteredBranches = (options?.branches ?? []).filter((b) =>
    selectedTenantId ? b.tenantId === selectedTenantId : true
  );

  useEffect(() => {
    const currentRoleId = form.getValues("roleId");
    const currentBranchId = form.getValues("branchId");
    if (currentRoleId && !filteredRoles.some((r) => r.id === currentRoleId)) {
      form.setValue("roleId", "");
    }
    if (currentBranchId && !filteredBranches.some((b) => b.id === currentBranchId)) {
      form.setValue("branchId", "");
    }
  }, [filteredRoles, filteredBranches, form]);

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
          <Input id="password" type="password" {...form.register("password")} placeholder="At least 8 characters" />
          {form.formState.errors.password && <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant *</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                disabled={isOptionsLoading}
              >
                <SelectTrigger id="tenantId">
                  <SelectValue
                    placeholder={isOptionsLoading ? "Loading tenants..." : "Select tenant"}
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
                onValueChange={(value) => field.onChange(value)}
                disabled={isOptionsLoading}
              >
                <SelectTrigger id="branchId">
                  <SelectValue
                    placeholder={isOptionsLoading ? "Loading branches..." : "Select branch"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.branchCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.branchId && <p className="text-sm text-red-600">{form.formState.errors.branchId.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="roleId">Role *</Label>
          <Controller
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                disabled={isOptionsLoading}
              >
                <SelectTrigger id="roleId">
                  <SelectValue
                    placeholder={isOptionsLoading ? "Loading roles..." : "Select role"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredRoles.map((role) => (
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
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="phoneNumber">Phone *</Label>
          <Input id="phoneNumber" {...form.register("phoneNumber")} placeholder="+1234567890" />
          {form.formState.errors.phoneNumber && <p className="text-sm text-red-600">{form.formState.errors.phoneNumber.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="jobTitle">Job title *</Label>
          <Input id="jobTitle" {...form.register("jobTitle")} />
          {form.formState.errors.jobTitle && <p className="text-sm text-red-600">{form.formState.errors.jobTitle.message}</p>}
        </div>
      </div>
      <Controller
        control={form.control}
        name="avatarUrl"
        render={({ field }) => (
          <ImageUploadField
            id="avatarUrl"
            label="Avatar"
            value={field.value}
            onChange={field.onChange}
            folder="users"
            error={form.formState.errors.avatarUrl?.message}
          />
        )}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="preferredLanguage">Preferred language *</Label>
          <Controller
            control={form.control}
            name="preferredLanguage"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="preferredLanguage">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {USER_PREFERRED_LANGUAGES.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.preferredLanguage && (
            <p className="text-sm text-red-600">{form.formState.errors.preferredLanguage.message}</p>
          )}
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
