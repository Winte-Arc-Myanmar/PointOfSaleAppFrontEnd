"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGrnLine,
  useUpdateGrnLine,
} from "@/presentation/hooks/useGrnLines";
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
  poLineId: z.string().min(1, "PO line ID is required"),
  productId: z.string().min(1, "Product is required"),
  receivedQuantity: z.string().min(1, "Received quantity is required"),
  acceptedQuantity: z.string().min(1, "Accepted quantity is required"),
  rejectedQuantity: z.string().min(1, "Rejected quantity is required"),
  inventoryLedgerPosted: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function EditGrnLineForm({
  grnId,
  lineId,
}: {
  grnId: string;
  lineId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateGrnLine(grnId);
  const { data: line, isLoading, error } = useGrnLine(grnId, lineId);
  const { data: productsData } = useProducts({ page: 1, limit: LIST_LIMIT });
  const products = getPaginatedItems(productsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      poLineId: "",
      productId: "",
      receivedQuantity: "0.0000",
      acceptedQuantity: "0.0000",
      rejectedQuantity: "0.0000",
      inventoryLedgerPosted: false,
    },
  });

  useEffect(() => {
    if (line) {
      form.reset({
        poLineId: line.poLineId,
        productId: line.productId,
        receivedQuantity: line.receivedQuantity,
        acceptedQuantity: line.acceptedQuantity,
        rejectedQuantity: line.rejectedQuantity,
        inventoryLedgerPosted: line.inventoryLedgerPosted,
      });
    }
  }, [line, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: lineId,
        data: {
          poLineId: data.poLineId.trim(),
          productId: data.productId,
          receivedQuantity: data.receivedQuantity.trim(),
          acceptedQuantity: data.acceptedQuantity.trim(),
          rejectedQuantity: data.rejectedQuantity.trim(),
          inventoryLedgerPosted: data.inventoryLedgerPosted,
        },
      },
      {
        onSuccess: () => {
          toast.success("GRN line updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/grn-lines/${grnId}/${lineId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update GRN line."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !line) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">GRN line not found.</p>
        <Link href={`/grn-lines/${grnId}`}>
          <Button variant="outline">Back to GRN Lines</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/grn-lines/${grnId}/${lineId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit GRN line</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="poLineId">PO line ID</Label>
            <Input
              id="poLineId"
              className="font-mono text-sm"
              {...form.register("poLineId")}
              placeholder="uuid"
            />
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
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="receivedQuantity">Received quantity</Label>
            <Input id="receivedQuantity" {...form.register("receivedQuantity")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="acceptedQuantity">Accepted quantity</Label>
            <Input id="acceptedQuantity" {...form.register("acceptedQuantity")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rejectedQuantity">Rejected quantity</Label>
            <Input id="rejectedQuantity" {...form.register("rejectedQuantity")} />
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

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            GRN line updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/grn-lines/${grnId}/${lineId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
