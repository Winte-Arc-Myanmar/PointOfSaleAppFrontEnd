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
        className="panel w-full max-w-md space-y-8 p-8 border border-border"
        suppressHydrationWarning
      >
        <div className="text-center" suppressHydrationWarning>
          <h1 className="panel-header text-2xl tracking-tight text-foreground">
            {title}
          </h1>
          <p className="page-description mt-2">{subtitle}</p>
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
