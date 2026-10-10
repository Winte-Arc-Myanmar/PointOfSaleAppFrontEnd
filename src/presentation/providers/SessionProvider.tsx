"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function SessionProvider({ children }: { children: ReactNode }) {
  // Checking the session now and then is also what renews it while the page sits idle.
  return (
    <NextAuthSessionProvider refetchInterval={4 * 60}>{children}</NextAuthSessionProvider>
  );
}
