"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { AppLoader } from "@/presentation/components/loader";
import { cn } from "@/lib/utils";

export function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted">{title}</h4>
      {children}
    </div>
  );
}

export function ReportPanel({
  title,
  description,
  isLoading,
  isFetching,
  error,
  onRetry,
  children,
}: {
  title: string;
  description?: string;
  isLoading: boolean;
  isFetching?: boolean;
  error: unknown;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  const showSoftFetch = Boolean(isFetching && !isLoading);

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="section-label">{title}</h3>
          {description ? <p className="text-sm text-muted">{description}</p> : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRetry}
          disabled={isFetching}
        >
          <RefreshCw className={cn("h-4 w-4", showSoftFetch && "animate-spin")} />
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <AppLoader />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive">Failed to load {title.toLowerCase()}.</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : (
        <div className={cn("space-y-6", showSoftFetch && "opacity-70 transition-opacity")}>
          {children}
        </div>
      )}
    </section>
  );
}
