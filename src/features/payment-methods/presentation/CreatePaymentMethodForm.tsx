"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePaymentMethod } from "@/presentation/hooks/usePaymentMethods";
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

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  name: z.string().min(1, "Name is required"),
  glAccountId: z.string().min(1, "GL account ID is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  name: "",
  glAccountId: "",
};

export interface CreatePaymentMethodFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreatePaymentMethodForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreatePaymentMethodFormProps) {
  const create = useCreatePaymentMethod();
  const toast = useToast();
  const { data: tenants = [] } = useTenants();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        name: data.name,
        glAccountId: data.glAccountId,
      },
      {
        onSuccess: () => {
          toast.success("Payment method created.");
          form.reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create payment method."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          {form.formState.errors.tenantId && (
            <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input {...form.register("name")} placeholder="Cash" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>GL account ID</Label>
        <Input className="font-mono text-sm" {...form.register("glAccountId")} placeholder="uuid" />
      </div>

      {!formId && (
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create Payment Method"}
        </Button>
      )}
    </form>
  );
}

