"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUser } from "@/presentation/hooks/useUsers";
import { useSystemAdminCreateUser } from "@/presentation/hooks/useSystemAdmin";
import { useCreateUserFormOptions } from "@/presentation/hooks/useCreateUserFormOptions";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useToast } from "@/presentation/providers/ToastProvider";
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
  createUserSchema,
  optionalUrl,
  USER_PREFERRED_LANGUAGES,
  type CreateUserFormData,
} from "./user-form-schema";

export interface CreateUserFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateUserForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateUserFormProps) {
  const { data: session } = useSession();
  const tenantId = session?.user?.tenantId;
  const { isSystemAdmin } = usePermissions();
  const createUser = useCreateUser();
  const createSystemAdminUser = useSystemAdminCreateUser();
  const toast = useToast();
  const { data: options, isLoading: isOptionsLoading } =
    useCreateUserFormOptions();

  useEffect(() => {
    onLoadingChange?.(
      Boolean(createUser.isPending || createSystemAdminUser.isPending),
    );
  }, [createUser.isPending, createSystemAdminUser.isPending, onLoadingChange]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: createUserDefaultValues,
  });

  const filteredRoles = (options?.roles ?? []).filter((r) =>
    tenantId ? r.tenantId === tenantId : true,
  );
  const filteredBranches = (options?.branches ?? []).filter((b) =>
    tenantId ? b.tenantId === tenantId : true,
  );

  useEffect(() => {
    const roleId = getValues("roleId");
    const branchId = getValues("branchId");
    if (roleId && !filteredRoles.some((r) => r.id === roleId)) {
      setValue("roleId", "");
    }
    if (branchId && !filteredBranches.some((b) => b.id === branchId)) {
      setValue("branchId", "");
    }
  }, [filteredRoles, filteredBranches, getValues, setValue]);

  const onSubmit = (data: CreateUserFormData) => {
    const onCreated = () => {
      toast.success("User created.");
      reset(createUserDefaultValues);
      onSuccess?.();
    };
    const onCreateError = () => toast.error("Failed to create user.");
    const selectedBranch = filteredBranches.find(
      (branch) => branch.id === data.branchId,
    );
    const payload = {
      email: data.email,
      password: data.password,
      username: data.username,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      avatarUrl: optionalUrl(data.avatarUrl),
      jobTitle: data.jobTitle,
      roleId: data.roleId,
      branchId: data.branchId,
      preferredLanguage: data.preferredLanguage,
    };

    if (isSystemAdmin && selectedBranch) {
      createSystemAdminUser.mutate(
        { ...payload, tenantId: selectedBranch.tenantId },
        { onSuccess: onCreated, onError: onCreateError },
      );
      return;
    }

    createUser.mutate(payload, {
      onSuccess: onCreated,
      onError: onCreateError,
    });
  };

  const isPending = createUser.isPending || createSystemAdminUser.isPending;

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full name *</Label>
          <Input id="fullName" {...register("fullName")} placeholder="John Doe" />
          {errors.fullName && (
            <p className="text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="username">Username *</Label>
          <Input id="username" {...register("username")} placeholder="john_doe" />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            placeholder="At least 8 characters"
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="phoneNumber">Phone *</Label>
          <Input
            id="phoneNumber"
            {...register("phoneNumber")}
            placeholder="+1234567890"
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="jobTitle">Job title *</Label>
          <Input id="jobTitle" {...register("jobTitle")} placeholder="Manager" />
          {errors.jobTitle && (
            <p className="text-sm text-red-600">{errors.jobTitle.message}</p>
          )}
        </div>
      </div>
      <Controller
        control={control}
        name="avatarUrl"
        render={({ field }) => (
          <ImageUploadField
            id="avatarUrl"
            label="Avatar"
            value={field.value}
            onChange={field.onChange}
            folder="users"
            error={errors.avatarUrl?.message}
          />
        )}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="roleId">Role *</Label>
          <Controller
            control={control}
            name="roleId"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={isOptionsLoading}
              >
                <SelectTrigger id="roleId">
                  <SelectValue
                    placeholder={
                      isOptionsLoading ? "Loading roles..." : "Select role"
                    }
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
          {errors.roleId && (
            <p className="text-sm text-red-600">{errors.roleId.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="branchId">Branch *</Label>
          <Controller
            control={control}
            name="branchId"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={isOptionsLoading}
              >
                <SelectTrigger id="branchId">
                  <SelectValue
                    placeholder={
                      isOptionsLoading ? "Loading branches..." : "Select branch"
                    }
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
          {errors.branchId && (
            <p className="text-sm text-red-600">{errors.branchId.message}</p>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="preferredLanguage">Preferred language *</Label>
        <Controller
          control={control}
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
        {errors.preferredLanguage && (
          <p className="text-sm text-red-600">
            {errors.preferredLanguage.message}
          </p>
        )}
      </div>
      {(createUser.isError || createSystemAdminUser.isError) && (
        <p className="text-sm text-red-600">
          Failed to create user. Please try again.
        </p>
      )}
      {!formId && (
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create User"}
        </Button>
      )}
    </form>
  );
}
