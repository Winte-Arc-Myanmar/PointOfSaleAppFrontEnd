"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePaymentMethod, useUpdatePaymentMethod } from "@/presentation/hooks/usePaymentMethods";
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
import { AppLoader } from "@/presentation/components/loader";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  name: z.string().min(1, "Name is required"),
  glAccountId: z.string().min(1, "GL account ID is required"),
});

type FormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

export function EditPaymentMethodForm({ paymentMethodId }: { paymentMethodId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdatePaymentMethod();
  const { data: method, isLoading, error } = usePaymentMethod(paymentMethodId);
  const { data: tenants = [] } = useTenants();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tenantId: "", name: "", glAccountId: "" },
  });

  useEffect(() => {
    if (method) {
      form.reset({
        tenantId: method.tenantId,
        name: method.name,
        glAccountId: method.glAccountId,
      });
    }
  }, [method, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: paymentMethodId,
        data: {
          tenantId: data.tenantId,
          name: data.name,
          glAccountId: data.glAccountId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Payment method updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/payment-methods/${paymentMethodId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update payment method."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !method) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Payment method not found.</p>
        <Link href="/payment-methods">
          <Button variant="outline">Back to payment methods</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/payment-methods/${paymentMethodId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit payment method</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Tenant</Label>
            <Controller
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
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
          </div>

          <div className="grid gap-2">
            <Label>Name</Label>
            <Input {...form.register("name")} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>GL account ID</Label>
          <Input className="font-mono text-sm" {...form.register("glAccountId")} />
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Payment method updated successfully. Redirecting...
          </p>
        )}
        {update.isError && (
          <p className="text-sm text-red-600">Failed to update payment method.</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/payment-methods/${paymentMethodId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

