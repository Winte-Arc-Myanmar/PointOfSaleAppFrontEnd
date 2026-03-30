"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateUser } from "@/presentation/hooks/useUsers";
import { useCreateUserFormOptions } from "@/presentation/hooks/useCreateUserFormOptions";
import { useToast } from "@/presentation/providers/ToastProvider";
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

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  username: z.string().min(1, "Username is required"),
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string(),
  avatarUrl: z.string().url("Invalid URL").or(z.literal("")),
  jobTitle: z.string(),
  roleId: z.string(),
  branchId: z.string(),
  preferredLanguage: z.string(),
});

export type UserFormData = z.infer<typeof schema>;

const defaultValues: UserFormData = {
  email: "",
  password: "",
  username: "",
  fullName: "",
  phoneNumber: "",
  avatarUrl: "",
  jobTitle: "",
  roleId: "",
  branchId: "",
  preferredLanguage: "EN",
};

export interface CreateUserFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

const OPTIONAL_SELECT = "__none__";

export function CreateUserForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateUserFormProps) {
  const { data: session } = useSession();
  const tenantId = session?.user?.tenantId;
  const createUser = useCreateUser();
  const toast = useToast();
  const { data: options, isLoading: isOptionsLoading } =
    useCreateUserFormOptions();

  useEffect(() => {
    onLoadingChange?.(createUser.isPending ?? false);
  }, [createUser.isPending, onLoadingChange]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const filteredRoles = (options?.roles ?? []).filter((r) =>
    tenantId ? r.tenantId === tenantId : true
  );
  const filteredBranches = (options?.branches ?? []).filter((b) =>
    tenantId ? b.tenantId === tenantId : true
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

  const onSubmit = (data: UserFormData) => {
    createUser.mutate(
      {
        email: data.email,
        password: data.password,
        username: data.username,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || undefined,
        avatarUrl: data.avatarUrl || undefined,
        jobTitle: data.jobTitle || undefined,
        roleId: data.roleId || undefined,
        branchId: data.branchId || undefined,
        preferredLanguage: data.preferredLanguage || undefined,
      },
      {
        onSuccess: () => {
          toast.success("User created.");
          reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create user."),
      }
    );
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} placeholder="John Doe" />
          {errors.fullName && (
            <p className="text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" {...register("username")} placeholder="john_doe" />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="phoneNumber">Phone</Label>
          <Input
            id="phoneNumber"
            {...register("phoneNumber")}
            placeholder="+1234567890"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="jobTitle">Job title</Label>
          <Input id="jobTitle" {...register("jobTitle")} placeholder="Manager" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          id="avatarUrl"
          type="url"
          {...register("avatarUrl")}
          placeholder="https://avatar.url"
        />
        {errors.avatarUrl && (
          <p className="text-sm text-red-600">{errors.avatarUrl.message}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="roleId">Role</Label>
          <Controller
            control={control}
            name="roleId"
            render={({ field }) => (
              <Select
                value={field.value ? field.value : OPTIONAL_SELECT}
                onValueChange={(value) =>
                  field.onChange(value === OPTIONAL_SELECT ? "" : value)
                }
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
                  <SelectItem value={OPTIONAL_SELECT}>None</SelectItem>
                  {filteredRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="branchId">Branch</Label>
          <Controller
            control={control}
            name="branchId"
            render={({ field }) => (
              <Select
                value={field.value ? field.value : OPTIONAL_SELECT}
                onValueChange={(value) =>
                  field.onChange(value === OPTIONAL_SELECT ? "" : value)
                }
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
                  <SelectItem value={OPTIONAL_SELECT}>None</SelectItem>
                  {filteredBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.branchCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="preferredLanguage">Preferred language</Label>
        <Input
          id="preferredLanguage"
          {...register("preferredLanguage")}
          placeholder="EN"
        />
      </div>
      {createUser.isError && (
        <p className="text-sm text-red-600">
          Failed to create user. Please try again.
        </p>
      )}
      {!formId && (
        <Button type="submit" disabled={createUser.isPending}>
          {createUser.isPending ? "Creating..." : "Create User"}
        </Button>
      )}
    </form>
  );
}
