"use client";

import { useLanguage } from "@/presentation/providers/LanguageProvider";

export function ShopSettingsDescription() {
  const { t } = useLanguage();
  return <p className="page-description">{t("shopSettings.description")}</p>;
}
