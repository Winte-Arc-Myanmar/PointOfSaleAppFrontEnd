"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/presentation/hooks/useMediaQuery";
import { AppLogo } from "@/presentation/components/brand/AppLogo";
import { PoweredByWinterArc } from "@/presentation/components/brand/poweredByWinterArcAnimation";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import {
  SIDEBAR_MENU_GROUPS,
  findSidebarGroupForPath,
  type SidebarMenuGroup,
  type SidebarMenuItem,
} from "./sidebar-menu-config";

interface SidebarMenuProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  pathname: string;
  onMenuNavigate?: (href: string) => void;
}

function isItemVisible(
  item: SidebarMenuItem,
  canAny: (...permissions: string[]) => boolean,
  isSystemAdmin: boolean,
): boolean {
  if (item.adminOnly) return isSystemAdmin;
  if (!item.permissions?.length) return true;
  return canAny(...item.permissions);
}

function isRouteActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function SidebarMenu({
  isOpen,
  isCollapsed,
  onClose,
  pathname,
  onMenuNavigate,
}: SidebarMenuProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { canAny, isSystemAdmin } = usePermissions();
  const { t } = useLanguage();
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [collapsedFlyoutGroupId, setCollapsedFlyoutGroupId] = useState<string | null>(
    null,
  );

  const visibleGroups = useMemo(() => {
    return SIDEBAR_MENU_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        isItemVisible(item, canAny, isSystemAdmin),
      ),
    })).filter((group) => group.items.length > 0);
  }, [canAny, isSystemAdmin]);

  useEffect(() => {
    const activeGroupId = findSidebarGroupForPath(pathname);
    if (!activeGroupId) return;
    setOpenGroups((current) => ({ ...current, [activeGroupId]: true }));
  }, [pathname]);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [pathname, visibleGroups.length]);

  useEffect(() => {
    if (!isCollapsed) setCollapsedFlyoutGroupId(null);
  }, [isCollapsed]);

  function toggleGroup(groupId: string) {
    setOpenGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }));
  }

  function handleNavigate(href: string) {
    onMenuNavigate?.(href);
    onClose();
    setCollapsedFlyoutGroupId(null);
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-gloss-black/70 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : isOpen ? 0 : "-100%",
          width: isCollapsed ? 64 : 264,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col overflow-hidden border-r border-gray-300 bg-white shadow-sm dark:border-border dark:bg-background dark:shadow-xl lg:static lg:z-auto",
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-gray-300 transition-all duration-300 dark:border-mint/20",
            isCollapsed ? "justify-center px-0" : "justify-between px-4",
          )}
        >
          <AppLogo
            href="/products"
            showName={!isCollapsed}
            size={isCollapsed ? "sidebarCollapsed" : "sidebar"}
            onClick={onClose}
            className={cn(
              "text-gray-900 [&:hover]:text-mint dark:text-foreground",
              isCollapsed && "justify-center",
            )}
          />
          {!isCollapsed && (
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-[#54e3a1]/12 hover:text-[#177a55] dark:text-muted dark:hover:bg-mint/10 dark:hover:text-foreground lg:hidden"
              aria-label={t("common.close")}
            >
              <X className="size-5" strokeWidth={2} />
            </button>
          )}
        </div>

        <nav
          className={cn(
            "hide-scrollbar flex-1 overflow-y-auto py-4 transition-all duration-300",
            isCollapsed ? "px-2" : "px-3",
          )}
        >
          {!isCollapsed && (
            <p className="section-label mb-3 px-3">{t("common.menu")}</p>
          )}
          <ul className="space-y-1">
            {visibleGroups.map((group) =>
              isCollapsed ? (
                <CollapsedGroupButton
                  key={group.id}
                  group={group}
                  pathname={pathname}
                  isFlyoutOpen={collapsedFlyoutGroupId === group.id}
                  onToggleFlyout={() =>
                    setCollapsedFlyoutGroupId((current) =>
                      current === group.id ? null : group.id,
                    )
                  }
                  onNavigate={handleNavigate}
                  t={t}
                />
              ) : (
                <ExpandedGroup
                  key={group.id}
                  group={group}
                  pathname={pathname}
                  isOpen={Boolean(openGroups[group.id])}
                  onToggle={() => toggleGroup(group.id)}
                  onNavigate={handleNavigate}
                  activeItemRef={activeItemRef}
                  t={t}
                />
              ),
            )}
          </ul>
        </nav>

        <div
          className={cn(
            "shrink-0 border-t border-border transition-all duration-300",
            isCollapsed ? "p-2" : "space-y-3 p-4",
          )}
        >
          {!isCollapsed ? (
            <PoweredByWinterArc variant="compact" className="pb-1" />
          ) : (
            <PoweredByWinterArc
              variant="compact"
              className="pb-1 [&_.powered-by-winter-arc-text]:sr-only"
            />
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={isCollapsed ? t("common.signOut") : undefined}
            className={cn(
              "group flex w-full items-center rounded-lg text-sm font-medium text-gray-700 transition-colors hover:bg-[#54e3a1]/10 hover:text-[#177a55] dark:text-muted dark:hover:bg-mint/10 dark:hover:text-foreground",
              isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
            )}
          >
            <LogOut
              className="size-5 shrink-0 text-gray-700 transition-colors group-hover:text-[#2bc787] dark:text-muted"
              strokeWidth={2}
            />
            {!isCollapsed && <span>{t("common.signOut")}</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function ExpandedGroup({
  group,
  pathname,
  isOpen,
  onToggle,
  onNavigate,
  activeItemRef,
  t,
}: {
  group: SidebarMenuGroup & { items: SidebarMenuItem[] };
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (href: string) => void;
  activeItemRef: RefObject<HTMLAnchorElement | null>;
  t: (key: import("@/presentation/i18n/translations").TranslationKey) => string;
}) {
  const GroupIcon = group.icon;
  const groupActive = group.items.some((item) => isRouteActive(pathname, item.href));

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors",
          groupActive
            ? "bg-mint/10 text-[#177a55] dark:text-foreground"
            : "text-gray-800 hover:bg-mint/5 dark:text-foreground dark:hover:bg-mint/10",
        )}
        aria-expanded={isOpen}
      >
        <GroupIcon className="size-4 shrink-0" strokeWidth={2} />
        <span className="min-w-0 flex-1 truncate">{t(group.labelKey)}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = isRouteActive(pathname, item.href);
              const label = t(item.labelKey);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    ref={isActive ? activeItemRef : null}
                    onClick={() => onNavigate(item.href)}
                    className={cn(
                      "group ml-2 flex items-center gap-3 rounded-lg py-2 pl-4 pr-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "border-l-2 border-l-mint bg-mint/12 text-[#177a55] dark:text-foreground"
                        : "border-l-2 border-l-transparent text-gray-700 hover:bg-mint/10 hover:text-[#177a55] dark:text-muted dark:hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        isActive
                          ? "text-[#2bc787] dark:text-mint"
                          : "text-gray-600 group-hover:text-[#2bc787] dark:text-muted",
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function CollapsedGroupButton({
  group,
  pathname,
  isFlyoutOpen,
  onToggleFlyout,
  onNavigate,
  t,
}: {
  group: SidebarMenuGroup & { items: SidebarMenuItem[] };
  pathname: string;
  isFlyoutOpen: boolean;
  onToggleFlyout: () => void;
  onNavigate: (href: string) => void;
  t: (key: import("@/presentation/i18n/translations").TranslationKey) => string;
}) {
  const GroupIcon = group.icon;
  const groupActive = group.items.some((item) => isRouteActive(pathname, item.href));

  return (
    <li className="relative">
      <button
        type="button"
        title={t(group.labelKey)}
        onClick={onToggleFlyout}
        className={cn(
          "flex w-full items-center justify-center rounded-lg py-2.5 transition-colors",
          groupActive || isFlyoutOpen
            ? "bg-mint/15 text-[#177a55] dark:text-mint"
            : "text-gray-700 hover:bg-mint/10 dark:text-muted",
        )}
        aria-expanded={isFlyoutOpen}
      >
        <GroupIcon className="size-5" strokeWidth={2} />
      </button>
      <AnimatePresence>
        {isFlyoutOpen ? (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            className="absolute left-full top-0 z-50 ml-2 w-56 rounded-xl border border-border bg-background p-2 shadow-xl"
          >
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {t(group.labelKey)}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isRouteActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => onNavigate(item.href)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                        isActive
                          ? "bg-mint/12 text-[#177a55] dark:text-foreground"
                          : "text-gray-700 hover:bg-mint/10 dark:text-muted",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{t(item.labelKey)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}
