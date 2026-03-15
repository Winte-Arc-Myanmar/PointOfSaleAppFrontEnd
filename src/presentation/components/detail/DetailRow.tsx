"use client";

import { cn } from "@/lib/utils";

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

export function DetailRow({ label, value, mono }: DetailRowProps) {
  return (
    <div className="py-2 border-b border-border/60 last:border-0">
      <dt className="text-xs font-medium text-muted uppercase tracking-wider">{label}</dt>
      <dd className={cn("mt-0.5 text-sm text-foreground", mono && "font-mono text-xs")}>{value}</dd>
    </div>
  );
}
