"use client";

import { Suspense, useSyncExternalStore, type ReactNode } from "react";
import { AppLogo } from "@/presentation/components/brand/AppLogo";
import { AppLoader } from "@/presentation/components/loader";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

interface AuthPageLayoutProps {
  title?: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthPageLayout({
  title,
  subtitle,
  children,
}: AuthPageLayoutProps) {
  const mounted = useMounted();

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background px-4 py-8"
      suppressHydrationWarning
    >
      <div
        className="panel w-full max-w-md space-y-8 p-8 sm:p-10 border border-border rounded-xl shadow-lg"
        suppressHydrationWarning
      >
        <div
          className="flex flex-col items-center text-center"
          suppressHydrationWarning
        >
          {/* Logo only after client mount so Next/Image SVG renders (avoids SSR/hydration issues on login) */}
          <div className="flex min-h-24 w-full shrink-0 items-center justify-center sm:min-h-28">
            {mounted ? (
              <AppLogo
                showName={true}
                size="auth"
                className="text-foreground"
              />
            ) : (
              <div className="h-24 w-24 shrink-0 rounded-lg bg-mint/10 sm:h-28 sm:w-28" aria-hidden />
            )}
          </div>
          {title && (
            <h1 className="panel-header mt-2 text-2xl tracking-tight text-foreground">
              {title}
            </h1>
          )}
          <p className="page-description mt-2 text-muted-foreground">{subtitle}</p>
        </div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-4">
              <AppLoader fullScreen={false} size="xs" />
            </div>
          }
        >
          {children}
        </Suspense>
      </div>
    </div>
  );
}
