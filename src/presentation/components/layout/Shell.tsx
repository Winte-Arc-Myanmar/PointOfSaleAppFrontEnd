"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { SidebarMenu } from "./SidebarMenu";
import { Navbar } from "./Navbar";

const routeTitles: Record<string, string> = {
  "/products": "Products",
  "/tenants": "Tenants",
  "/users": "Users",
  "/categories": "Categories",
  "/branches": "Branches",
  "/locations": "Locations",
  "/inventory-ledger": "Inventory ledger",
  "/uom": "UOM",
  "/roles": "Roles",
  "/admin/onboard": "Onboard tenant",
  "/admin/create-user": "Create user",
  "/admin/assign-permissions": "Assign permissions",
  "/admin/assign-role": "Assign role",
};

function getTitle(pathname: string): string {
  if (pathname.startsWith("/tenants/") && pathname.endsWith("/edit"))
    return "Edit tenant";
  if (pathname.startsWith("/tenants/")) return "Tenant";
  if (pathname.startsWith("/categories/") && pathname.endsWith("/edit"))
    return "Edit category";
  if (pathname.startsWith("/categories/")) return "Category";
  if (pathname.startsWith("/branches/") && pathname.endsWith("/edit"))
    return "Edit branch";
  if (pathname.startsWith("/branches/")) return "Branch";
  if (pathname.startsWith("/locations/") && pathname.endsWith("/edit"))
    return "Edit location";
  if (pathname.startsWith("/locations/")) return "Location";
  if (pathname.startsWith("/inventory-ledger/")) return "Ledger entry";
  if (pathname.startsWith("/uom-classes/") && pathname.endsWith("/edit"))
    return "Edit UOM class";
  if (pathname.startsWith("/uom-classes/")) return "UOM class";
  if (pathname.startsWith("/uoms/") && pathname.endsWith("/edit"))
    return "Edit UOM";
  if (pathname.startsWith("/uoms/")) return "UOM";
  if (pathname.startsWith("/users/") && pathname.endsWith("/edit"))
    return "Edit user";
  if (pathname.startsWith("/users/")) return "User";
  if (pathname.startsWith("/roles/") && pathname.endsWith("/edit"))
    return "Edit role";
  if (pathname.startsWith("/roles/")) return "Role";
  if (pathname.startsWith("/products/") && pathname.endsWith("/edit"))
    return "Edit product";
  if (pathname.startsWith("/products/")) return "Product";
  return routeTitles[pathname] ?? "";
}

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const title = getTitle(pathname);

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
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-auto max-w-6xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
