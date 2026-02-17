"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IProductService } from "@/core/domain/services/IProductService";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  priceAmount: z.number().positive("Price must be positive"),
  priceCurrency: z.string().min(1, "Currency is required"),
  quantityInStock: z.number().int().min(0),
});

type FormData = z.infer<typeof schema>;

export function CreateProductForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      priceAmount: 0,
      priceCurrency: "USD",
      quantityInStock: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const productService = container.resolve<IProductService>("productService");
      return productService.create({
        name: data.name,
        sku: data.sku,
        priceAmount: data.priceAmount,
        priceCurrency: data.priceCurrency,
        quantityInStock: data.quantityInStock,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
    },
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="Product name" />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" {...register("sku")} placeholder="SKU-001" />
        {errors.sku && (
          <p className="text-sm text-red-600">{errors.sku.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="priceAmount">Price</Label>
        <Input
          id="priceAmount"
          type="number"
          step="0.01"
          {...register("priceAmount", { valueAsNumber: true })}
        />
          {errors.priceAmount && (
            <p className="text-sm text-red-600">{errors.priceAmount.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priceCurrency">Currency</Label>
          <Input id="priceCurrency" {...register("priceCurrency")} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="quantityInStock">Quantity in stock</Label>
        <Input
          id="quantityInStock"
          type="number"
          {...register("quantityInStock", { valueAsNumber: true })}
        />
        {errors.quantityInStock && (
          <p className="text-sm text-red-600">
            {errors.quantityInStock.message}
          </p>
        )}
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-600">
          Failed to create product. Check backend connectivity.
        </p>
      )}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create Product"}
      </Button>
    </form>
  );
}
