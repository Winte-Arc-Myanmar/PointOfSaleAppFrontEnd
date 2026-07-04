"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Boxes,
  FolderTree,
  Info,
  ListChecks,
  Package,
  Plus,
  Unplug,
} from "lucide-react";
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
import { DataTable } from "@/presentation/components/data-table";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { useToast } from "@/presentation/providers/ToastProvider";
import {
  useAttachModifierGroupToProduct,
  useCreateModifier,
  useDeleteModifier,
  useDetachModifierGroupFromProduct,
  useModifierGroup,
  useModifiers,
  useUpdateModifier,
} from "@/presentation/hooks/useModifierGroups";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useCategories } from "@/presentation/hooks/useCategories";
import type { Modifier } from "@/core/domain/entities/ModifierGroup";
import type { Product } from "@/core/domain/entities/Product";

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function ModifierGroupDetail({ modifierGroupId }: { modifierGroupId: string }) {
  const toast = useToast();
  const { data: group, isLoading, error } = useModifierGroup(modifierGroupId);
  const { data: modifiersResult } = useModifiers(modifierGroupId, {
    page: 1,
    limit: 200,
    sortBy: "sortOrder",
    sortOrder: "asc",
  });
  const { data: productsResult } = useProducts({ page: 1, limit: 200 });
  const { data: categoriesResult } = useCategories({ page: 1, limit: 200 });

  const attachProduct = useAttachModifierGroupToProduct();
  const detachProduct = useDetachModifierGroupFromProduct();
  const createModifier = useCreateModifier();
  const updateModifier = useUpdateModifier();
  const deleteModifier = useDeleteModifier();

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSortOrder, setSelectedSortOrder] = useState("0");
  const [modifierName, setModifierName] = useState("");
  const [modifierPriceDelta, setModifierPriceDelta] = useState("0");
  const [modifierSortOrder, setModifierSortOrder] = useState("0");
  const [modifierIsDefault, setModifierIsDefault] = useState(false);

  const products = productsResult?.items ?? [];
  const categories = categoriesResult?.items ?? [];
  const modifiers = modifiersResult?.items ?? [];

  const relatedProducts = useMemo(
    () => (group ? products.filter((p) => p.tenantId === group.tenantId) : []),
    [products, group],
  );

  const overviewRows = group
    ? [
        { label: "Group ID", value: safeText(group.id), mono: true },
        { label: "Name", value: safeText(group.name) },
        { label: "Tenant ID", value: safeText(group.tenantId), mono: true },
        { label: "Min selection", value: String(group.minSelection) },
        { label: "Max selection", value: String(group.maxSelection) },
        { label: "Required", value: group.isRequired ? "Yes" : "No" },
      ]
    : [];

  const recordRows = group
    ? [
        { label: "Created at", value: formatDate(group.createdAt ?? undefined) },
        { label: "Updated at", value: formatDate(group.updatedAt ?? undefined) },
        { label: "Deleted at", value: formatDate(group.deletedAt ?? undefined) },
      ]
    : [];

  const productColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Product",
        render: (product: Product) => (
          <Link href={`/products/${product.id}`} className="text-mint hover:underline">
            {product.name}
          </Link>
        ),
      },
      {
        key: "categoryName",
        header: "Category",
        render: (product: Product) => <span className="text-muted">{product.categoryName || "—"}</span>,
      },
      {
        key: "baseSku",
        header: "Base SKU",
        render: (product: Product) => <span className="font-mono text-xs text-muted">{product.baseSku}</span>,
      },
      {
        key: "actions",
        header: "Actions",
        render: (product: Product) => (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                attachProduct.mutate(
                  {
                    id: modifierGroupId,
                    data: {
                      productId: String(product.id),
                      sortOrder: 0,
                    },
                  },
                  {
                    onSuccess: () => toast.success("Group attached to product."),
                    onError: () => toast.error("Failed to attach group."),
                  },
                )
              }
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Attach
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                detachProduct.mutate(
                  {
                    id: modifierGroupId,
                    productId: String(product.id),
                  },
                  {
                    onSuccess: () => toast.success("Group detached from product."),
                    onError: () => toast.error("Failed to detach group."),
                  },
                )
              }
            >
              <Unplug className="h-3.5 w-3.5 mr-1" />
              Detach
            </Button>
          </div>
        ),
      },
    ],
    [attachProduct, detachProduct, modifierGroupId, toast],
  );

  if (isLoading) {
    return <AppLoader fullScreen={false} size="md" message="Loading modifier group..." />;
  }
  if (error || !group) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Modifier group not found or failed to load.</p>
        <Link href="/modifier-groups">
          <Button variant="outline">Back to Modifier Groups</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/modifier-groups"
        backLabel="Modifier Groups"
        title={safeText(group.name)}
        editHref={`/modifier-groups/${group.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Group overview" icon={ListChecks}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Attach or detach to product" icon={Package}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="grid gap-2 md:col-span-2">
            <Label>Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {relatedProducts.map((product) => (
                  <SelectItem key={product.id} value={String(product.id)}>
                    {product.name} ({product.baseSku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Sort order</Label>
            <Input
              type="number"
              value={selectedSortOrder}
              onChange={(e) => setSelectedSortOrder(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!selectedProductId.trim() || attachProduct.isPending}
            onClick={() =>
              attachProduct.mutate(
                {
                  id: modifierGroupId,
                  data: {
                    productId: selectedProductId.trim(),
                    sortOrder: toNumber(selectedSortOrder, 0),
                  },
                },
                {
                  onSuccess: () => toast.success("Group attached to product."),
                  onError: () => toast.error("Failed to attach group."),
                },
              )
            }
          >
            {attachProduct.isPending ? "Attaching..." : "Attach selected product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!selectedProductId.trim() || detachProduct.isPending}
            onClick={() =>
              detachProduct.mutate(
                { id: modifierGroupId, productId: selectedProductId.trim() },
                {
                  onSuccess: () => toast.success("Group detached from product."),
                  onError: () => toast.error("Failed to detach group."),
                },
              )
            }
          >
            {detachProduct.isPending ? "Detaching..." : "Detach selected product"}
          </Button>
        </div>
      </DetailSection>

      <DetailSection title="Related products" icon={Package}>
        <DataTable
          data={relatedProducts}
          columns={productColumns}
          actions={[]}
          emptyText="No products for this tenant."
        />
      </DetailSection>

      <DetailSection title="Modifiers in this group" icon={Boxes}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={modifierName}
                onChange={(e) => setModifierName(e.target.value)}
                placeholder="Bacon"
              />
            </div>
            <div className="grid gap-2">
              <Label>Price delta</Label>
              <Input
                value={modifierPriceDelta}
                onChange={(e) => setModifierPriceDelta(e.target.value)}
                type="number"
                step="0.01"
              />
            </div>
            <div className="grid gap-2">
              <Label>Sort order</Label>
              <Input
                value={modifierSortOrder}
                onChange={(e) => setModifierSortOrder(e.target.value)}
                type="number"
              />
            </div>
            <div className="grid gap-2">
              <Label>Default</Label>
              <label className="flex h-10 items-center gap-2 rounded-lg border border-border px-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-emerald-500"
                  checked={modifierIsDefault}
                  onChange={(e) => setModifierIsDefault(e.target.checked)}
                />
                <span className="text-sm">Is default</span>
              </label>
            </div>
            <div className="grid gap-2">
              <Label>&nbsp;</Label>
              <Button
                type="button"
                disabled={createModifier.isPending || !modifierName.trim()}
                onClick={() =>
                  createModifier.mutate(
                    {
                      groupId: modifierGroupId,
                      data: {
                        name: modifierName.trim(),
                        priceDelta: String(toNumber(modifierPriceDelta, 0)),
                        sortOrder: toNumber(modifierSortOrder, 0),
                        isDefault: modifierIsDefault,
                      },
                    },
                    {
                      onSuccess: () => {
                        toast.success("Modifier created.");
                        setModifierName("");
                        setModifierPriceDelta("0");
                        setModifierSortOrder("0");
                        setModifierIsDefault(false);
                      },
                      onError: () => toast.error("Failed to create modifier."),
                    },
                  )
                }
              >
                {createModifier.isPending ? "Adding..." : "Add modifier"}
              </Button>
            </div>
          </div>

          {modifiers.length === 0 ? (
            <p className="text-sm text-muted">No modifiers yet.</p>
          ) : (
            <div className="space-y-2">
              {modifiers.map((modifier: Modifier) => (
                <div
                  key={modifier.id}
                  className="flex flex-col lg:flex-row lg:items-center lg:justify-between rounded-md border border-border p-3 gap-3"
                >
                  <div className="text-sm">
                    <p className="font-medium">
                      {modifier.name} ({modifier.priceDelta})
                    </p>
                    <p className="text-muted">
                      Sort: {modifier.sortOrder} | Default: {modifier.isDefault ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateModifier.mutate(
                          {
                            groupId: modifierGroupId,
                            id: String(modifier.id),
                            data: {
                              name: modifier.name,
                              priceDelta: modifier.priceDelta,
                              sortOrder: modifier.sortOrder,
                              isDefault: modifier.isDefault,
                            },
                          },
                          {
                            onSuccess: () => toast.success("Modifier refreshed."),
                            onError: () => toast.error("Failed to update modifier."),
                          },
                        )
                      }
                    >
                      Update
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        deleteModifier.mutate(
                          { groupId: modifierGroupId, id: String(modifier.id) },
                          {
                            onSuccess: () => toast.success("Modifier removed."),
                            onError: () => toast.error("Failed to remove modifier."),
                          },
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DetailSection>

      <DetailSection title="Product-related context" icon={FolderTree}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Products</p>
            <p className="text-lg font-semibold">{relatedProducts.length}</p>
            <Link href="/products" className="text-xs text-mint hover:underline">
              View products
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Categories</p>
            <p className="text-lg font-semibold">{categories.length}</p>
            <Link href="/categories" className="text-xs text-mint hover:underline">
              View categories
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Modifiers in group</p>
            <p className="text-lg font-semibold">{modifiers.length}</p>
            <p className="text-xs text-muted mt-1">Used for product option customization</p>
          </div>
        </div>
      </DetailSection>
    </div>
  );
}
