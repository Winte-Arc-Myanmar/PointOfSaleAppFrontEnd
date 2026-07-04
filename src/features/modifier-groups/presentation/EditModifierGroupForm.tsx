"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useModifierGroup,
  useUpdateModifierGroup,
} from "@/presentation/hooks/useModifierGroups";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";

const REDIRECT_DELAY_MS = 1500;

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    minSelection: z.number().int().min(0, "Min must be >= 0"),
    maxSelection: z.number().int().min(0, "Max must be >= 0"),
    isRequired: z.boolean(),
  })
  .refine((data) => data.maxSelection >= data.minSelection, {
    message: "Max must be greater than or equal to min",
    path: ["maxSelection"],
  });

type FormData = z.infer<typeof schema>;

export function EditModifierGroupForm({ modifierGroupId }: { modifierGroupId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateModifierGroup();
  const { data: group, isLoading, error } = useModifierGroup(modifierGroupId);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      minSelection: 0,
      maxSelection: 1,
      isRequired: false,
    },
  });

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        minSelection: group.minSelection,
        maxSelection: group.maxSelection,
        isRequired: group.isRequired,
      });
    }
  }, [group, form]);

  const onSubmit = (data: FormData) => {
    if (!group) return;
    setShowSuccess(false);
    update.mutate(
      {
        id: modifierGroupId,
        data: {
          tenantId: group.tenantId,
          name: data.name.trim(),
          minSelection: data.minSelection,
          maxSelection: data.maxSelection,
          isRequired: data.isRequired,
        },
      },
      {
        onSuccess: () => {
          toast.success("Modifier group updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/modifier-groups/${modifierGroupId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update modifier group."),
      },
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !group) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Modifier group not found.</p>
        <Link href="/modifier-groups">
          <Button variant="outline">Back to Modifier Groups</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/modifier-groups/${modifierGroupId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit modifier group</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid gap-2">
          <Label>Tenant ID</Label>
          <Input value={group.tenantId} disabled className="font-mono" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="minSelection">Min selection</Label>
            <Input
              id="minSelection"
              type="number"
              {...form.register("minSelection", { valueAsNumber: true })}
            />
            {form.formState.errors.minSelection && (
              <p className="text-sm text-red-600">{form.formState.errors.minSelection.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxSelection">Max selection</Label>
            <Input
              id="maxSelection"
              type="number"
              {...form.register("maxSelection", { valueAsNumber: true })}
            />
            {form.formState.errors.maxSelection && (
              <p className="text-sm text-red-600">{form.formState.errors.maxSelection.message}</p>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-emerald-500"
            {...form.register("isRequired")}
          />
          <span className="text-sm text-foreground">Required selection</span>
        </label>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Modifier group updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/modifier-groups/${modifierGroupId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
