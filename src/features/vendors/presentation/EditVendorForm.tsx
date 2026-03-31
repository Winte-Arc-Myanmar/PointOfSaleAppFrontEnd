"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/presentation/providers/ToastProvider";
import { AppLoader } from "@/presentation/components/loader";
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
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useUpdateVendor, useVendor } from "@/presentation/hooks/useVendors";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant is required"),
});

type VendorFormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

export function EditVendorForm({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const { tenantId: lockedTenantId } = usePermissions();
  const { data: vendor, isLoading, error } = useVendor(vendorId);
  const { data: tenants = [], isLoading: isTenantsLoading } = useTenants();
  const updateVendor = useUpdateVendor();
  const toast = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<VendorFormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", tenantId: "" },
  });

  useEffect(() => {
    if (vendor) {
      form.reset({
        name: vendor.name,
        tenantId: vendor.tenantId,
      });
    }
  }, [vendor, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: VendorFormData) => {
    setShowSuccess(false);
    updateVendor.mutate(
      { id: vendorId, data: { name: data.name, tenantId: data.tenantId } },
      {
        onSuccess: () => {
          toast.success("Vendor updated.");
          form.reset(form.getValues());
          setShowSuccess(true);
          setTimeout(() => router.push("/vendors"), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update vendor."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;

  if (error || !vendor)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Vendor not found.</p>
        <Link href="/vendors">
          <Button variant="outline">Back to Vendors</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vendors">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit vendor</h1>
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
          <Label htmlFor="tenantId">Tenant</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isTenantsLoading || Boolean(lockedTenantId)}
              >
                <SelectTrigger id="tenantId">
                  <SelectValue
                    placeholder={isTenantsLoading ? "Loading tenants..." : "Select tenant"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.tenantId && (
            <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>
          )}
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">Vendor updated. Redirecting...</p>
        )}
        {updateVendor.isError && (
          <p className="text-sm text-red-600">Failed to update vendor.</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={updateVendor.isPending}>
            {updateVendor.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href="/vendors">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

