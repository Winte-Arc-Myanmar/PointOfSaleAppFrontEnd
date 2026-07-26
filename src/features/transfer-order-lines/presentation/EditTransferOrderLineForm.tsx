"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useTransferOrderLine,
  useUpdateTransferOrderLine,
} from "@/presentation/hooks/useTransferOrderLines";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const REDIRECT_DELAY_MS = 1500;
const LIST_LIMIT = 200;

const schema = z.object({
  productId: z.string().min(1, "Product is required"),
  requestedQuantity: z.string().min(1, "Requested quantity is required"),
  shippedQuantity: z.string().min(1, "Shipped quantity is required"),
  receivedQuantity: z.string().min(1, "Received quantity is required"),
});

type FormData = z.infer<typeof schema>;

export function EditTransferOrderLineForm({
  transferOrderId,
  lineId,
}: {
  transferOrderId: string;
  lineId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateTransferOrderLine(transferOrderId);
  const { data: line, isLoading, error } = useTransferOrderLine(transferOrderId, lineId);
  const { data: productsData } = useProducts({ page: 1, limit: LIST_LIMIT });
  const products = getPaginatedItems(productsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: "",
      requestedQuantity: "0.0000",
      shippedQuantity: "0.0000",
      receivedQuantity: "0.0000",
    },
  });

  useEffect(() => {
    if (line) {
      form.reset({
        productId: line.productId,
        requestedQuantity: line.requestedQuantity,
        shippedQuantity: line.shippedQuantity,
        receivedQuantity: line.receivedQuantity,
      });
    }
  }, [line, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: lineId,
        data: {
          productId: data.productId,
          requestedQuantity: data.requestedQuantity.trim(),
          shippedQuantity: data.shippedQuantity.trim(),
          receivedQuantity: data.receivedQuantity.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Transfer order line updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/transfer-order-lines/${transferOrderId}/${lineId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update transfer order line."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !line) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Transfer order line not found.</p>
        <Link href={`/transfer-order-lines/${transferOrderId}`}>
          <Button variant="outline">Back to Transfer Order Lines</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/transfer-order-lines/${transferOrderId}/${lineId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit transfer order line</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="requestedQuantity">Requested quantity</Label>
            <Input id="requestedQuantity" {...form.register("requestedQuantity")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shippedQuantity">Shipped quantity</Label>
            <Input id="shippedQuantity" {...form.register("shippedQuantity")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="receivedQuantity">Received quantity</Label>
            <Input id="receivedQuantity" {...form.register("receivedQuantity")} />
          </div>
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Transfer order line updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/transfer-order-lines/${transferOrderId}/${lineId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
