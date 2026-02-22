"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { SidebarMenu } from "./SidebarMenu";
import { Navbar } from "./Navbar";

const routeTitles: Record<string, string> = {
  "/products": "Products",
};

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const title = routeTitles[pathname] ?? "";

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarMenu
        isOpen={menuOpen}
        isCollapsed={isCollapsed}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar
          onMenuToggle={() => setMenuOpen(true)}
          onCollapseToggle={() => setIsCollapsed((c) => !c)}
          isCollapsed={isCollapsed}
          title={title}
        />
        <main className="flex-1 p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-6xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
