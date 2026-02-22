"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/presentation/hooks/useMediaQuery";

const menuItems = [
  { href: "/products", label: "Products", icon: Package },
] as const;

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

  return (
    <>
      {/* Backdrop overlay - mobile only */}
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
      {/* Sidebar */}
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
        {/* Brand header */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-mint/20 transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "justify-between px-5"
          )}
        >
          <Link
            href="/products"
            onClick={onClose}
            className={cn(
              "flex items-center font-semibold tracking-tight text-foreground transition-colors hover:text-mint",
              isCollapsed ? "justify-center" : "gap-2"
            )}
          >
            {isCollapsed ? (
              <span className="text-lg font-bold text-mint">V</span>
            ) : (
              <span className="text-lg">Vision AI POS</span>
            )}
          </Link>
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

        {/* Navigation */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto py-6 transition-all duration-300",
            isCollapsed ? "px-2" : "px-3"
          )}
        >
          {!isCollapsed && (
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
              Menu
            </p>
          )}
          <ul className="space-y-0.5">
            {menuItems.map(({ href, label, icon: Icon }, i) => {
              const isActive = pathname === href;
              return (
                <motion.li
                  key={href}
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isCollapsed ? 0 : i * 0.03 }}
                >
                  <Link
                    href={href}
                    onClick={onClose}
                    title={isCollapsed ? label : undefined}
                    className={cn(
                      "flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                      isCollapsed
                        ? "justify-center px-0 py-2.5"
                        : "gap-3 px-3 py-2.5",
                      isActive
                        ? "bg-mint/20 text-foreground shadow-sm border border-mint/30 dark:bg-mint/15 dark:border-mint/20"
                        : "text-muted hover:bg-mint/10 hover:text-foreground"
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

        {/* Footer - Sign out */}
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
            <LogOut
              className="size-5 shrink-0 text-muted"
              strokeWidth={2}
            />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
