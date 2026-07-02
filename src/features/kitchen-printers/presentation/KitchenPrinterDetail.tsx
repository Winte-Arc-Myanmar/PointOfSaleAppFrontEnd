"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FolderTree, Info, Printer } from "lucide-react";
import {
  useAttachCategoryToKitchenPrinter,
  useDetachCategoryFromKitchenPrinter,
  useKitchenPrinter,
} from "@/presentation/hooks/useKitchenPrinters";
import { useCategories } from "@/presentation/hooks/useCategories";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

export function KitchenPrinterDetail({ printerId }: { printerId: string }) {
  const toast = useToast();
  const { data: printer, isLoading, error } = useKitchenPrinter(printerId);
  const { data: categoriesResult } = useCategories({ page: 1, limit: 200 });
  const categories = getPaginatedItems(categoriesResult);

  const attachCategory = useAttachCategoryToKitchenPrinter();
  const detachCategory = useDetachCategoryFromKitchenPrinter();

  const [categoryId, setCategoryId] = useState("");
  const [detachCategoryId, setDetachCategoryId] = useState("");

  const rows = useMemo(
    () =>
      printer
        ? [
            { label: "Printer ID", value: safeText(printer.id), mono: true },
            { label: "Name", value: safeText(printer.name) },
            { label: "IP address", value: safeText(printer.ipAddress), mono: true },
            { label: "Port", value: String(printer.port), mono: true },
            {
              label: "Status",
              value: printer.isActive ? "Active" : "Inactive",
            },
            { label: "Location ID", value: safeText(printer.locationId), mono: true },
            { label: "Tenant ID", value: safeText(printer.tenantId), mono: true },
          ]
        : [],
    [printer]
  );

  const recordRows = useMemo(
    () =>
      printer
        ? [
            { label: "Created at", value: formatDate(printer.createdAt ?? undefined) },
            { label: "Updated at", value: formatDate(printer.updatedAt ?? undefined) },
          ]
        : [],
    [printer]
  );

  if (isLoading) {
    return <AppLoader fullScreen={false} size="md" message="Loading kitchen printer..." />;
  }
  if (error || !printer) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Kitchen printer not found or failed to load.</p>
        <Link href="/kitchen-printers">
          <Button variant="outline">Back to Kitchen Printers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/kitchen-printers"
        backLabel="Kitchen Printers"
        title={safeText(printer.name)}
        editHref={`/kitchen-printers/${printer.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Printer overview" icon={Printer}>
          <DetailRows rows={rows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Category routing" icon={FolderTree}>
        <p className="text-sm text-muted mb-4">
          Route menu categories to this printer so kitchen tickets print to the correct station.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Attach category</p>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              disabled={!categoryId || attachCategory.isPending}
              onClick={() => {
                attachCategory.mutate(
                  { printerId, categoryId },
                  {
                    onSuccess: () => {
                      toast.success("Category routed to printer.");
                      setCategoryId("");
                    },
                    onError: () => toast.error("Failed to route category."),
                  }
                );
              }}
            >
              {attachCategory.isPending ? "Attaching..." : "Attach category"}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Detach category</p>
            <Select value={detachCategoryId} onValueChange={setDetachCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              disabled={!detachCategoryId || detachCategory.isPending}
              onClick={() => {
                detachCategory.mutate(
                  { printerId, categoryId: detachCategoryId },
                  {
                    onSuccess: () => {
                      toast.success("Category removed from printer.");
                      setDetachCategoryId("");
                    },
                    onError: () => toast.error("Failed to detach category."),
                  }
                );
              }}
            >
              {detachCategory.isPending ? "Detaching..." : "Detach category"}
            </Button>
          </div>
        </div>
      </DetailSection>
    </div>
  );
}
