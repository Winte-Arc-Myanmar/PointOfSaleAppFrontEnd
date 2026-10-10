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
import { InfoTip } from "@/presentation/components/ui/info-tip";
import {
  DEFAULT_TENANT_TIMEZONE,
  onboardTenantDefaultValues,
  onboardTenantSchema,
  type OnboardTenantFormData,
} from "./system-admin-form-schema";
import { optionalText } from "@/features/users/presentation/user-form-schema";

// Browsers list Myanmar under its old name (Asia/Rangoon); keep the current one
// first, or the dropdown would fall back to the first zone in the list.
const TIMEZONES: string[] = (() => {
  try {
    return [
      DEFAULT_TENANT_TIMEZONE,
      ...Intl.supportedValuesOf("timeZone").filter(
        (zone) => zone !== DEFAULT_TENANT_TIMEZONE,
      ),
    ];
  } catch {
    return [DEFAULT_TENANT_TIMEZONE];
  }
})();

export function OnboardTenantForm() {
  const router = useRouter();
  const onboard = useOnboardTenant();
  const toast = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [ownerLoginId, setOwnerLoginId] = useState<string | null>(null);
  const form = useForm<OnboardTenantFormData>({
    resolver: zodResolver(onboardTenantSchema),
    defaultValues: onboardTenantDefaultValues,
  });
  const { register, formState: { errors } } = form;

  const blank = (value: string) => value.trim() || undefined;

  const onSubmit = (data: OnboardTenantFormData) => {
    setShowSuccess(false);
    onboard.mutate(
      {
        tenant: {
          name: data.tenant.name,
          timezone: data.tenant.timezone,
          legalName: blank(data.tenant.legalName),
          domain: blank(data.tenant.domain),
          website: blank(data.tenant.website),
          address: blank(data.tenant.address),
          city: blank(data.tenant.city),
          state: blank(data.tenant.state),
          country: blank(data.tenant.country),
          zipCode: blank(data.tenant.zipCode),
        },
        branch: {
          name: data.branch.name,
          branchCode: blank(data.branch.branchCode),
          address: blank(data.branch.address),
          city: blank(data.branch.city),
          phone: blank(data.branch.phone),
        },
        owner: {
          email: optionalText(data.owner.email),
          password: data.owner.password,
          fullName: data.owner.fullName,
          phoneNumber: blank(data.owner.phoneNumber),
          jobTitle: blank(data.owner.jobTitle) ?? "Owner",
        },
      },
      {
        onSuccess: (result) => {
          toast.success("Shop created.");
          const loginId = result?.owner?.userId ?? null;
          setOwnerLoginId(loginId);
          setShowSuccess(true);
          form.reset(onboardTenantDefaultValues);
          if (!loginId) setTimeout(() => router.push("/tenants"), 1500);
        },
        onError: () => toast.error("Failed to create the shop."),
      },
    );
  };

  const field = (
    id: string,
    label: string,
    name: Parameters<typeof register>[0],
    error?: string,
    extra: Record<string, string> = {},
  ) => (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...register(name)} {...extra} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );

  const hasOptionalError = Boolean(
    errors.tenant?.website || errors.branch?.phone || errors.owner?.email || errors.owner?.phoneNumber,
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("tenant-name", "Shop name *", "tenant.name", errors.tenant?.name?.message, {
          placeholder: "e.g. Golden Lotus Spa",
        })}
        {field("branch-name", "Branch name *", "branch.name", errors.branch?.name?.message, {
          placeholder: "e.g. Main",
        })}
        {field("owner-fullName", "Owner name *", "owner.fullName", errors.owner?.fullName?.message)}
        {field("owner-password", "Owner password *", "owner.password", errors.owner?.password?.message, {
          type: "password",
          placeholder: "At least 8 characters",
        })}
      </div>

      <details className="rounded-lg border border-border px-4 py-3" open={hasOptionalError || undefined}>
        <summary className="cursor-pointer text-sm font-medium text-foreground">
          More details (optional)
        </summary>
        <div className="mt-4 space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-foreground">Shop</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="tenant-timezone">
                  Timezone
                  <InfoTip text="The business day and daily reports follow this timezone." />
                </Label>
                <select
                  id="tenant-timezone"
                  {...register("tenant.timezone")}
                  className="flex h-10 w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint dark:border-border dark:bg-background dark:text-foreground"
                >
                  {TIMEZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>
              {field("tenant-legalName", "Legal name", "tenant.legalName")}
              {field("tenant-website", "Website", "tenant.website", errors.tenant?.website?.message, {
                placeholder: "https://example.com",
              })}
              {field("tenant-domain", "Domain", "tenant.domain", undefined, { placeholder: "example.com" })}
              {field("tenant-address", "Address", "tenant.address")}
              {field("tenant-city", "City", "tenant.city")}
              {field("tenant-state", "State", "tenant.state")}
              {field("tenant-country", "Country", "tenant.country")}
              {field("tenant-zipCode", "Zip code", "tenant.zipCode")}
            </div>
          </fieldset>
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-foreground">Branch</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {field("branch-branchCode", "Branch code", "branch.branchCode", undefined, { placeholder: "e.g. MB001" })}
              {field("branch-phone", "Phone", "branch.phone", errors.branch?.phone?.message, {
                placeholder: "+959123456789",
              })}
              {field("branch-address", "Address", "branch.address")}
              {field("branch-city", "City", "branch.city")}
            </div>
          </fieldset>
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-foreground">Owner</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {field("owner-email", "Email", "owner.email", errors.owner?.email?.message, { type: "email" })}
              {field("owner-phoneNumber", "Phone", "owner.phoneNumber", errors.owner?.phoneNumber?.message, {
                placeholder: "+959123456789",
              })}
              {field("owner-jobTitle", "Job title", "owner.jobTitle", undefined, { placeholder: "Owner" })}
            </div>
          </fieldset>
        </div>
      </details>

      {showSuccess &&
        (ownerLoginId ? (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3 text-sm">
            <span>
              Shop created. The owner signs in with User ID{" "}
              <span className="font-mono font-semibold">{ownerLoginId}</span>
            </span>
            <Button type="button" variant="outline" size="sm" onClick={() => router.push("/tenants")}>
              Go to shops
            </Button>
          </div>
        ) : (
          <p className="text-sm font-medium text-green-600">Shop created. Redirecting...</p>
        ))}
      {onboard.isError && (
        <p className="text-sm text-red-600">Failed to create the shop. Please try again.</p>
      )}

      <Button type="submit" disabled={onboard.isPending}>
        {onboard.isPending ? "Creating..." : "Create shop"}
      </Button>
    </form>
  );
}
