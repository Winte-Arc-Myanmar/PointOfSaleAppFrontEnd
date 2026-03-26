"use client";

import * as React from "react";
import { ConfirmDialog } from "@/presentation/components/ui/confirm-dialog";

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
}

const ConfirmContext = React.createContext<
  ((options: ConfirmOptions) => Promise<boolean>) | null
>(null);

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  const confirmFn = React.useContext(ConfirmContext);
  if (!confirmFn)
    throw new Error("useConfirm must be used within ConfirmProvider");
  return confirmFn;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ConfirmState | null>(null);
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({ ...options, open: true });
    });
  }, []);

  const handleClose = React.useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setState((s) => (s ? { ...s, open: false } : null));
  }, []);

  const handleConfirm = React.useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setState((s) => (s ? { ...s, open: false } : null));
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state?.open && (
        <ConfirmDialog
          open={state.open}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={state.title}
          description={state.description}
          confirmLabel={state.confirmLabel}
          cancelLabel={state.cancelLabel}
          variant={state.variant}
        />
      )}
    </ConfirmContext.Provider>
  );
}
