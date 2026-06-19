"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted" />
      <Select
        value={language}
        onValueChange={(v) => setLanguage(v === "my" ? "my" : "en")}
      >
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder={t("common.language")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t("common.english")}</SelectItem>
          <SelectItem value="my">{t("common.myanmar")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

