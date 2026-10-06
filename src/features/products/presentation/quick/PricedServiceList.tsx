"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { useDeleteProduct, useProducts } from "@/presentation/hooks/useProducts";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import type { TranslationKey } from "@/presentation/i18n/translations";
import type { Product } from "@/core/domain/entities/Product";

type Column = { header: TranslationKey; cell: (product: Product) => React.ReactNode };

/** A plain list of one kind of priced service, with its own Add button. */
export function PricedServiceList({
  filter,
  columns,
  addHref,
  addLabel,
  emptyText,
  note,
}: {
  filter: (product: Product) => boolean;
  columns: Column[];
  addHref: string;
  addLabel: TranslationKey;
  emptyText: TranslationKey;
  note?: TranslationKey;
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const { t } = useLanguage();
  const del = useDeleteProduct();
  const { data, isLoading } = useProducts({ page: 1, limit: 500 });
  const rows = (data?.items ?? []).filter(filter);

  const remove = async (product: Product) => {
    const ok = await confirm({
      title: t("addProduct.remove"),
      description: t("addProduct.removeConfirm").replace("{name}", product.name),
      confirmLabel: t("addProduct.remove"),
      variant: "destructive",
    });
    if (!ok) return;
    del.mutate(String(product.id), {
      onSuccess: () => toast.success(t("addProduct.removed")),
      onError: () => toast.error(t("addProduct.couldNotSave")),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {note ? <p className="max-w-2xl text-xs text-muted">{t(note)}</p> : <span />}
        <Link href={addHref}>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            {t(addLabel)}
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <AppLoader fullScreen={false} size="sm" message="..." />
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
          {t(emptyText)}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs text-muted">
              <tr>
                {columns.map((column) => (
                  <th key={column.header} className="px-4 py-2 font-medium">
                    {t(column.header)}
                  </th>
                ))}
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => (
                <tr key={String(product.id)} className="border-t border-border">
                  {columns.map((column) => (
                    <td key={column.header} className="px-4 py-2">
                      {column.cell(product)}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/products/${product.id}/edit`)}>
                      {t("common.edit")}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => void remove(product)}>
                      {t("addProduct.remove")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** The price with its unit: "20,000 / hour". */
export function usePriceWithUnit() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  return (product: Product) => {
    const unit =
      product.soldBy !== "TIME"
        ? t("addProduct.unitCall")
        : product.timeBlockMinutes === 30
          ? t("addProduct.unitHalfHour")
          : t("addProduct.unitHour");
    return t("addProduct.perUnit").replace("{price}", formatPrice(product.basePrice)).replace("{unit}", unit);
  };
}
