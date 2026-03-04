"use client";

import { useState, type ReactNode } from "react";
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
 * Form modal.
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
  const [isClosing, setIsClosing] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) setIsClosing(true);
  };

  const handleExitComplete = () => {
    onClose();
    setIsClosing(false);
  };

  return (
    <Dialog
      open={isOpen || isClosing}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        maxWidth={maxWidth}
        className={cn("p-0 gap-0", className)}
        isClosing={isClosing}
        onExitComplete={handleExitComplete}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/80 bg-mint/5">
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        {useExternalForm ? (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
              <div className="space-y-5">{formContent}</div>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-border/80 bg-background/50 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
                className="min-w-[4.5rem]"
              >
                {cancelText}
              </Button>
              <Button
                type="submit"
                form={formId}
                disabled={isLoading}
                className="min-w-[4.5rem] bg-mint text-gloss-black hover:bg-mint-hover"
              >
                {isLoading ? loadingText : submitText}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
              <div className="space-y-5">{formContent}</div>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-border/80 bg-background/50 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
                className="min-w-[4.5rem]"
              >
                {cancelText}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[4.5rem] bg-mint text-gloss-black hover:bg-mint-hover"
              >
                {isLoading ? loadingText : submitText}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
