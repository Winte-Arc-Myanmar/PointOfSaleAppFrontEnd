"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { findPageGroupForPath } from "./sidebar-menu-config";

/** Tabs between pages that share one sidebar link, such as Tables, Zones and Sections. */
export function PageGroupTabs({ pathname }: { pathname: string }) {
  const { canAny } = usePermissions();
  const { t } = useLanguage();
  const group = findPageGroupForPath(pathname);
  const pages = (group?.pages ?? []).filter(
    (page) => !page.permissions?.length || canAny(...page.permissions),
  );
  if (pages.length < 2) return null;

  return (
    <nav aria-label={group ? t(group.labelKey) : undefined} className="mb-6 flex gap-1 border-b border-border">
      {pages.map((page) => {
        const active = pathname === page.href || pathname.startsWith(`${page.href}/`);
        return (
          <Link
            key={page.href}
            href={page.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border-mint text-foreground"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {t(page.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
