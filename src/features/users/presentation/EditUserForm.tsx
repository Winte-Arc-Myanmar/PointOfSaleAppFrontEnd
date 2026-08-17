"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser, useUpdateUser } from "@/presentation/hooks/useUsers";
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
import { ArrowLeft } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";
import {
  optionalUrl,
  updateUserSchema,
  USER_PREFERRED_LANGUAGES,
  type UpdateUserFormData,
} from "./user-form-schema";

const REDIRECT_DELAY_MS = 1500;

function toPreferredLanguage(
  value?: string | null,
): UpdateUserFormData["preferredLanguage"] {
  const normalized = value?.trim().toUpperCase();
  return normalized === "MY" ? "MY" : "EN";
}

export function EditUserForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();
  const toast = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      fullName: "",
      phoneNumber: "",
      avatarUrl: "",
      jobTitle: "",
      preferredLanguage: "EN",
    },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      email: user.email,
      password: "",
      username: user.username,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber ?? "",
      avatarUrl: user.avatarUrl ?? "",
      jobTitle: user.jobTitle ?? "",
      preferredLanguage: toPreferredLanguage(user.preferredLanguage),
    });
  }, [user, form]);

  const onSubmit = (data: UpdateUserFormData) => {
    setShowSuccess(false);
    const payload = {
      email: data.email,
      username: data.username,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      avatarUrl: optionalUrl(data.avatarUrl),
      jobTitle: data.jobTitle,
      preferredLanguage: data.preferredLanguage,
      ...(data.password ? { password: data.password } : {}),
    };
    updateUser.mutate(
      { id: userId, data: payload },
      {
        onSuccess: () => {
          toast.success("User updated.");
          form.reset(form.getValues());
          setShowSuccess(true);
          setTimeout(() => router.push(`/users/${userId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update user."),
      },
    );
  };

  if (isLoading)
    return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !user)
    return (
      <div className="space-y-4">
        <p className="text-red-500">User not found.</p>
        <Link href="/users">
          <Button variant="outline">Back to Users</Button>
        </Link>
      </div>
    );

  const errors = form.formState.errors;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/users/${userId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit user</h1>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-2xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name *</Label>
            <Input id="fullName" {...form.register("fullName")} />
            {errors.fullName && (
              <p className="text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username *</Label>
            <Input id="username" {...form.register("username")} />
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...form.register("email")} />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password (leave blank to keep)</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
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
            <Input id="phoneNumber" {...form.register("phoneNumber")} />
            {errors.phoneNumber && (
              <p className="text-sm text-red-600">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="jobTitle">Job title *</Label>
            <Input id="jobTitle" {...form.register("jobTitle")} />
            {errors.jobTitle && (
              <p className="text-sm text-red-600">{errors.jobTitle.message}</p>
            )}
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
              error={errors.avatarUrl?.message}
            />
          )}
        />
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
          {errors.preferredLanguage && (
            <p className="text-sm text-red-600">
              {errors.preferredLanguage.message}
            </p>
          )}
        </div>
        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            User updated successfully. Redirecting...
          </p>
        )}
        {updateUser.isError && (
          <p className="text-sm text-red-600">Failed to update user.</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={updateUser.isPending}>
            {updateUser.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/users/${userId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
