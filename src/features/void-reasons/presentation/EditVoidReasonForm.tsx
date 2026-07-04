"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVoidReason, useUpdateVoidReason } from "@/presentation/hooks/useVoidReasons";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";

const REDIRECT_DELAY_MS = 1500;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  isActive: z.boolean(),
  requiresManagerOverride: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function EditVoidReasonForm({ voidReasonId }: { voidReasonId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateVoidReason();
  const { data: reason, isLoading, error } = useVoidReason(voidReasonId);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      requiresManagerOverride: false,
    },
  });

  useEffect(() => {
    if (reason) {
      form.reset({
        name: reason.name,
        description: reason.description,
        isActive: reason.isActive,
        requiresManagerOverride: reason.requiresManagerOverride,
      });
    }
  }, [reason, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: voidReasonId,
        data: {
          name: data.name.trim(),
          description: data.description.trim(),
          isActive: data.isActive,
          requiresManagerOverride: data.requiresManagerOverride,
        },
      },
      {
        onSuccess: () => {
          toast.success("Void reason updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/void-reasons/${voidReasonId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update void reason."),
      },
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !reason) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Void reason not found.</p>
        <Link href="/void-reasons">
          <Button variant="outline">Back to Void Reasons</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/void-reasons/${voidReasonId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit void reason</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid gap-2">
          <Label>Code</Label>
          <Input value={reason.code} disabled className="font-mono" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...form.register("description")} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-emerald-500"
              {...form.register("isActive")}
            />
            <span className="text-sm text-foreground">Active</span>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-emerald-500"
              {...form.register("requiresManagerOverride")}
            />
            <span className="text-sm text-foreground">Requires manager override</span>
          </label>
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Void reason updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/void-reasons/${voidReasonId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
