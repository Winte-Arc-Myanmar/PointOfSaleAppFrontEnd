"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOnboardTenant } from "@/presentation/hooks/useSystemAdmin";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

const schema = z.object({
  tenantName: z.string().min(1, "Tenant name is required"),
  legalName: z.string(),
  domain: z.string(),
  website: z.string().url("Invalid URL").or(z.literal("")),
  tenantAddress: z.string(),
  tenantCity: z.string(),
  tenantState: z.string(),
  tenantCountry: z.string(),
  tenantZipCode: z.string(),
  branchName: z.string().min(1, "Branch name is required"),
  branchCode: z.string().min(1, "Branch code is required"),
  branchAddress: z.string(),
  branchCity: z.string(),
  branchPhone: z.string(),
  ownerEmail: z.string().min(1, "Owner email is required").email("Invalid email"),
  ownerPassword: z.string().min(6, "Password must be at least 6 characters"),
  ownerUsername: z.string().min(1, "Owner username is required"),
  ownerFullName: z.string().min(1, "Owner full name is required"),
  ownerPhone: z.string(),
  ownerJobTitle: z.string(),
});

type FormData = z.infer<typeof schema>;

export function OnboardTenantForm() {
  const router = useRouter();
  const onboard = useOnboardTenant();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantName: "", legalName: "", domain: "", website: "",
      tenantAddress: "", tenantCity: "", tenantState: "", tenantCountry: "", tenantZipCode: "",
      branchName: "", branchCode: "", branchAddress: "", branchCity: "", branchPhone: "",
      ownerEmail: "", ownerPassword: "", ownerUsername: "", ownerFullName: "", ownerPhone: "", ownerJobTitle: "",
    },
  });

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    onboard.mutate(
      {
        tenant: {
          name: data.tenantName,
          legalName: data.legalName || undefined,
          domain: data.domain || undefined,
          website: data.website || undefined,
          address: data.tenantAddress || undefined,
          city: data.tenantCity || undefined,
          state: data.tenantState || undefined,
          country: data.tenantCountry || undefined,
          zipCode: data.tenantZipCode || undefined,
        },
        branch: {
          name: data.branchName,
          branchCode: data.branchCode,
          address: data.branchAddress || undefined,
          city: data.branchCity || undefined,
          phone: data.branchPhone || undefined,
        },
        owner: {
          email: data.ownerEmail,
          password: data.ownerPassword,
          username: data.ownerUsername,
          fullName: data.ownerFullName,
          phoneNumber: data.ownerPhone || undefined,
          jobTitle: data.ownerJobTitle || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          form.reset();
          setTimeout(() => router.push("/tenants"), 1500);
        },
      }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-foreground">Tenant details</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tenantName">Name *</Label>
            <Input id="tenantName" {...form.register("tenantName")} />
            {form.formState.errors.tenantName && <p className="text-sm text-red-600">{form.formState.errors.tenantName.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="legalName">Legal name</Label>
            <Input id="legalName" {...form.register("legalName")} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="domain">Domain</Label>
            <Input id="domain" {...form.register("domain")} placeholder="acme.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" {...form.register("website")} placeholder="https://acme.com" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tenantAddress">Address</Label>
          <Input id="tenantAddress" {...form.register("tenantAddress")} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tenantCity">City</Label>
            <Input id="tenantCity" {...form.register("tenantCity")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenantState">State</Label>
            <Input id="tenantState" {...form.register("tenantState")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenantCountry">Country</Label>
            <Input id="tenantCountry" {...form.register("tenantCountry")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenantZipCode">Zip code</Label>
            <Input id="tenantZipCode" {...form.register("tenantZipCode")} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-foreground">Initial branch</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="branchName">Branch name *</Label>
            <Input id="branchName" {...form.register("branchName")} />
            {form.formState.errors.branchName && <p className="text-sm text-red-600">{form.formState.errors.branchName.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="branchCode">Branch code *</Label>
            <Input id="branchCode" {...form.register("branchCode")} placeholder="MB001" />
            {form.formState.errors.branchCode && <p className="text-sm text-red-600">{form.formState.errors.branchCode.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="branchAddress">Address</Label>
            <Input id="branchAddress" {...form.register("branchAddress")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="branchCity">City</Label>
            <Input id="branchCity" {...form.register("branchCity")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="branchPhone">Phone</Label>
            <Input id="branchPhone" {...form.register("branchPhone")} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-foreground">Owner account</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ownerFullName">Full name *</Label>
            <Input id="ownerFullName" {...form.register("ownerFullName")} />
            {form.formState.errors.ownerFullName && <p className="text-sm text-red-600">{form.formState.errors.ownerFullName.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ownerUsername">Username *</Label>
            <Input id="ownerUsername" {...form.register("ownerUsername")} />
            {form.formState.errors.ownerUsername && <p className="text-sm text-red-600">{form.formState.errors.ownerUsername.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ownerEmail">Email *</Label>
            <Input id="ownerEmail" type="email" {...form.register("ownerEmail")} />
            {form.formState.errors.ownerEmail && <p className="text-sm text-red-600">{form.formState.errors.ownerEmail.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ownerPassword">Password *</Label>
            <Input id="ownerPassword" type="password" {...form.register("ownerPassword")} placeholder="••••••••" />
            {form.formState.errors.ownerPassword && <p className="text-sm text-red-600">{form.formState.errors.ownerPassword.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ownerPhone">Phone</Label>
            <Input id="ownerPhone" {...form.register("ownerPhone")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ownerJobTitle">Job title</Label>
            <Input id="ownerJobTitle" {...form.register("ownerJobTitle")} />
          </div>
        </div>
      </fieldset>

      {showSuccess && <p className="text-sm text-green-600 font-medium">Tenant onboarded successfully. Redirecting...</p>}
      {onboard.isError && <p className="text-sm text-red-600">Failed to onboard tenant. Please try again.</p>}

      <Button type="submit" disabled={onboard.isPending}>
        {onboard.isPending ? "Onboarding..." : "Onboard tenant"}
      </Button>
    </form>
  );
}
