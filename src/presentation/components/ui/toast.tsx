"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

const ToastProvider = ToastPrimitive.Provider;
const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 right-0 z-100 flex max-h-dvh w-full flex-col gap-3 p-4 sm:max-w-100 overflow-hidden",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const variantIcons = {
  default: Info,
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
};

const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & {
    variant?: "default" | "success" | "error" | "warning";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const Icon = variantIcons[variant];
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "pointer-events-auto w-full min-w-0 max-w-full border border-border bg-background text-foreground shadow-lg rounded-xl p-4 overflow-hidden",
        "toast-root",
        variant === "success" && "border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/5",
        variant === "error" && "border-red-500/40 bg-red-500/10 dark:bg-red-500/5",
        variant === "warning" && "border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/5",
        className
      )}
      {...props}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            variant === "success" && "text-emerald-600 dark:text-emerald-400",
            variant === "error" && "text-red-600 dark:text-red-400",
            variant === "warning" && "text-amber-600 dark:text-amber-400",
            variant === "default" && "text-muted"
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1 pt-0.5 pr-8">
          {props.children}
        </div>
      </div>
    </ToastPrimitive.Root>
  );
});
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn(
      "text-sm font-semibold leading-tight text-foreground wrap-break-word",
      className
    )}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-muted leading-snug wrap-break-word max-h-24 overflow-y-auto mt-0.5",
      className
    )}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

const ToastClose = ToastPrimitive.Close;

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose };
