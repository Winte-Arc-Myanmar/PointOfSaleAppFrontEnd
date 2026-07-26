"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateGrnLine } from "@/presentation/hooks/useGrnLines";
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
  poLineId: z.string().min(1, "PO line ID is required"),
  productId: z.string().min(1, "Product is required"),
  receivedQuantity: z.string().min(1, "Received quantity is required"),
  acceptedQuantity: z.string().min(1, "Accepted quantity is required"),
  rejectedQuantity: z.string().min(1, "Rejected quantity is required"),
  inventoryLedgerPosted: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  poLineId: "",
  productId: "",
  receivedQuantity: "0.0000",
  acceptedQuantity: "0.0000",
  rejectedQuantity: "0.0000",
  inventoryLedgerPosted: false,
};

export interface CreateGrnLineFormProps {
  grnId: string;
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateGrnLineForm({
  grnId,
  onSuccess,
  formId,
  onLoadingChange,
}: CreateGrnLineFormProps) {
  const create = useCreateGrnLine(grnId);
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
        poLineId: data.poLineId.trim(),
        productId: data.productId,
        receivedQuantity: data.receivedQuantity.trim(),
        acceptedQuantity: data.acceptedQuantity.trim(),
        rejectedQuantity: data.rejectedQuantity.trim(),
        inventoryLedgerPosted: data.inventoryLedgerPosted,
      },
      {
        onSuccess: () => {
          toast.success("GRN line created.");
          form.reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create GRN line."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="poLineId">PO line ID</Label>
          <Input
            id="poLineId"
            className="font-mono text-sm"
            {...form.register("poLineId")}
            placeholder="uuid"
          />
          {form.formState.errors.poLineId && (
            <p className="text-sm text-red-600">{form.formState.errors.poLineId.message}</p>
          )}
        </div>

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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div className="grid gap-2">
          <Label htmlFor="acceptedQuantity">Accepted quantity</Label>
          <Input
            id="acceptedQuantity"
            {...form.register("acceptedQuantity")}
            placeholder="0.0000"
          />
          {form.formState.errors.acceptedQuantity && (
            <p className="text-sm text-red-600">
              {form.formState.errors.acceptedQuantity.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rejectedQuantity">Rejected quantity</Label>
          <Input
            id="rejectedQuantity"
            {...form.register("rejectedQuantity")}
            placeholder="0.0000"
          />
          {form.formState.errors.rejectedQuantity && (
            <p className="text-sm text-red-600">
              {form.formState.errors.rejectedQuantity.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="inventoryLedgerPosted">Inventory ledger posted</Label>
        <Controller
          control={form.control}
          name="inventoryLedgerPosted"
          render={({ field }) => (
            <Select
              value={field.value ? "true" : "false"}
              onValueChange={(value) => field.onChange(value === "true")}
            >
              <SelectTrigger id="inventoryLedgerPosted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </form>
  );
}
