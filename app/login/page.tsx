/**
 * Login page - SSR shell, client form.
 */

import { Suspense } from "react";
import { LoginForm } from "@/features/auth/presentation/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gloss-black">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-mint/30 bg-gloss-black p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-matte-white">
            Vision AI POS
          </h1>
          <p className="mt-1 text-sm text-matte-white/80">
            Sign in to continue
          </p>
        </div>
        <Suspense fallback={<div className="h-40 animate-pulse rounded bg-mint/20" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
