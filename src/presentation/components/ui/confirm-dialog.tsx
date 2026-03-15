"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/components/ui/dialog";
import { Button } from "@/presentation/components/ui/button";
import { motion } from "framer-motion";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}

export interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const contentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.2, ease: "easeOut" as const },
  }),
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const isDestructive = variant === "destructive";
  const Icon = isDestructive ? AlertTriangle : HelpCircle;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        maxWidth="md"
        showClose={true}
        className="max-w-[min(28rem,92vw)] w-full min-w-0 overflow-hidden p-5"
      >
        <div className="flex min-w-0 flex-col gap-5 overflow-hidden">
          <DialogHeader className="flex min-w-0 flex-row items-start gap-4 border-0 pb-0 overflow-hidden">
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate={open ? "visible" : "hidden"}
              custom={0}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                isDestructive
                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                  : "bg-mint/20 text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </motion.div>
            <div className="min-w-0 flex-1 space-y-1.5 overflow-hidden">
              <DialogTitle className="panel-header text-lg tracking-tight text-foreground wrap-break-word pr-12">
                {title}
              </DialogTitle>
              <div className="max-h-48 min-w-0 overflow-y-auto overflow-x-hidden">
                <p className="text-sm text-muted leading-relaxed wrap-break-word">
                  {description}
                </p>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="border-t border-border/80 pt-4 gap-2 flex-row flex-wrap min-w-0">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="min-w-20 flex-1 overflow-hidden"
            >
              <span className="block truncate">{cancelLabel}</span>
            </Button>
            <Button
              type="button"
              variant={isDestructive ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={isLoading}
              className="min-w-20 flex-1 overflow-hidden"
            >
              <span className="block truncate">{isLoading ? "..." : confirmLabel}</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
