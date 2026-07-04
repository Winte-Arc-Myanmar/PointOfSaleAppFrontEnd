"use client";

import Link from "next/link";
import { Gift, Info, ListTree } from "lucide-react";
import { useBundle } from "@/presentation/hooks/useBundles";
import { useProduct } from "@/presentation/hooks/useProducts";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function BundleDetail({ bundleId }: { bundleId: string }) {
  const { data: bundle, isLoading, error } = useBundle(bundleId);
  const { data: product } = useProduct(bundle?.productId ?? null);

  if (isLoading) {
    return <AppLoader fullScreen={false} size="md" message="Loading bundle..." />;
  }

  if (error || !bundle) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Bundle not found or failed to load.</p>
        <Link href="/bundles">
          <Button variant="outline">Back to Bundles</Button>
        </Link>
      </div>
    );
  }

  const overviewRows = [
    { label: "ID", value: safeText(bundle.id), mono: true },
    { label: "Tenant ID", value: safeText(bundle.tenantId), mono: true },
    { label: "Product ID", value: safeText(bundle.productId), mono: true },
    {
      label: "Product",
      value: product ? safeText(product.name) : "—",
    },
    { label: "Name", value: safeText(bundle.name) },
    { label: "Description", value: safeText(bundle.description) },
    { label: "Status", value: bundle.isActive ? "Active" : "Inactive" },
  ];

  const recordRows = [
    { label: "Created at", value: formatDate(bundle.createdAt ?? undefined) },
    { label: "Updated at", value: formatDate(bundle.updatedAt ?? undefined) },
    { label: "Deleted at", value: formatDate(bundle.deletedAt ?? undefined) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/bundles"
        backLabel="Bundles"
        title={safeText(bundle.name)}
        editHref={`/bundles/${bundle.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Gift}>
          <DetailRows rows={overviewRows} />
          {product && (
            <div className="mt-3 px-1">
              <Link
                href={`/products/${product.id}`}
                className="text-sm text-mint hover:underline"
              >
                View linked product
              </Link>
            </div>
          )}
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Components" icon={ListTree}>
        {bundle.components && bundle.components.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Variant ID</th>
                  <th className="px-3 py-2 text-left font-medium">Quantity</th>
                  <th className="px-3 py-2 text-left font-medium">Swap group</th>
                </tr>
              </thead>
              <tbody>
                {bundle.components.map((component, index) => (
                  <tr
                    key={`${component.variantId}-${index}`}
                    className="border-t border-border"
                  >
                    <td className="px-3 py-2 font-mono">
                      {safeText(component.variantId)}
                    </td>
                    <td className="px-3 py-2">{component.quantity}</td>
                    <td className="px-3 py-2">{safeText(component.swapGroupId)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">No components configured.</p>
        )}
      </DetailSection>
    </div>
  );
}
