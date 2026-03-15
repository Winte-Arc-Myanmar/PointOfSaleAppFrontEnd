"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUom, useUpdateUom } from "@/presentation/hooks/useUoms";
import { useUomClasses } from "@/presentation/hooks/useUomClasses";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  classId: z.string().min(1, "Class is required"),
  abbreviation: z.string().min(1, "Abbreviation is required"),
  conversionRateToBase: z.coerce.number().min(0, "Must be >= 0"),
});

type UomFormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

export function EditUomForm({ uomId }: { uomId: string }) {
  const router = useRouter();
  const { data: uom, isLoading, error } = useUom(uomId);
  const { data: uomClasses = [] } = useUomClasses();
  const updateUom = useUpdateUom();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<UomFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      classId: "",
      abbreviation: "",
      conversionRateToBase: 1,
    },
  });

  useEffect(() => {
    if (uom) {
      form.reset({
        name: uom.name,
        classId: uom.classId,
        abbreviation: uom.abbreviation,
        conversionRateToBase: uom.conversionRateToBase,
      });
    }
  }, [uom, form]);

  const onSubmit = (data: UomFormData) => {
    setShowSuccess(false);
    updateUom.mutate(
      {
        id: uomId,
        data: {
          name: data.name,
          classId: data.classId,
          abbreviation: data.abbreviation,
          conversionRateToBase: data.conversionRateToBase,
        },
      },
      {
        onSuccess: () => {
          form.reset(form.getValues());
          setShowSuccess(true);
          setTimeout(() => {
            router.push("/admin/uom");
          }, REDIRECT_DELAY_MS);
        },
      }
    );
  };

  if (isLoading) return <p className="text-muted">Loading...</p>;
  if (error || !uom)
    return (
      <div className="space-y-4">
        <p className="text-red-500">UOM not found.</p>
        <Link href="/admin/uom">
          <Button variant="outline">Back to UOM</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/uoms/${uomId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit UOM</h1>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="classId">UOM Class</Label>
          <select
            id="classId"
            {...form.register("classId")}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2"
          >
            <option value="">Select class</option>
            {uomClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {form.formState.errors.classId && (
            <p className="text-sm text-red-600">{form.formState.errors.classId.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="abbreviation">Abbreviation</Label>
          <Input id="abbreviation" {...form.register("abbreviation")} />
          {form.formState.errors.abbreviation && (
            <p className="text-sm text-red-600">{form.formState.errors.abbreviation.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="conversionRateToBase">Conversion rate to base</Label>
          <Input
            id="conversionRateToBase"
            type="number"
            step="any"
            {...form.register("conversionRateToBase")}
          />
          {form.formState.errors.conversionRateToBase && (
            <p className="text-sm text-red-600">
              {form.formState.errors.conversionRateToBase.message}
            </p>
          )}
        </div>
        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            UOM updated. Redirecting...
          </p>
        )}
        {updateUom.isError && (
          <p className="text-sm text-red-600">Failed to update UOM.</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={updateUom.isPending}>
            {updateUom.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href="/admin/uom">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
