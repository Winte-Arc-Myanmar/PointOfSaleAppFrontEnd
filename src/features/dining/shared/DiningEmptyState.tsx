"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/lib/utils";

interface DiningEmptyStateAction {
  label: string;
  onClick: () => void;
}

interface DiningEmptyStateLinkAction {
  label: string;
  href: string;
}

interface DiningEmptyStateProps {
  icon: ElementType;
  title: string;
  description?: string;
  action?: DiningEmptyStateAction;
  linkAction?: DiningEmptyStateLinkAction;
  className?: string;
  compact?: boolean;
}

export function DiningEmptyState({
  icon: Icon,
  title,
  description,
  action,
  linkAction,
  className,
  compact = false,
}: DiningEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-4 py-6" : "gap-3 px-6 py-10",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted/50 text-muted",
          compact ? "size-10" : "size-12"
        )}
      >
        <Icon className={compact ? "size-5" : "size-6"} />
      </div>
      <div className="max-w-sm space-y-1">
        <p className={cn("font-medium text-foreground", compact ? "text-sm" : "text-base")}>
          {title}
        </p>
        {description && (
          <p className={cn("text-muted", compact ? "text-xs" : "text-sm")}>{description}</p>
        )}
      </div>
      {(action || linkAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {action && (
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {linkAction && (
            <Link href={linkAction.href}>
              <Button size="sm" variant={action ? "outline" : "default"}>
                {linkAction.label}
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
