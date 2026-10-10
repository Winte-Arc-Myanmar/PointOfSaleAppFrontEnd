"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/presentation/components/ui/button";
import { loginUrlFor } from "@/lib/login-return";

/** Sessions renew 5 minutes before the end; under 4 left means renewing failed. */
const WARN_WHEN_LEFT_MS = 4 * 60 * 1000;

export function SessionExpiryWarning() {
  const { data: session } = useSession();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const expiresAt = session?.expiresAt;
  if (!expiresAt) return null;
  const left = expiresAt - now;
  if (left > WARN_WHEN_LEFT_MS) return null;

  const minutes = Math.max(0, Math.ceil(left / 60000));
  const signInAgain = () => {
    const here = window.location.pathname + window.location.search;
    void signOut({ callbackUrl: loginUrlFor(here) });
  };

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/40 bg-amber-500/10 px-6 py-2 text-sm text-amber-800 dark:text-amber-200 lg:px-8"
    >
      <span>
        {minutes > 0
          ? `Your session ends in ${minutes} minute${minutes === 1 ? "" : "s"}. Save your work, then sign in again.`
          : "Your session has ended. Sign in again to keep working."}
      </span>
      <Button type="button" size="sm" variant="outline" onClick={signInAgain}>
        Sign in again
      </Button>
    </div>
  );
}
