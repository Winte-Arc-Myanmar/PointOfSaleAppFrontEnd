"use client";

import { cn } from "@/lib/utils";

interface SplitColorTextProps {
  text: string;
  className?: string;
}

export function SplitColorText({ text, className }: SplitColorTextProps) {
  return (
    <span
      className={cn("split-color-text whitespace-nowrap select-none", className)}
      aria-label={text}
    >
      {text}
    </span>
  );
}
