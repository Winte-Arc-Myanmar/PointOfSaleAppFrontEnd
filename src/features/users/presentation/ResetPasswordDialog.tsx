"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Modal } from "@/presentation/components/modal/Modal";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { useUpdateUser } from "@/presentation/hooks/useUsers";
import { useToast } from "@/presentation/providers/ToastProvider";
import { getHttpErrorMessage } from "@/lib/http-error";
import type { AppUser } from "@/core/domain/entities/AppUser";

const MIN_LENGTH = 8;
const MAX_LENGTH = 20;

/** Sets a new password for a staff member who forgot theirs; there is no email reset. */
export function ResetPasswordDialog({
  user,
  onClose,
}: {
  user: AppUser | null;
  onClose: () => void;
}) {
  const update = useUpdateUser();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [shown, setShown] = useState(false);
  const [touched, setTouched] = useState(false);

  const tooShort = password.length < MIN_LENGTH || password.length > MAX_LENGTH;
  const mismatch = password !== repeat;
  const problem = tooShort
    ? `Use ${MIN_LENGTH} to ${MAX_LENGTH} characters.`
    : mismatch
      ? "The two passwords don't match."
      : null;

  const close = () => {
    setPassword("");
    setRepeat("");
    setShown(false);
    setTouched(false);
    onClose();
  };

  const save = () => {
    setTouched(true);
    if (!user || problem) return;
    update.mutate(
      { id: String(user.id), data: { password } },
      {
        onSuccess: () => {
          toast.success(`New password set for ${user.fullName || user.username}. Give it to them in person.`);
          close();
        },
        onError: (error) => toast.error(getHttpErrorMessage(error, "Couldn't set the password.")),
      },
    );
  };

  return (
    <Modal
      isOpen={!!user}
      onClose={close}
      title="Reset password"
      description={
        user ? (
          <>
            Set a new password for <strong>{user.fullName || user.username}</strong>
            {user.username ? ` (${user.username})` : ""}. Their old password stops working.
          </>
        ) : undefined
      }
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Set password"}
          </Button>
        </div>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="reset-password">New password</Label>
          <div className="relative">
            <Input
              id="reset-password"
              type={shown ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder={`${MIN_LENGTH} to ${MAX_LENGTH} characters`}
              className="pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShown((value) => !value)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-foreground"
              aria-label={shown ? "Hide password" : "Show password"}
            >
              {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="reset-password-repeat">Repeat it</Label>
          <Input
            id="reset-password-repeat"
            type={shown ? "text" : "password"}
            value={repeat}
            onChange={(event) => setRepeat(event.target.value)}
            autoComplete="new-password"
          />
        </div>
        {touched && problem ? <p className="text-sm text-red-500">{problem}</p> : null}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
