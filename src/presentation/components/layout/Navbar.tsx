"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Menu, PanelLeftClose, PanelLeft, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/presentation/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/presentation/components/language/LanguageSwitcher";
import { useLanguage } from "@/presentation/providers/LanguageProvider";

interface NavbarProps {
  onMenuToggle: () => void;
  onCollapseToggle?: () => void;
  isCollapsed?: boolean;
  title?: string;
  className?: string;
}

export function Navbar({
  onMenuToggle,
  onCollapseToggle,
  isCollapsed = false,
  title,
  className,
}: NavbarProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const user = session?.user;
  const displayName = user?.name ?? user?.email ?? null;

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-gray-300 bg-white/95 px-4 backdrop-blur-sm dark:border-border dark:bg-background/95 lg:px-6",
        className
      )}
    >
      <motion.button
        type="button"
        onClick={onMenuToggle}
        className="flex size-10 items-center justify-center rounded-lg text-gray-900 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-foreground dark:hover:bg-mint/10 dark:active:bg-mint/20 lg:hidden"
        aria-label={t("common.openMenu")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="size-6" strokeWidth={2} />
      </motion.button>
      <motion.button
        type="button"
        onClick={onCollapseToggle}
        className="hidden size-10 items-center justify-center rounded-lg text-gray-900 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-foreground dark:hover:bg-mint/10 dark:active:bg-mint/20 lg:flex"
        aria-label={
          isCollapsed ? t("common.expandSidebar") : t("common.collapseSidebar")
        }
      >
        {isCollapsed ? (
          <PanelLeft className="size-5" strokeWidth={2} />
        ) : (
          <PanelLeftClose className="size-5" strokeWidth={2} />
        )}
      </motion.button>

      {title && (
        <motion.h1
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="panel-header truncate text-base tracking-tight text-foreground lg:text-lg"
        >
          {title}
        </motion.h1>
      )}
      <div className="ml-auto flex items-center gap-3">
        <LanguageSwitcher />
        {displayName && (
          <div className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm text-gray-900 dark:border-transparent dark:bg-mint/10 dark:text-foreground sm:flex">
            <User className="size-4 shrink-0 text-[#2bc787] dark:text-mint" />
            <span className="max-w-40 truncate" title={displayName}>
              {displayName}
            </span>
          </div>
        )}
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
