"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUomClass, useUpdateUomClass } from "@/presentation/hooks/useUomClasses";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
});

type UomClassFormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

export function EditUomClassForm({ uomClassId }: { uomClassId: string }) {
  const router = useRouter();
  const { data: uomClass, isLoading, error } = useUomClass(uomClassId);
  const updateUomClass = useUpdateUomClass();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<UomClassFormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", tenantId: "" },
  });

  useEffect(() => {
    if (uomClass) {
      form.reset({
        name: uomClass.name,
        tenantId: uomClass.tenantId,
      });
    }
  }, [uomClass, form]);

  const onSubmit = (data: UomClassFormData) => {
    setShowSuccess(false);
    updateUomClass.mutate(
      {
        id: uomClassId,
        data: { name: data.name, tenantId: data.tenantId },
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

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !uomClass)
    return (
      <div className="space-y-4">
        <p className="text-red-500">UOM class not found.</p>
        <Link href="/admin/uom-classes">
          <Button variant="outline">Back to UOM Classes</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/uom">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit UOM class</h1>
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
          <Label htmlFor="tenantId">Tenant ID</Label>
          <Input id="tenantId" {...form.register("tenantId")} />
          {form.formState.errors.tenantId && (
            <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>
          )}
        </div>
        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            UOM class updated. Redirecting...
          </p>
        )}
        {updateUomClass.isError && (
          <p className="text-sm text-red-600">Failed to update UOM class.</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={updateUomClass.isPending}>
            {updateUomClass.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href="/admin/uom">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
