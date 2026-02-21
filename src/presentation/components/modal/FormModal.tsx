"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/components/ui/dialog";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/lib/utils";

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Form body (inputs, etc.). When formId is set, this should be a <form id={formId}> so the footer submit triggers it. */
  formContent: ReactNode;
  /** When set, no wrapper form is used; footer submit button uses type="submit" form={formId}. Use for forms that manage their own submit (e.g. react-hook-form). */
  formId?: string;
  onSubmit?: () => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  loadingText?: string;
  isLoading?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

/**
 * Generic form modal – title, form content, submit/cancel buttons, loading state.
 * Use for create/edit forms (e.g. create product, edit debt).
 */
export function FormModal({
  isOpen,
  onClose,
  title,
  formContent,
  formId,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  loadingText = "Saving...",
  isLoading = false,
  maxWidth = "lg",
  className,
}: FormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.();
  };

  const useExternalForm = Boolean(formId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth={maxWidth} className={cn("pt-8", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {useExternalForm ? (
          <>
            <div className="space-y-6">{formContent}</div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                type="submit"
                form={formId}
                disabled={isLoading}
              >
                {isLoading ? loadingText : submitText}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>{formContent}</div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? loadingText : submitText}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
