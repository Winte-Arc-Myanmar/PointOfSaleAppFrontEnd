"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Extra classes on DialogContent */
  className?: string;
  /** Mint header matches FormModal styling */
  headerVariant?: "default" | "mint";
  headerClassName?: string;
  titleClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  /** When true, removes default content padding (p-0 gap-0) */
  flush?: boolean;
  /** Runs close animation before calling onClose */
  animateClose?: boolean;
}

/**
 * Generic modal – use for view/details, pickers, or custom content.
 * For forms with submit/cancel, use FormModal.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "lg",
  className,
  headerVariant = "default",
  headerClassName,
  titleClassName,
  bodyClassName,
  footerClassName,
  flush = false,
  animateClose = false,
}: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    if (animateClose) {
      setIsClosing(true);
      return;
    }
    onClose();
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
        isClosing={animateClose ? isClosing : undefined}
        onExitComplete={animateClose ? handleExitComplete : undefined}
        className={cn(
          flush ? "p-0 gap-0" : "pt-8",
          className
        )}
      >
        <DialogHeader
          className={cn(
            headerVariant === "mint"
              ? "px-6 pt-6 pb-4 border-b border-border bg-mint/5"
              : undefined,
            headerClassName
          )}
        >
          <DialogTitle
            className={cn(
              headerVariant === "mint" &&
                "panel-header text-xl tracking-tight text-foreground",
              titleClassName
            )}
          >
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className={cn(!flush && !bodyClassName && "px-1", bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <DialogFooter
            className={cn(
              flush &&
                "px-6 py-4 border-t border-border/80 bg-background/50 gap-3",
              footerClassName
            )}
          >
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
