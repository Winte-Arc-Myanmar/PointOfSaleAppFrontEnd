"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTenant, useUpdateTenant } from "@/presentation/hooks/useTenants";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";
import {
  emptyToBlank,
  updateTenantSchema,
  type UpdateTenantFormData,
} from "./tenant-form-schema";

const REDIRECT_DELAY_MS = 1500;

export function EditTenantForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const { data: tenant, isLoading, error } = useTenant(tenantId);
  const updateTenant = useUpdateTenant();
  const toast = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<UpdateTenantFormData>({
    resolver: zodResolver(updateTenantSchema),
    defaultValues: {
      name: "",
      legalName: "",
      domain: "",
      website: "",
      logoUrl: "",
      primaryContactName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
  });

  const logoUrl = useWatch({ control: form.control, name: "logoUrl" });

  useEffect(() => {
    if (tenant) {
      form.reset({
        name: tenant.name,
        legalName: tenant.legalName,
        domain: tenant.domain,
        website: tenant.website ?? "",
        logoUrl: tenant.logoUrl ?? "",
        primaryContactName: tenant.primaryContactName ?? "",
        primaryContactEmail: tenant.primaryContactEmail ?? "",
        primaryContactPhone: tenant.primaryContactPhone ?? "",
        address: tenant.address ?? "",
        city: tenant.city ?? "",
        state: tenant.state ?? "",
        country: tenant.country,
        zipCode: tenant.zipCode ?? "",
      });
    }
  }, [tenant, form]);

  const onSubmit = (data: UpdateTenantFormData) => {
    setShowSuccess(false);
    updateTenant.mutate(
      {
        id: tenantId,
        data: {
          name: data.name,
          legalName: data.legalName,
          domain: data.domain,
          website: emptyToBlank(data.website),
          logoUrl: emptyToBlank(data.logoUrl),
          primaryContactName: data.primaryContactName,
          primaryContactEmail: data.primaryContactEmail,
          primaryContactPhone: data.primaryContactPhone,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          zipCode: data.zipCode,
        },
      },
      {
        onSuccess: () => {
          toast.success("Tenant updated.");
          form.reset(form.getValues());
          setShowSuccess(true);
          setTimeout(() => {
            router.push(`/tenants/${tenantId}`);
          }, REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update tenant."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !tenant)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Tenant not found.</p>
        <Link href="/tenants">
          <Button variant="outline">Back to Tenants</Button>
        </Link>
      </div>
    );

  const errors = form.formState.errors;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/tenants/${tenantId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit tenant</h1>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid w-full max-w-[1060px] items-start gap-6 lg:grid-cols-[minmax(0,672px)_minmax(300px,360px)]"
      >
        <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...form.register("name")} />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="legalName">Legal name *</Label>
            <Input id="legalName" {...form.register("legalName")} />
            {errors.legalName && (
              <p className="text-sm text-red-600">{errors.legalName.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="domain">Domain *</Label>
            <Input id="domain" {...form.register("domain")} />
            {errors.domain && (
              <p className="text-sm text-red-600">{errors.domain.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Website *</Label>
            <Input id="website" type="url" {...form.register("website")} />
            {errors.website && (
              <p className="text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input id="logoUrl" type="url" {...form.register("logoUrl")} />
          {errors.logoUrl && (
            <p className="text-sm text-red-600">{errors.logoUrl.message}</p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="primaryContactName">Primary contact name *</Label>
            <Input id="primaryContactName" {...form.register("primaryContactName")} />
            {errors.primaryContactName && (
              <p className="text-sm text-red-600">
                {errors.primaryContactName.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="primaryContactEmail">Primary contact email *</Label>
            <Input id="primaryContactEmail" type="email" {...form.register("primaryContactEmail")} />
            {errors.primaryContactEmail && (
              <p className="text-sm text-red-600">
                {errors.primaryContactEmail.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="primaryContactPhone">Primary contact phone *</Label>
            <Input id="primaryContactPhone" {...form.register("primaryContactPhone")} />
            {errors.primaryContactPhone && (
              <p className="text-sm text-red-600">
                {errors.primaryContactPhone.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Address *</Label>
          <Input id="address" {...form.register("address")} />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="city">City *</Label>
            <Input id="city" {...form.register("city")} />
            {errors.city && (
              <p className="text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State *</Label>
            <Input id="state" {...form.register("state")} />
            {errors.state && (
              <p className="text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zipCode">Zip code *</Label>
            <Input id="zipCode" {...form.register("zipCode")} />
            {errors.zipCode && (
              <p className="text-sm text-red-600">{errors.zipCode.message}</p>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="country">Country *</Label>
          <Input id="country" {...form.register("country")} />
          {errors.country && (
            <p className="text-sm text-red-600">{errors.country.message}</p>
          )}
        </div>
        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Tenant updated successfully. Redirecting...
          </p>
        )}
        {updateTenant.isError && (
          <p className="text-sm text-red-600">Failed to update tenant.</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={updateTenant.isPending}>
            {updateTenant.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/tenants/${tenantId}`}>
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
        </div>

        <aside className="w-full space-y-3 rounded-xl border border-border bg-background p-4 shadow-sm lg:sticky lg:top-4">
          <p className="section-label">On receipts</p>
          <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border bg-white p-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain grayscale" />
            ) : (
              <span className="text-xs text-muted">No logo</span>
            )}
          </div>
          <p className="text-xs leading-5 text-muted">
            The logo, name, address, phone and email print at the top of receipts. Choose which
            ones in the POS under Settings, Print Template.
          </p>
          <p className="text-xs leading-5 text-muted">
            The currency receipts use is set in{" "}
            <Link href="/venue-setup" className="text-mint underline">
              Shop settings
            </Link>
            .
          </p>
        </aside>
      </form>
    </div>
  );
}
