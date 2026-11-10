"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Modal } from "@/presentation/components/modal/Modal";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { useChangeOwnPassword } from "@/presentation/hooks/usePasswords";
import { useToast } from "@/presentation/providers/ToastProvider";
import { getHttpErrorMessage } from "@/lib/http-error";

const MIN_LENGTH = 8;
const MAX_LENGTH = 20;

/** The signed-in person changes their own password; the current one must be right. */
export function ChangePasswordDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const change = useChangeOwnPassword();
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [shown, setShown] = useState(false);
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const problem = !current
    ? "Enter your current password."
    : password.length < MIN_LENGTH || password.length > MAX_LENGTH
      ? `Use ${MIN_LENGTH} to ${MAX_LENGTH} characters for the new password.`
      : password === current
        ? "The new password must be different from the current one."
        : password !== repeat
          ? "The two new passwords don't match."
          : null;

  const close = () => {
    setCurrent("");
    setPassword("");
    setRepeat("");
    setShown(false);
    setTouched(false);
    setServerError(null);
    onClose();
  };

  const save = () => {
    setTouched(true);
    setServerError(null);
    if (problem) return;
    change.mutate(
      { currentPassword: current, newPassword: password },
      {
        onSuccess: () => {
          toast.success("Password changed. Use the new one next time you sign in.");
          close();
        },
        onError: (error) =>
          setServerError(getHttpErrorMessage(error, "Couldn't change the password.")),
      },
    );
  };

  const field = (
    id: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    autoComplete: string,
    toggle = false,
  ) => (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className={toggle ? "pr-10" : undefined}
          autoFocus={id === "current-password"}
        />
        {toggle ? (
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-foreground"
            aria-label={shown ? "Hide passwords" : "Show passwords"}
          >
            {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={close}
      title="Change password"
      description="Enter your current password, then the new one twice."
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={change.isPending}>
            {change.isPending ? "Saving..." : "Change password"}
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
        {field("current-password", "Current password", current, setCurrent, "current-password", true)}
        {field("new-password", "New password", password, setPassword, "new-password")}
        {field("new-password-repeat", "Repeat new password", repeat, setRepeat, "new-password")}
        <p className="text-xs text-muted">
          {MIN_LENGTH} to {MAX_LENGTH} characters.
        </p>
        {touched && problem ? <p className="text-sm text-red-500">{problem}</p> : null}
        {serverError ? <p className="text-sm text-red-500">{serverError}</p> : null}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
