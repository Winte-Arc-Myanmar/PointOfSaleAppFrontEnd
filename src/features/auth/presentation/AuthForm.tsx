"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { UserType } from "@/core/domain/types/auth";
import { useAuthService } from "@/presentation/hooks/useAuthService";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  branchId: z.string().optional(),
});

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AuthMode = "login" | "register";

export interface AuthFormProps {
  mode: AuthMode;
  /** Optional redirect after login (defaults to callbackUrl search param or /products) */
  callbackUrl?: string;
}

const SPLASH_DURATION_MS = 6000;

export function AuthForm({ mode, callbackUrl }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authService = useAuthService();
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [splashTarget, setSplashTarget] = useState<string | null>(null);

  const navigateAfterSplash = useCallback(() => {
    if (!splashTarget) return;
    router.push(splashTarget);
    router.refresh();
  }, [splashTarget, router]);

  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(navigateAfterSplash, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showSplash, navigateAfterSplash]);

  const isLogin = mode === "login";

  const tenantIdRaw = searchParams.get("tenantId") ?? "";
  const tenantId = tenantIdRaw.replace(/^["']|["']$/g, "").trim();

  const defaultCallbackUrl =
    callbackUrl ?? searchParams.get("callbackUrl") ?? "/products";

  /** Show Branch ID field when tenant link is used (tenant user flow). */
  const isTenantUserFlow = isLogin && tenantId.length > 0;

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", branchId: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function handleLoginSubmit(data: LoginFormData) {
    setError(null);
    const branchIdValue = data.branchId?.trim() || undefined;
    // type = "user" only when both tenantId and branchId are included; else "systemAdmin" (email + password only).
    const type: UserType =
      tenantId.length > 0 && branchIdValue ? "user" : "systemAdmin";

    const credentialsPayload: Record<string, string> = {
      email: data.email,
      password: data.password,
      type,
    };
    if (type === "user") {
      credentialsPayload.tenantId = tenantId;
      credentialsPayload.branchId = branchIdValue!;
    }

    const result = await signIn("credentials", {
      ...credentialsPayload,
      redirect: false,
    });

    if (result?.error) {
      // Backend rejected (e.g. 401) → authorize() returned null → NextAuth sets result.error.
      setError(
        result.status === 401
          ? "Invalid credentials. Check email, password, and Branch ID (required for standard users)."
          : "Sign-in failed. Please try again."
      );
      return;
    }
    if (!result?.ok) {
      setError("Sign-in failed. Please try again.");
      return;
    }
    setSplashTarget(defaultCallbackUrl);
    setShowSplash(true);
  }

  async function handleRegisterSubmit(data: RegisterFormData) {
    setError(null);
    const { name, email, password } = data;
    try {
      await authService.register({ name, email, password });
      // Redirect to login; we don't have tenantId/type for the new user so we can't signIn here.
      router.push("/login?registered=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  if (showSplash) {
    return <AppLoader fullScreen message="Preparing your workspace..." />;
  }

  return (
    <form
      onSubmit={
        isLogin
          ? loginForm.handleSubmit(handleLoginSubmit)
          : registerForm.handleSubmit(handleRegisterSubmit)
      }
      className="space-y-4"
    >
      {isLogin && !tenantId ? (
        <p className="text-xs text-muted">
          Sign in with email and password as System Admin. Use your company link
          for branch login.
        </p>
      ) : null}
      {!isLogin ? (
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            {...registerForm.register("name")}
            placeholder="Your name"
            autoComplete="name"
          />
          {registerForm.formState.errors.name && (
            <p className="text-sm text-red-400">
              {registerForm.formState.errors.name.message}
            </p>
          )}
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...(isLogin
            ? loginForm.register("email")
            : registerForm.register("email"))}
          placeholder="you@example.com"
          autoComplete="email"
        />
        {(isLogin
          ? loginForm.formState.errors.email
          : registerForm.formState.errors.email) && (
          <p className="text-sm text-red-400">
            {
              (isLogin
                ? loginForm.formState.errors.email
                : registerForm.formState.errors.email
              )?.message
            }
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...(isLogin
            ? loginForm.register("password")
            : registerForm.register("password"))}
          placeholder="••••••••"
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
        {(isLogin
          ? loginForm.formState.errors.password
          : registerForm.formState.errors.password) && (
          <p className="text-sm text-red-400">
            {
              (isLogin
                ? loginForm.formState.errors.password
                : registerForm.formState.errors.password
              )?.message
            }
          </p>
        )}
      </div>
      {isLogin && isTenantUserFlow ? (
        <div className="grid gap-2">
          <Label htmlFor="branchId">
            Branch ID <span className="text-muted">(from your company)</span>
          </Label>
          <Input
            id="branchId"
            type="text"
            {...loginForm.register("branchId")}
            placeholder="Branch ID"
            autoComplete="off"
          />
          {loginForm.formState.errors.branchId && (
            <p className="text-sm text-red-400">
              {loginForm.formState.errors.branchId.message}
            </p>
          )}
        </div>
      ) : null}
      {!isLogin ? (
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...registerForm.register("confirmPassword")}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {registerForm.formState.errors.confirmPassword && (
            <p className="text-sm text-red-400">
              {registerForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button
        type="submit"
        className="w-full"
        disabled={
          isLogin
            ? loginForm.formState.isSubmitting
            : registerForm.formState.isSubmitting
        }
      >
        {isLogin
          ? loginForm.formState.isSubmitting
            ? "Signing in..."
            : "Sign in"
          : registerForm.formState.isSubmitting
          ? "Creating account..."
          : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted">
        {isLogin ? (
          "Contact your administrator for an account."
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-mint hover:underline"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
