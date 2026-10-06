"use client";

import Link from "next/link";
import { ArrowLeft, Clock, MicVocal, Sparkles, UtensilsCrossed } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useLanguage } from "@/presentation/providers/LanguageProvider";

const CHOICES = [
  { href: "/products/new/menu", icon: UtensilsCrossed, title: "addProduct.menuTitle", hint: "addProduct.menuHint" },
  { href: "/products/new/hostess", icon: MicVocal, title: "addProduct.hostessTitle", hint: "addProduct.hostessHint" },
  { href: "/spa-packages", icon: Sparkles, title: "addProduct.spaTitle", hint: "addProduct.spaHint" },
  { href: "/products/new/rate", icon: Clock, title: "addProduct.rateTitle", hint: "addProduct.rateHint" },
] as const;

/** The first step of adding a product: say what it is, in everyday words. */
export function AddProductChooser() {
  const { t } = useLanguage();
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon" aria-label={t("addProduct.back")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="panel-header text-xl tracking-tight">{t("addProduct.chooseTitle")}</h1>
          <p className="text-sm text-muted">{t("addProduct.chooseHint")}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CHOICES.map(({ href, icon: Icon, title, hint }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-4 rounded-2xl border border-border bg-background/80 p-5 shadow-sm transition-colors hover:border-mint hover:bg-mint/5"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-mint/15 text-mint">
              <Icon className="size-5" />
            </span>
            <span>
              <span className="block text-base font-semibold">{t(title)}</span>
              <span className="mt-1 block text-sm text-muted">{t(hint)}</span>
            </span>
          </Link>
        ))}
      </div>
      <Link href="/products/new/advanced" className="inline-block text-sm text-muted underline">
        {t("addProduct.advanced")} — {t("addProduct.advancedHint")}
      </Link>
    </div>
  );
}
