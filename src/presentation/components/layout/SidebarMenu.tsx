"use client";

import { useMemo } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  LogOut,
  Building2,
  Users,
  Shield,
  Ruler,
  FolderTree,
  MapPin,
  Warehouse,
  ShieldPlus,
  UserRoundPlus,
  KeyRound,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/presentation/hooks/useMediaQuery";
import { AppLogo } from "@/presentation/components/brand/AppLogo";
import { usePermissions } from "@/presentation/hooks/usePermissions";

interface MenuItem {
  href: string;
  label: string;
  icon: typeof Package;
  permissions?: string[];
  /** Only visible to systemAdmin (ignores permission check). */
  adminOnly?: boolean;
}

const allMenuItems: MenuItem[] = [
  { href: "/products", label: "Products", icon: Package, permissions: ["products:read"] },
  { href: "/tenants", label: "Tenants", icon: Building2, permissions: ["tenants:read"] },
  { href: "/users", label: "Users", icon: Users, permissions: ["users:read"] },
  { href: "/roles", label: "Roles", icon: Shield, permissions: ["roles:read"] },
  { href: "/categories", label: "Categories", icon: FolderTree, permissions: ["categories:read"] },
  { href: "/branches", label: "Branches", icon: MapPin, permissions: ["branches:read"] },
  { href: "/locations", label: "Locations", icon: Warehouse, permissions: ["locations:read"] },
  { href: "/uom", label: "UOM", icon: Ruler, permissions: ["uom:read"] },
];

const adminMenuItems: MenuItem[] = [
  { href: "/admin/onboard", label: "Onboard tenant", icon: ShieldPlus, adminOnly: true },
  { href: "/admin/create-user", label: "Create user", icon: UserRoundPlus, adminOnly: true },
  { href: "/admin/assign-permissions", label: "Assign permissions", icon: KeyRound, adminOnly: true },
  { href: "/admin/assign-role", label: "Assign role", icon: UserCog, adminOnly: true },
];

interface SidebarMenuProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  pathname: string;
}

export function SidebarMenu({
  isOpen,
  isCollapsed,
  onClose,
  pathname,
}: SidebarMenuProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { canAny, isSystemAdmin } = usePermissions();

  const menuItems = useMemo(() => {
    const items = allMenuItems.filter((item) => {
      if (!item.permissions || item.permissions.length === 0) return true;
      return canAny(...item.permissions);
    });
    if (isSystemAdmin) {
      items.push(...adminMenuItems);
    }
    return items;
  }, [canAny, isSystemAdmin]);

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
          width: isCollapsed ? 64 : 288,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col overflow-hidden bg-background shadow-xl lg:static lg:z-auto border-r border-border"
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-mint/20 transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "justify-between px-4"
          )}
        >
          <AppLogo
            href="/products"
            showName={!isCollapsed}
            size={isCollapsed ? "sidebarCollapsed" : "sidebar"}
            onClick={onClose}
            className={cn(
              "text-foreground [&:hover]:text-mint",
              isCollapsed && "justify-center"
            )}
          />
          {!isCollapsed && (
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-mint/10 hover:text-foreground lg:hidden"
              aria-label="Close menu"
            >
              <X className="size-5" strokeWidth={2} />
            </button>
          )}
        </div>

        <nav
          className={cn(
            "flex-1 overflow-y-auto py-6 transition-all duration-300",
            isCollapsed ? "px-2" : "px-3"
          )}
        >
          {!isCollapsed && <p className="section-label mb-3 px-3">Menu</p>}
          <ul className="space-y-0.5">
            {menuItems.map(({ href, label, icon: Icon, adminOnly }, i) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
              const showDivider = adminOnly && i > 0 && !menuItems[i - 1]?.adminOnly;
              return (
                <motion.li
                  key={href}
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isCollapsed ? 0 : i * 0.03 }}
                >
                  {showDivider && !isCollapsed && (
                    <p className="section-label mt-5 mb-3 px-3">System Admin</p>
                  )}
                  <Link
                    href={href}
                    onClick={onClose}
                    title={isCollapsed ? label : undefined}
                    className={cn(
                      "flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                      isCollapsed
                        ? "justify-center px-0 py-2.5"
                        : "gap-3 px-3 py-2.5 pl-3",
                      isActive
                        ? "bg-mint/20 text-foreground shadow-sm border border-mint/30 dark:bg-mint/15 dark:border-mint/20 border-l-2 border-l-mint"
                        : "text-muted hover:bg-mint/10 hover:text-foreground border-l-2 border-l-transparent"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5 shrink-0",
                        isActive ? "text-mint" : "text-muted"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {!isCollapsed && <span>{label}</span>}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        <div
          className={cn(
            "shrink-0 border-t border-border transition-all duration-300",
            isCollapsed ? "p-2" : "p-4"
          )}
        >
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={isCollapsed ? "Sign out" : undefined}
            className={cn(
              "flex w-full items-center rounded-lg text-sm font-medium text-muted transition-colors hover:bg-mint/10 hover:text-foreground",
              isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
            )}
          >
            <LogOut className="size-5 shrink-0 text-muted" strokeWidth={2} />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
