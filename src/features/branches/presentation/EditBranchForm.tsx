"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBranch, useUpdateBranch } from "@/presentation/hooks/useBranches";
import { useTenants } from "@/presentation/hooks/useTenants";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";

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

type BranchFormData = z.infer<typeof schema>;

function parseOpeningHours(json: string): Record<string, string> | undefined {
  if (!json.trim()) return undefined;
  try {
    const v = JSON.parse(json) as unknown;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, string>) : undefined;
  } catch {
    return undefined;
  }
}

const REDIRECT_DELAY_MS = 1500;

export function EditBranchForm({ branchId }: { branchId: string }) {
  const router = useRouter();
  const { data: branch, isLoading, error } = useBranch(branchId);
  const { data: tenants = [] } = useTenants();
  const updateBranch = useUpdateBranch();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<BranchFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
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
    },
  });

  useEffect(() => {
    if (branch) {
      form.reset({
        name: branch.name,
        tenantId: branch.tenantId,
        branchCode: branch.branchCode,
        type: branch.type || "RESTAURANT",
        address: branch.address ?? "",
        city: branch.city ?? "",
        state: branch.state ?? "",
        country: branch.country ?? "",
        zipCode: branch.zipCode ?? "",
        phone: branch.phone ?? "",
        email: branch.email ?? "",
        latitude: branch.latitude != null ? String(branch.latitude) : "",
        longitude: branch.longitude != null ? String(branch.longitude) : "",
        openingHoursJson:
          branch.openingHours && typeof branch.openingHours === "object"
            ? JSON.stringify(branch.openingHours, null, 2)
            : "",
      });
    }
  }, [branch, form]);

  const onSubmit = (data: BranchFormData) => {
    setShowSuccess(false);
    const lat = data.latitude ? Number(data.latitude) : undefined;
    const lng = data.longitude ? Number(data.longitude) : undefined;
    updateBranch.mutate(
      {
        id: branchId,
        data: {
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
      },
      {
        onSuccess: () => {
          form.reset(form.getValues());
          setShowSuccess(true);
          setTimeout(() => router.push("/branches"), REDIRECT_DELAY_MS);
        },
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !branch)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Branch not found.</p>
        <Link href="/branches">
          <Button variant="outline">Back to Branches</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/branches">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit branch</h1>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant</Label>
          <select
            id="tenantId"
            {...form.register("tenantId")}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2"
          >
            <option value="">Select tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="branchCode">Branch code</Label>
            <Input id="branchCode" {...form.register("branchCode")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              {...form.register("type")}
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
          <Input id="address" {...form.register("address")} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register("city")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...form.register("state")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...form.register("country")} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="zipCode">Zip code</Label>
          <Input id="zipCode" {...form.register("zipCode")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...form.register("email")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" type="number" step="any" {...form.register("latitude")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" type="number" step="any" {...form.register("longitude")} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="openingHoursJson">Opening hours (JSON)</Label>
          <textarea
            id="openingHoursJson"
            {...form.register("openingHoursJson")}
            rows={3}
            className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2"
          />
        </div>
        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Branch updated. Redirecting...
          </p>
        )}
        {updateBranch.isError && (
          <p className="text-sm text-red-600">Failed to update branch.</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={updateBranch.isPending}>
            {updateBranch.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href="/branches">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
