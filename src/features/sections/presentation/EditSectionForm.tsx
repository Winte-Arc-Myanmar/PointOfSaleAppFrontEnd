"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useSection, useUpdateSection } from "@/presentation/hooks/useSections";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const REDIRECT_DELAY_MS = 1500;
const LIST_LIMIT = 200;

const schema = z.object({
  locationId: z.string().min(1, "Location is required"),
  name: z.string().min(1, "Name is required"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Use a valid hex color like #FF5733"),
});

type FormData = z.infer<typeof schema>;

export function EditSectionForm({ sectionId }: { sectionId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateSection();
  const { data: section, isLoading, error } = useSection(sectionId);
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const locations = getPaginatedItems(locationsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      locationId: "",
      name: "",
      color: "#22C55E",
    },
  });
  const colorValue = useWatch({ control: form.control, name: "color" });

  const filteredLocations = useMemo(
    () => locations.filter((location) => (section ? location.tenantId === section.tenantId : true)),
    [locations, section]
  );

  useEffect(() => {
    if (section) {
      form.reset({
        locationId: section.locationId,
        name: section.name,
        color: section.color || "#22C55E",
      });
    }
  }, [section, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: sectionId,
        data: {
          locationId: data.locationId,
          name: data.name.trim(),
          color: data.color.toUpperCase(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Section updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/sections/${sectionId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update section."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !section) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Section not found.</p>
        <Link href="/sections">
          <Button variant="outline">Back to Sections</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/sections/${sectionId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit section</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid gap-2">
          <Label htmlFor="locationId">Location</Label>
          <Controller
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="locationId">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {filteredLocations.map((location) => (
                    <SelectItem key={location.id} value={String(location.id)}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.locationId && (
            <p className="text-sm text-red-600">{form.formState.errors.locationId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Section name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                className="h-10 w-14 p-1"
                value={colorValue}
                onChange={(e) => form.setValue("color", e.target.value, { shouldDirty: true })}
              />
              <Input
                className="font-mono"
                maxLength={7}
                value={colorValue}
                onChange={(e) => form.setValue("color", e.target.value, { shouldDirty: true })}
              />
              <input type="hidden" {...form.register("color")} />
            </div>
            {form.formState.errors.color && (
              <p className="text-sm text-red-600">{form.formState.errors.color.message}</p>
            )}
          </div>
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Section updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/sections/${sectionId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
