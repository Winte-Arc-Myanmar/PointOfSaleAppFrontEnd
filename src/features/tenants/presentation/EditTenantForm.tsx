"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTenant, useUpdateTenant } from "@/presentation/hooks/useTenants";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  legalName: z.string().min(1, "Legal name is required"),
  domain: z.string().min(1, "Domain is required"),
  website: z.string().url("Invalid URL").or(z.literal("")),
  logoUrl: z.string().url("Invalid URL").or(z.literal("")),
  primaryContactName: z.string(),
  primaryContactEmail: z.string().email("Invalid email").or(z.literal("")),
  primaryContactPhone: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string(),
});

type TenantFormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

export function EditTenantForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const { data: tenant, isLoading, error } = useTenant(tenantId);
  const updateTenant = useUpdateTenant();
  const toast = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<TenantFormData>({
    resolver: zodResolver(schema),
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

  const onSubmit = (data: TenantFormData) => {
    setShowSuccess(false);
    updateTenant.mutate(
      {
        id: tenantId,
        data: {
          name: data.name,
          legalName: data.legalName,
          domain: data.domain,
          website: data.website || "",
          logoUrl: data.logoUrl || "",
          primaryContactName: data.primaryContactName || "",
          primaryContactEmail: data.primaryContactEmail || "",
          primaryContactPhone: data.primaryContactPhone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country,
          zipCode: data.zipCode || "",
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="legalName">Legal name</Label>
            <Input id="legalName" {...form.register("legalName")} />
            {form.formState.errors.legalName && (
              <p className="text-sm text-red-600">{form.formState.errors.legalName.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="domain">Domain</Label>
            <Input id="domain" {...form.register("domain")} />
            {form.formState.errors.domain && (
              <p className="text-sm text-red-600">{form.formState.errors.domain.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" {...form.register("website")} />
            {form.formState.errors.website && (
              <p className="text-sm text-red-600">{form.formState.errors.website.message}</p>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input id="logoUrl" type="url" {...form.register("logoUrl")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="primaryContactName">Primary contact name</Label>
            <Input id="primaryContactName" {...form.register("primaryContactName")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="primaryContactEmail">Primary contact email</Label>
            <Input id="primaryContactEmail" type="email" {...form.register("primaryContactEmail")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="primaryContactPhone">Primary contact phone</Label>
            <Input id="primaryContactPhone" {...form.register("primaryContactPhone")} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...form.register("address")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register("city")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...form.register("state")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zipCode">Zip code</Label>
            <Input id="zipCode" {...form.register("zipCode")} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...form.register("country")} />
          {form.formState.errors.country && (
            <p className="text-sm text-red-600">{form.formState.errors.country.message}</p>
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
      </form>
    </div>
  );
}
