"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/presentation/components/ui/button";

export function NoAccessNotice() {
  return (
    <div className="space-y-4 text-sm">
      <p>
        You are signed in, but your account has no permission to open any page of the
        dashboard at this branch.
      </p>
      <p className="text-muted">
        Ask the owner or a manager to give your User ID a role at this branch, then
        sign in again.
      </p>
      <Button type="button" className="w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
        Sign out
      </Button>
    </div>
  );
}
