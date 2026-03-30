"use client";

import { ChevronRight, Warehouse } from "lucide-react";
import type { LocationTreeNode } from "@/core/domain/entities/Location";
import { AppLoader } from "@/presentation/components/loader";

function TreeBranch({ node, depth }: { node: LocationTreeNode; depth: number }) {
  const subs = node.subLocations ?? [];
  return (
    <li className="select-none">
      <div
        className="flex items-center gap-2 py-1 text-sm"
        style={{ paddingLeft: `${depth * 14}px` }}
      >
        {subs.length > 0 ? (
          <ChevronRight className="size-3.5 shrink-0 text-muted" aria-hidden />
        ) : (
          <span className="inline-block w-3.5 shrink-0" aria-hidden />
        )}
        <Warehouse className="size-3.5 shrink-0 text-mint" aria-hidden />
        <span className="font-medium text-foreground">{node.name}</span>
        <span className="text-xs capitalize text-muted">({node.type})</span>
      </div>
      {subs.length > 0 ? (
        <ul className="border-l border-border/60 ml-[9px]">
          {subs.map((child) => (
            <TreeBranch key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

interface LocationTreePanelProps {
  roots: LocationTreeNode[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function LocationTreePanel({
  roots,
  isLoading,
  error,
  onRetry,
}: LocationTreePanelProps) {
  if (isLoading) {
    return (
      <div className="panel flex min-h-32 items-center justify-center rounded-xl border border-border bg-background/60">
        <AppLoader fullScreen={false} size="sm" message="Loading hierarchy..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
        <p className="text-destructive">Could not load location tree.</p>
        {onRetry ? (
          <button
            type="button"
            className="mt-2 text-xs font-medium text-mint hover:underline"
            onClick={onRetry}
          >
            Retry
          </button>
        ) : null}
      </div>
    );
  }
  if (roots.length === 0) {
    return (
      <p className="text-sm text-muted">
        No locations in tree yet. Create a location above, then open this page again to
        see the hierarchy.
      </p>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 max-h-[320px] overflow-y-auto">
      <ul className="space-y-0">
        {roots.map((root) => (
          <TreeBranch key={root.id} node={root} depth={0} />
        ))}
      </ul>
    </div>
  );
}
