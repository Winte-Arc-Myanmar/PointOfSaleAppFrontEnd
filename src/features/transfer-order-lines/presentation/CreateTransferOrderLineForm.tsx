"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTransferOrderLine } from "@/presentation/hooks/useTransferOrderLines";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const LIST_LIMIT = 200;

const schema = z.object({
  productId: z.string().min(1, "Product is required"),
  requestedQuantity: z.string().min(1, "Requested quantity is required"),
  shippedQuantity: z.string().min(1, "Shipped quantity is required"),
  receivedQuantity: z.string().min(1, "Received quantity is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  productId: "",
  requestedQuantity: "0.0000",
  shippedQuantity: "0.0000",
  receivedQuantity: "0.0000",
};

export interface CreateTransferOrderLineFormProps {
  transferOrderId: string;
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateTransferOrderLineForm({
  transferOrderId,
  onSuccess,
  formId,
  onLoadingChange,
}: CreateTransferOrderLineFormProps) {
  const create = useCreateTransferOrderLine(transferOrderId);
  const toast = useToast();
  const { data: productsData } = useProducts({ page: 1, limit: LIST_LIMIT });
  const products = getPaginatedItems(productsData);

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
        productId: data.productId,
        requestedQuantity: data.requestedQuantity.trim(),
        shippedQuantity: data.shippedQuantity.trim(),
        receivedQuantity: data.receivedQuantity.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Transfer order line created.");
          form.reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create transfer order line."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="productId">Product</Label>
        <Controller
          control={form.control}
          name="productId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="productId">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.productId && (
          <p className="text-sm text-red-600">{form.formState.errors.productId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="requestedQuantity">Requested quantity</Label>
          <Input
            id="requestedQuantity"
            {...form.register("requestedQuantity")}
            placeholder="0.0000"
          />
          {form.formState.errors.requestedQuantity && (
            <p className="text-sm text-red-600">
              {form.formState.errors.requestedQuantity.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="shippedQuantity">Shipped quantity</Label>
          <Input
            id="shippedQuantity"
            {...form.register("shippedQuantity")}
            placeholder="0.0000"
          />
          {form.formState.errors.shippedQuantity && (
            <p className="text-sm text-red-600">
              {form.formState.errors.shippedQuantity.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="receivedQuantity">Received quantity</Label>
          <Input
            id="receivedQuantity"
            {...form.register("receivedQuantity")}
            placeholder="0.0000"
          />
          {form.formState.errors.receivedQuantity && (
            <p className="text-sm text-red-600">
              {form.formState.errors.receivedQuantity.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
