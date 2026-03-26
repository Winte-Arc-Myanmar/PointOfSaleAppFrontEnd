"use client";

import { cn } from "@/lib/utils";

interface DetailSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

export function DetailSection({ title, icon: Icon, children, className }: DetailSectionProps) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
        <Icon className="h-4 w-4 text-mint" />
        {title}
      </h2>
      {children}
    </section>
  );
}
