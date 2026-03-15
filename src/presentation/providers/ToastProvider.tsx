"use client";

import * as React from "react";
import {
  ToastProvider as RadixToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/presentation/components/ui/toast";
import { X } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

export type ToastVariant = "default" | "success" | "error" | "warning";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title?: string;
  description: string;
}

export interface ToastApi {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  message: (message: string, title?: string) => void;
}

const ToastContext = React.createContext<ToastApi | null>(null);

const TOAST_DURATION = 5000;

export function useToast(): ToastApi {
  const api = React.useContext(ToastContext);
  if (!api) throw new Error("useToast must be used within ToastProvider");
  return api;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = React.useCallback(
    (variant: ToastVariant, description: string, title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [
        ...prev,
        { id, variant, title, description },
      ]);
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const api = React.useMemo<ToastApi>(
    () => ({
      success: (description, title) =>
        addToast("success", description, title ?? "Success"),
      error: (description, title) =>
        addToast("error", description, title ?? "Error"),
      warning: (description, title) =>
        addToast("warning", description, title ?? "Warning"),
      message: (description, title) =>
        addToast("default", description, title),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={api}>
      <RadixToastProvider duration={TOAST_DURATION} label="Notifications">
        {children}
        <ToastViewport />
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            defaultOpen
            onOpenChange={(open) => {
              if (!open) removeToast(t.id);
            }}
          >
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            <ToastDescription>{t.description}</ToastDescription>
            <ToastClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </ToastClose>
          </Toast>
        ))}
      </RadixToastProvider>
    </ToastContext.Provider>
  );
}
