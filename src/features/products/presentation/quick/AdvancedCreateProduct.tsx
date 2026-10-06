"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { CreateProductForm } from "../CreateProductForm";

/** The full product form, for anything the simple forms do not cover. */
export function AdvancedCreateProduct() {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products/new">
          <Button variant="ghost" size="icon" aria-label={t("addProduct.back")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">{t("addProduct.advanced")}</h1>
      </div>
      <CreateProductForm onSuccess={() => router.push("/products")} />
    </div>
  );
}
