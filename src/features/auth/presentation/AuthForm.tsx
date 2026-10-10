"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { safeReturnPath } from "@/lib/login-return";
import type { UserType } from "@/core/domain/types/auth";
import { useAuthService } from "@/presentation/hooks/useAuthService";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";
import { useToast } from "@/presentation/providers/ToastProvider";

const loginSchema = z.object({
  login: z.string().trim().min(1, "User ID is required"),
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
  /** Optional redirect after login (defaults to callbackUrl search param or /dashboard) */
  callbackUrl?: string;
}

const SPLASH_DURATION_MS = 6000;

export function AuthForm({ mode, callbackUrl }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authService = useAuthService();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
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

  const defaultCallbackUrl = safeReturnPath(
    callbackUrl ?? searchParams.get("callbackUrl"),
  );
  const sessionEnded = isLogin && searchParams.get("reason") === "expired";
  const [showPassword, setShowPassword] = useState(false);

  /** Show Branch ID field when tenant link is used (tenant user flow). */
  const isTenantUserFlow = isLogin && tenantId.length > 0;

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", password: "", branchId: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function handleLoginSubmit(data: LoginFormData) {
    setError(null);
    const branchIdValue = data.branchId?.trim() || undefined;
    const type: UserType = data.login.includes("@") ? "systemAdmin" : "user";

    const credentialsPayload: Record<string, string> = {
      login: data.login,
      password: data.password,
      type,
    };
    if (type === "user") {
      if (tenantId) credentialsPayload.tenantId = tenantId;
      if (branchIdValue) credentialsPayload.branchId = branchIdValue;
    }

    const result = await signIn("credentials", {
      ...credentialsPayload,
      redirect: false,
    });

    if (result?.error) {
      // Backend rejected (e.g. 401) → authorize() returned null → NextAuth sets result.error.
      setError(
        result.status === 401
          ? "Invalid credentials. Check your User ID and password."
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
      toast.success("Account created. You can sign in.");
      // Redirect to login; we don't have tenantId/type for the new user so we can't signIn here.
      router.push("/login?registered=1");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
      toast.error(msg);
    }
  }

  if (showSplash) {
    return <AppLoader fullScreen message="Preparing your workspace..." />;
  }

  return (
    <form
      method="post"
      onSubmit={
        isLogin
          ? loginForm.handleSubmit(handleLoginSubmit)
          : registerForm.handleSubmit(handleRegisterSubmit)
      }
      className="space-y-4"
    >
      {sessionEnded ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
          Your session ended. Sign in again to go back to where you were.
        </p>
      ) : null}
      {isLogin ? (
        <p className="text-sm text-muted">
          Sign in with your User ID (e.g. SHW0001). System admins use their
          email.
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
      {isLogin ? (
        <div className="grid gap-2">
          <Label htmlFor="login">User ID</Label>
          <Input
            id="login"
            type="text"
            {...loginForm.register("login")}
            placeholder="SHW0001"
            autoComplete="username"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
          {loginForm.formState.errors.login && (
            <p className="text-sm text-red-400">
              {loginForm.formState.errors.login.message}
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...registerForm.register("email")}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {registerForm.formState.errors.email && (
            <p className="text-sm text-red-400">
              {registerForm.formState.errors.email.message}
            </p>
          )}
        </div>
      )}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {isLogin ? (
            <button
              type="button"
              onClick={() => setForgotOpen((open) => !open)}
              className="text-sm text-mint hover:underline"
              aria-expanded={forgotOpen}
            >
              Forgot password?
            </button>
          ) : null}
        </div>
        {isLogin && forgotOpen ? (
          <p className="rounded-lg border border-border bg-muted/10 px-3 py-2 text-sm text-muted">
            Ask your manager to set a new one: in the admin, Users → the ⋯ menu next to
            your name → <strong>Reset password</strong>. System admins: contact Winter Arc
            support.
          </p>
        ) : null}
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...(isLogin
              ? loginForm.register("password")
              : registerForm.register("password"))}
            placeholder="Enter your password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
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
            placeholder="Repeat the password"
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
