/**
 * Login page - SSR shell, client form.
 */

import { Suspense } from "react";
import { LoginForm } from "@/features/auth/presentation/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Winterarc POS
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to continue
          </p>
        </div>
        <Suspense fallback={<div className="h-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
