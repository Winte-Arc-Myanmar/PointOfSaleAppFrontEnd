"use client";

import { useRef, useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import container from "@/core/infrastructure/di/container";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";
import { apiErrorMessage } from "@/lib/api-error";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";

export type ApprovalPermission = "guestcard:refund:approve" | "guestcard:adjustment:approve";

type Pending = {
  permission: ApprovalPermission;
  what: string;
  resolve: (token: string | null) => void;
};

/**
 * Asks a manager to sign in with their own User ID and password, the same as on
 * the POS. `approve` resolves with a 5-minute approval for that one action, or
 * null if they cancel. Render `approvalDialog` once in the component.
 */
export function useManagerApproval() {
  const [pending, setPending] = useState<Pending | null>(null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pendingRef = useRef<Pending | null>(null);

  const close = (token: string | null) => {
    pendingRef.current?.resolve(token);
    pendingRef.current = null;
    setPending(null);
    setPassword("");
    setError(null);
  };

  const approve = (permission: ApprovalPermission, what: string) =>
    new Promise<string | null>((resolve) => {
      pendingRef.current?.resolve(null);
      const next = { permission, what, resolve };
      pendingRef.current = next;
      setPending(next);
    });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!pending || !userId.trim() || !password) return;
    setBusy(true);
    setError(null);
    try {
      const http = container.resolve<HttpClient>("httpClient");
      const result = await http.post<{ approval_token: string }>(API_ENDPOINTS.AUTH.APPROVE, {
        userId: userId.trim(),
        password,
        permission: pending.permission,
      });
      close(result.approval_token);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't get the manager's approval."));
    } finally {
      setBusy(false);
    }
  };

  const approvalDialog = (
    <Dialog open={pending !== null} onOpenChange={(open) => (open ? null : close(null))}>
      <DialogContent>
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-mint" />
              Manager approval
            </DialogTitle>
            <DialogDescription>
              {pending?.what} needs a manager. They sign in here with their own User ID and password. It approves this
              one action only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="approver-user-id">Manager User ID</Label>
            <Input
              id="approver-user-id"
              autoComplete="off"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="approver-password">Password</Label>
            <Input
              id="approver-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(null)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !userId.trim() || !password}>
              {busy ? "Checking..." : "Approve"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return { approve, approvalDialog };
}
