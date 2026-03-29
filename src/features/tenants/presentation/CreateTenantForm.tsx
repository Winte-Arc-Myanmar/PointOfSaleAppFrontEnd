"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTenant } from "@/presentation/hooks/useTenants";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

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

export type TenantFormData = z.infer<typeof schema>;

const defaultValues: TenantFormData = {
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
};

export interface CreateTenantFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateTenantForm({ onSuccess, formId, onLoadingChange }: CreateTenantFormProps) {
  const createTenant = useCreateTenant();
  const toast = useToast();
  useEffect(() => {
    onLoadingChange?.(createTenant.isPending ?? false);
  }, [createTenant.isPending, onLoadingChange]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TenantFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (data: TenantFormData) => {
    createTenant.mutate(
      {
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
      {
        onSuccess: () => {
          toast.success("Tenant created.");
          reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create tenant."),
      }
    );
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="e.g. KFC" />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="legalName">Legal name</Label>
          <Input
            id="legalName"
            {...register("legalName")}
            placeholder="e.g. KFC Corporation"
          />
          {errors.legalName && (
            <p className="text-sm text-red-600">{errors.legalName.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="domain">Domain</Label>
          <Input id="domain" {...register("domain")} placeholder="kfc.com" />
          {errors.domain && (
            <p className="text-sm text-red-600">{errors.domain.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            {...register("website")}
            placeholder="https://kfc.com"
          />
          {errors.website && (
            <p className="text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input
          id="logoUrl"
          type="url"
          {...register("logoUrl")}
          placeholder="https://logo.url"
        />
        {errors.logoUrl && (
          <p className="text-sm text-red-600">{errors.logoUrl.message}</p>
        )}
      </div>
      <p className="text-sm font-medium text-foreground/80">Primary contact</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="primaryContactName">Name</Label>
          <Input id="primaryContactName" {...register("primaryContactName")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="primaryContactEmail">Email</Label>
          <Input
            id="primaryContactEmail"
            type="email"
            {...register("primaryContactEmail")}
          />
          {errors.primaryContactEmail && (
            <p className="text-sm text-red-600">
              {errors.primaryContactEmail.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="primaryContactPhone">Phone</Label>
          <Input id="primaryContactPhone" {...register("primaryContactPhone")} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} placeholder="Street address" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="zipCode">Zip code</Label>
          <Input id="zipCode" {...register("zipCode")} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="country">Country</Label>
        <Input id="country" {...register("country")} placeholder="e.g. USA" />
        {errors.country && (
          <p className="text-sm text-red-600">{errors.country.message}</p>
        )}
      </div>
      {createTenant.isError && (
        <p className="text-sm text-red-600">Failed to create tenant. Please try again.</p>
      )}
      {!formId && (
        <Button type="submit" disabled={createTenant.isPending}>
          {createTenant.isPending ? "Creating..." : "Create Tenant"}
        </Button>
      )}
    </form>
  );
}
