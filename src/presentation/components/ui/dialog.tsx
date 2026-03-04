"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-gloss-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
    showClose?: boolean;
    /** When true, runs close animation then calls onExitComplete. */
    isClosing?: boolean;
    onExitComplete?: () => void;
  }
>(({ className, children, maxWidth = "lg", showClose = true, isClosing = false, onExitComplete, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content asChild ref={ref} {...props}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={
          isClosing
            ? { opacity: 0, scale: 0.95 }
            : { opacity: 1, scale: 1 }
        }
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onAnimationComplete={() => {
          if (isClosing) onExitComplete?.();
        }}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-0 rounded-2xl border border-border bg-background shadow-2xl shadow-gloss-black/20 overflow-hidden flex flex-col",
          maxWidth === "sm" && "max-w-sm",
          maxWidth === "md" && "max-w-md",
          maxWidth === "lg" && "max-w-lg",
          maxWidth === "xl" && "max-w-xl",
          maxWidth === "2xl" && "max-w-2xl",
          className
        )}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-muted opacity-80 transition-all hover:opacity-100 hover:bg-mint/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </motion.div>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left shrink-0",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 shrink-0",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight text-foreground", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
