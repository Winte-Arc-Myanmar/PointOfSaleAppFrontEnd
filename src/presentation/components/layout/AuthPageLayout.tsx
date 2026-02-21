"use client";

import { Suspense, type ReactNode } from "react";

interface AuthPageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthPageLayout({ title, subtitle, children }: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gloss-black px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-mint/30 bg-gloss-black p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-matte-white">{title}</h1>
          <p className="mt-1 text-sm text-matte-white/80">{subtitle}</p>
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
