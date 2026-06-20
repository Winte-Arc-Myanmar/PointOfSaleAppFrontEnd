"use client";

import { cn } from "@/lib/utils";
import { WinterArcLogo3D } from "./WinterArcLogo3D";
import "./poweredByWinterArcAnimation.css";

const WINTER_ARC_URL = "https://winterarc.asia/";

export interface PoweredByWinterArcProps {
  variant?: "footer" | "compact" | "auth";
  className?: string;
}

const VARIANT_CONFIG = {
  footer: {
    logoSize: 44,
    textClass: "text-xs sm:text-sm",
    gap: "gap-2.5",
  },
  compact: {
    logoSize: 28,
    textClass: "text-[10px] leading-tight",
    gap: "gap-1.5",
  },
  auth: {
    logoSize: 44,
    textClass: "text-xs",
    gap: "gap-2",
  },
} as const;

export function PoweredByWinterArc({
  variant = "footer",
  className,
}: PoweredByWinterArcProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <a
      href={WINTER_ARC_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex flex-col items-center justify-center select-none rounded-xl transition-opacity hover:opacity-90 active:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        config.gap,
        className
      )}
      aria-label="Powered by Winter Arc Myanmar — visit winterarc.asia"
    >
      <WinterArcLogo3D size={config.logoSize} />
      <span
        className={cn(
          "powered-by-winter-arc-text block text-center font-medium tracking-wide text-gray-700 group-hover:text-gray-900 dark:text-muted dark:group-hover:text-foreground/80",
          config.textClass
        )}
      >
        <span className="powered-by-winter-arc-prefix">Powered by </span>
        <span className="powered-by-winter-arc-brand">Winter Arc Myanmar</span>
      </span>
    </a>
  );
}
