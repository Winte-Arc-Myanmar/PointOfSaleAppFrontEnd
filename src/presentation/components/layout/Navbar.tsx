"use client";

import { motion } from "framer-motion";
import { Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/presentation/components/theme/ThemeToggle";

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
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-sm lg:px-6",
        className
      )}
    >
      <motion.button
        type="button"
        onClick={onMenuToggle}
        className="flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-mint/10 active:bg-mint/20 lg:hidden"
        aria-label="Open menu"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="size-6" strokeWidth={2} />
      </motion.button>
      <motion.button
        type="button"
        onClick={onCollapseToggle}
        className="hidden size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-mint/10 active:bg-mint/20 lg:flex"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
          className="truncate text-base font-semibold text-foreground lg:text-lg"
        >
          {title}
        </motion.h1>
      )}
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
