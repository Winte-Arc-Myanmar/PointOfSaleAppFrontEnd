"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBranch } from "@/presentation/hooks/useBranches";
import { useTenants } from "@/presentation/hooks/useTenants";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  branchCode: z.string().min(1, "Branch code is required"),
  type: z.string().min(1, "Type is required"),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  zipCode: z.string(),
  phone: z.string(),
  email: z.string().email("Invalid email").or(z.literal("")),
  latitude: z.string(),
  longitude: z.string(),
  openingHoursJson: z.string(),
});

export type BranchFormData = z.infer<typeof schema>;

const defaultValues: BranchFormData = {
  name: "",
  tenantId: "",
  branchCode: "",
  type: "RESTAURANT",
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  phone: "",
  email: "",
  latitude: "",
  longitude: "",
  openingHoursJson: "",
};

function parseOpeningHours(json: string): Record<string, string> | undefined {
  if (!json.trim()) return undefined;
  try {
    const v = JSON.parse(json) as unknown;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, string>) : undefined;
  } catch {
    return undefined;
  }
}

export interface CreateBranchFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateBranchForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateBranchFormProps) {
  const createBranch = useCreateBranch();
  const { data: tenants = [] } = useTenants();

  useEffect(() => {
    onLoadingChange?.(createBranch.isPending ?? false);
  }, [createBranch.isPending, onLoadingChange]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BranchFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (data: BranchFormData) => {
    const lat = data.latitude ? Number(data.latitude) : undefined;
    const lng = data.longitude ? Number(data.longitude) : undefined;
    createBranch.mutate(
      {
        name: data.name,
        tenantId: data.tenantId,
        branchCode: data.branchCode,
        type: data.type,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
        zipCode: data.zipCode || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        latitude: Number.isFinite(lat) ? lat : undefined,
        longitude: Number.isFinite(lng) ? lng : undefined,
        openingHours: parseOpeningHours(data.openingHoursJson),
      },
      {
        onSuccess: () => {
          reset(defaultValues);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="Main Branch" />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tenantId">Tenant</Label>
        <select
          id="tenantId"
          {...register("tenantId")}
          className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2"
        >
          <option value="">Select tenant</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {errors.tenantId && (
          <p className="text-sm text-red-600">{errors.tenantId.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="branchCode">Branch code</Label>
          <Input id="branchCode" {...register("branchCode")} placeholder="BR001" />
          {errors.branchCode && (
            <p className="text-sm text-red-600">{errors.branchCode.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            {...register("type")}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2"
          >
            <option value="RESTAURANT">RESTAURANT</option>
            <option value="RETAIL">RETAIL</option>
            <option value="WAREHOUSE">WAREHOUSE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} placeholder="123 Main St" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} placeholder="New York" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} placeholder="NY" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register("country")} placeholder="USA" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="zipCode">Zip code</Label>
        <Input id="zipCode" {...register("zipCode")} placeholder="10001" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} placeholder="+1234567890" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...register("email")} placeholder="branch@example.com" />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" type="number" step="any" {...register("latitude")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" type="number" step="any" {...register("longitude")} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="openingHoursJson">Opening hours (JSON, e.g. {`{"mon": "09:00-17:00"}`})</Label>
        <textarea
          id="openingHoursJson"
          {...register("openingHoursJson")}
          rows={2}
          className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2"
          placeholder='{"mon": "09:00-17:00", "tue": "09:00-17:00"}'
        />
      </div>
      {createBranch.isError && (
        <p className="text-sm text-red-600">Failed to create branch. Please try again.</p>
      )}
      {!formId && (
        <Button type="submit" disabled={createBranch.isPending}>
          {createBranch.isPending ? "Creating..." : "Create Branch"}
        </Button>
      )}
    </form>
  );
}
