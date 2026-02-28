"use client";

import { Suspense, type ReactNode } from "react";

interface AuthPageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthPageLayout({ title, subtitle, children }: AuthPageLayoutProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background px-4"
      suppressHydrationWarning
    >
      <div
        className="w-full max-w-md space-y-8 rounded-xl border border-border bg-background p-8 shadow-lg"
        suppressHydrationWarning
      >
        <div className="text-center" suppressHydrationWarning>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <Suspense
          fallback={
            <div className="h-40 animate-pulse rounded-lg bg-mint/20" />
          }
        >
          {children}
        </Suspense>
      </div>
    </div>
  );
}
