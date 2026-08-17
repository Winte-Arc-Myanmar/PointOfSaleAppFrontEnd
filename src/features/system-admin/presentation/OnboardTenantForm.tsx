"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardTenant } from "@/presentation/hooks/useSystemAdmin";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  onboardTenantDefaultValues,
  onboardTenantSchema,
  type OnboardTenantFormData,
} from "./system-admin-form-schema";

export function OnboardTenantForm() {
  const router = useRouter();
  const onboard = useOnboardTenant();
  const toast = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<OnboardTenantFormData>({
    resolver: zodResolver(onboardTenantSchema),
    defaultValues: onboardTenantDefaultValues,
  });
  const { register, formState: { errors } } = form;

  const onSubmit = (data: OnboardTenantFormData) => {
    setShowSuccess(false);
    onboard.mutate(
      {
        tenant: {
          name: data.tenant.name,
          legalName: data.tenant.legalName,
          domain: data.tenant.domain,
          website: data.tenant.website,
          address: data.tenant.address,
          city: data.tenant.city,
          state: data.tenant.state,
          country: data.tenant.country,
          zipCode: data.tenant.zipCode,
        },
        branch: {
          name: data.branch.name,
          branchCode: data.branch.branchCode,
          address: data.branch.address,
          city: data.branch.city,
          phone: data.branch.phone,
        },
        owner: {
          email: data.owner.email,
          password: data.owner.password,
          username: data.owner.username,
          fullName: data.owner.fullName,
          phoneNumber: data.owner.phoneNumber,
          jobTitle: data.owner.jobTitle,
        },
      },
      {
        onSuccess: () => {
          toast.success("Tenant onboarded.");
          setShowSuccess(true);
          form.reset(onboardTenantDefaultValues);
          setTimeout(() => router.push("/tenants"), 1500);
        },
        onError: () => toast.error("Failed to onboard tenant."),
      },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-foreground">Tenant details</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tenant-name">Name *</Label>
            <Input id="tenant-name" {...register("tenant.name")} />
            {errors.tenant?.name && (
              <p className="text-sm text-red-600">{errors.tenant.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenant-legalName">Legal name *</Label>
            <Input id="tenant-legalName" {...register("tenant.legalName")} />
            {errors.tenant?.legalName && (
              <p className="text-sm text-red-600">{errors.tenant.legalName.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tenant-domain">Domain *</Label>
            <Input id="tenant-domain" {...register("tenant.domain")} placeholder="acme.com" />
            {errors.tenant?.domain && (
              <p className="text-sm text-red-600">{errors.tenant.domain.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenant-website">Website *</Label>
            <Input
              id="tenant-website"
              type="url"
              {...register("tenant.website")}
              placeholder="https://acme.com"
            />
            {errors.tenant?.website && (
              <p className="text-sm text-red-600">{errors.tenant.website.message}</p>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tenant-address">Address *</Label>
          <Input id="tenant-address" {...register("tenant.address")} />
          {errors.tenant?.address && (
            <p className="text-sm text-red-600">{errors.tenant.address.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tenant-city">City *</Label>
            <Input id="tenant-city" {...register("tenant.city")} />
            {errors.tenant?.city && (
              <p className="text-sm text-red-600">{errors.tenant.city.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenant-state">State *</Label>
            <Input id="tenant-state" {...register("tenant.state")} />
            {errors.tenant?.state && (
              <p className="text-sm text-red-600">{errors.tenant.state.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenant-country">Country *</Label>
            <Input id="tenant-country" {...register("tenant.country")} />
            {errors.tenant?.country && (
              <p className="text-sm text-red-600">{errors.tenant.country.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenant-zipCode">Zip code *</Label>
            <Input id="tenant-zipCode" {...register("tenant.zipCode")} />
            {errors.tenant?.zipCode && (
              <p className="text-sm text-red-600">{errors.tenant.zipCode.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-foreground">Initial branch</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="branch-name">Branch name *</Label>
            <Input id="branch-name" {...register("branch.name")} />
            {errors.branch?.name && (
              <p className="text-sm text-red-600">{errors.branch.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="branch-branchCode">Branch code *</Label>
            <Input
              id="branch-branchCode"
              {...register("branch.branchCode")}
              placeholder="MB001"
            />
            {errors.branch?.branchCode && (
              <p className="text-sm text-red-600">{errors.branch.branchCode.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="branch-address">Address *</Label>
            <Input id="branch-address" {...register("branch.address")} />
            {errors.branch?.address && (
              <p className="text-sm text-red-600">{errors.branch.address.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="branch-city">City *</Label>
            <Input id="branch-city" {...register("branch.city")} />
            {errors.branch?.city && (
              <p className="text-sm text-red-600">{errors.branch.city.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="branch-phone">Phone *</Label>
            <Input
              id="branch-phone"
              {...register("branch.phone")}
              placeholder="+1234567890"
            />
            {errors.branch?.phone && (
              <p className="text-sm text-red-600">{errors.branch.phone.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-foreground">Owner account</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="owner-fullName">Full name *</Label>
            <Input id="owner-fullName" {...register("owner.fullName")} />
            {errors.owner?.fullName && (
              <p className="text-sm text-red-600">{errors.owner.fullName.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="owner-username">Username *</Label>
            <Input id="owner-username" {...register("owner.username")} />
            {errors.owner?.username && (
              <p className="text-sm text-red-600">{errors.owner.username.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="owner-email">Email *</Label>
            <Input id="owner-email" type="email" {...register("owner.email")} />
            {errors.owner?.email && (
              <p className="text-sm text-red-600">{errors.owner.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="owner-password">Password *</Label>
            <Input
              id="owner-password"
              type="password"
              {...register("owner.password")}
              placeholder="At least 8 characters"
            />
            {errors.owner?.password && (
              <p className="text-sm text-red-600">{errors.owner.password.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="owner-phoneNumber">Phone *</Label>
            <Input
              id="owner-phoneNumber"
              {...register("owner.phoneNumber")}
              placeholder="+1234567890"
            />
            {errors.owner?.phoneNumber && (
              <p className="text-sm text-red-600">{errors.owner.phoneNumber.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="owner-jobTitle">Job title *</Label>
            <Input id="owner-jobTitle" {...register("owner.jobTitle")} />
            {errors.owner?.jobTitle && (
              <p className="text-sm text-red-600">{errors.owner.jobTitle.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      {showSuccess && (
        <p className="text-sm text-green-600 font-medium">
          Tenant onboarded successfully. Redirecting...
        </p>
      )}
      {onboard.isError && (
        <p className="text-sm text-red-600">Failed to onboard tenant. Please try again.</p>
      )}

      <Button type="submit" disabled={onboard.isPending}>
        {onboard.isPending ? "Onboarding..." : "Onboard tenant"}
      </Button>
    </form>
  );
}
