"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBranch } from "@/presentation/hooks/useBranches";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
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
import { BranchLocationCapture } from "./BranchLocationCapture";

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
  const toast = useToast();
  const { data: tenants = [] } = useTenants();

  useEffect(() => {
    onLoadingChange?.(createBranch.isPending ?? false);
  }, [createBranch.isPending, onLoadingChange]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BranchFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const latWatch = watch("latitude");
  const lngWatch = watch("longitude");

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
          toast.success("Branch created.");
          reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create branch."),
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
        <Controller
          control={control}
          name="tenantId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="tenantId">
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
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
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESTAURANT">RESTAURANT</SelectItem>
                  <SelectItem value="RETAIL">RETAIL</SelectItem>
                  <SelectItem value="WAREHOUSE">WAREHOUSE</SelectItem>
                  <SelectItem value="OTHER">OTHER</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
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
      <input type="hidden" {...register("latitude")} />
      <input type="hidden" {...register("longitude")} />
      <BranchLocationCapture
        latitude={latWatch ?? ""}
        longitude={lngWatch ?? ""}
        onCoordinatesChange={(lat, lng) => {
          setValue("latitude", lat, { shouldDirty: true, shouldValidate: true });
          setValue("longitude", lng, { shouldDirty: true, shouldValidate: true });
        }}
        onClear={() => {
          setValue("latitude", "", { shouldDirty: true, shouldValidate: true });
          setValue("longitude", "", { shouldDirty: true, shouldValidate: true });
        }}
        toast={toast}
      />
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
