"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCategory, useUpdateCategory } from "@/presentation/hooks/useCategories";
import { useCategories } from "@/presentation/hooks/useCategories";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  parentId: z.string(),
  description: z.string(),
  sortOrder: z.coerce.number().min(0),
});

type CategoryFormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

export function EditCategoryForm({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { data: category, isLoading, error } = useCategory(categoryId);
  const { data: categories = [] } = useCategories();
  const updateCategory = useUpdateCategory();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      tenantId: "",
      parentId: "",
      description: "",
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        tenantId: category.tenantId,
        parentId: category.parentId ?? "",
        description: category.description ?? "",
        sortOrder: category.sortOrder,
      });
    }
  }, [category, form]);

  const onSubmit = (data: CategoryFormData) => {
    setShowSuccess(false);
    updateCategory.mutate(
      {
        id: categoryId,
        data: {
          name: data.name,
          tenantId: data.tenantId,
          parentId: data.parentId || undefined,
          description: data.description || undefined,
          sortOrder: data.sortOrder,
        },
      },
      {
        onSuccess: () => {
          form.reset(form.getValues());
          setShowSuccess(true);
          setTimeout(() => router.push("/admin/categories"), REDIRECT_DELAY_MS);
        },
      }
    );
  };

  if (isLoading) return <p className="text-muted">Loading...</p>;
  if (error || !category)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Category not found.</p>
        <Link href="/admin/categories">
          <Button variant="outline">Back to Categories</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit category</h1>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant ID</Label>
          <Input id="tenantId" {...form.register("tenantId")} />
          {form.formState.errors.tenantId && (
            <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="parentId">Parent category</Label>
          <select
            id="parentId"
            {...form.register("parentId")}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2"
          >
            <option value="">None (root)</option>
            {categories.filter((c) => c.id !== categoryId).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...form.register("description")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input id="sortOrder" type="number" {...form.register("sortOrder")} />
          {form.formState.errors.sortOrder && (
            <p className="text-sm text-red-600">{form.formState.errors.sortOrder.message}</p>
          )}
        </div>
        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Category updated. Redirecting...
          </p>
        )}
        {updateCategory.isError && (
          <p className="text-sm text-red-600">Failed to update category.</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={updateCategory.isPending}>
            {updateCategory.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href="/admin/categories">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
