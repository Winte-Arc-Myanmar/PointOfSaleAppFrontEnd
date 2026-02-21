"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import container from "@/core/infrastructure/di/container";
import type { IAuthService } from "@/core/domain/services/IAuthService";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
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
/** Data passed to onSubmit for register (no confirmPassword) */
export type RegisterSubmitData = Omit<RegisterFormData, "confirmPassword">;

export type AuthMode = "login" | "register";

const schemas = { login: loginSchema, register: registerSchema } as const;

export interface AuthFormProps {
  mode: AuthMode;
  /** Optional redirect after login (defaults to callbackUrl search param or /products) */
  callbackUrl?: string;
}

export function AuthForm({ mode, callbackUrl }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const schema = schemas[mode];
  const isLogin = mode === "login";
  const defaultCallbackUrl =
    callbackUrl ?? searchParams.get("callbackUrl") ?? "/products";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: isLogin
      ? { email: "", password: "" }
      : { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function handleFormSubmit(data: LoginFormData | RegisterFormData) {
    setError(null);
    if (isLogin) {
      const result = await signIn("credentials", {
        email: (data as LoginFormData).email,
        password: (data as LoginFormData).password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
        return;
      }
      router.push(defaultCallbackUrl);
      router.refresh();
      return;
    }
    const { name, email, password } = data as RegisterFormData;
    const registerData = { name, email, password };
    try {
      const authService = container.resolve<IAuthService>("authService");
      await authService.register(registerData);
      const result = await signIn("credentials", {
        email: registerData.email,
        password: registerData.password,
        redirect: false,
      });
      if (result?.ok) {
        router.push("/products");
        router.refresh();
      } else {
        router.push("/login?registered=1");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  const submitLabel = isLogin ? "Sign in" : "Create account";
  const loadingLabel = isLogin ? "Signing in..." : "Creating account...";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {!isLogin && (
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            {...register("name")}
            placeholder="Your name"
            autoComplete="name"
          />
          {(errors as Record<string, { message?: string }>).name && (
            <p className="text-sm text-red-400">
              {(errors as Record<string, { message?: string }>).name?.message}
            </p>
          )}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="you@example.com"
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          placeholder="••••••••"
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
        {errors.password && (
          <p className="text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>
      {!isLogin && (
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {(errors as Record<string, { message?: string }>).confirmPassword && (
            <p className="text-sm text-red-400">
              {
                (errors as Record<string, { message?: string }>).confirmPassword
                  ?.message
              }
            </p>
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? loadingLabel : submitLabel}
      </Button>
      <p className="text-center text-sm text-matte-white/70">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-mint hover:underline"
            >
              Sign up
            </Link>
          </>
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
