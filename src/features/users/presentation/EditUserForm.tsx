"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser, useUpdateUser } from "@/presentation/hooks/useUsers";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string(),
  username: z.string().min(1, "Username is required"),
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string(),
  avatarUrl: z.string().url("Invalid URL").or(z.literal("")),
  jobTitle: z.string(),
  preferredLanguage: z.string(),
});

type UserFormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

export function EditUserForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<UserFormData>({
    resolver: zodResolver(schema),
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
    if (user) {
      form.reset({
        email: user.email,
        password: "",
        username: user.username,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber ?? "",
        avatarUrl: user.avatarUrl ?? "",
        jobTitle: user.jobTitle ?? "",
        preferredLanguage: user.preferredLanguage ?? "EN",
      });
    }
  }, [user, form]);

  const onSubmit = (data: UserFormData) => {
    setShowSuccess(false);
    const payload = {
      email: data.email,
      username: data.username,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber || undefined,
      avatarUrl: data.avatarUrl || undefined,
      jobTitle: data.jobTitle || undefined,
      preferredLanguage: data.preferredLanguage || undefined,
    };
    if (data.password) Object.assign(payload, { password: data.password });
    updateUser.mutate(
      { id: userId, data: payload },
      {
        onSuccess: () => {
          form.reset(form.getValues());
          setShowSuccess(true);
          setTimeout(() => router.push(`/admin/users/${userId}`), REDIRECT_DELAY_MS);
        },
      }
    );
  };

  if (isLoading) return <p className="text-muted">Loading...</p>;
  if (error || !user)
    return (
      <div className="space-y-4">
        <p className="text-red-500">User not found.</p>
        <Link href="/admin/users">
          <Button variant="outline">Back to Users</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/users/${userId}`}>
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
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" {...form.register("fullName")} />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-600">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...form.register("username")} />
            {form.formState.errors.username && (
              <p className="text-sm text-red-600">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password (leave blank to keep)</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              placeholder="••••••••"
            />
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
        <div className="grid gap-2">
          <Label htmlFor="avatarUrl">Avatar URL</Label>
          <Input id="avatarUrl" type="url" {...form.register("avatarUrl")} />
          {form.formState.errors.avatarUrl && (
            <p className="text-sm text-red-600">
              {form.formState.errors.avatarUrl.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="preferredLanguage">Preferred language</Label>
          <Input id="preferredLanguage" {...form.register("preferredLanguage")} />
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
          <Link href={`/admin/users/${userId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
