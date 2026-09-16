"use client";

import { useEffect, useRef, useState } from "react";
import { Nfc } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { useCardReader } from "@/presentation/hooks/useCardReader";
import { cn } from "@/lib/utils";

export function CardUidField({
  id,
  value,
  onChange,
  placeholder = "04A3B2C1",
  disabled,
  className,
  onScanned,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onScanned?: (uid: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [armed, setArmed] = useState(false);
  const { nfcSupported, isNfcListening, error, startNfc, stopNfc } = useCardReader({
    enabled: !disabled,
    listenKeyboardWedge: armed,
    onRead: ({ uid }) => {
      onChange(uid);
      setArmed(false);
      stopNfc();
      onScanned?.(uid);
    },
  });

  useEffect(() => {
    if (!armed) return;
    const timeout = window.setTimeout(() => {
      setArmed(false);
      stopNfc();
    }, 20000);
    return () => window.clearTimeout(timeout);
  }, [armed, stopNfc]);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            const uid = e.currentTarget.value.trim();
            if (!uid) return;
            onScanned?.(uid);
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="font-mono"
        />
        <Button
          type="button"
          variant={armed || isNfcListening ? "default" : "outline"}
          disabled={disabled}
          title={
            nfcSupported
              ? "Tap an NFC card or USB reader"
              : "USB readers type into this field after Read. NFC needs Chrome on Android."
          }
          onClick={() => {
            setArmed(true);
            inputRef.current?.focus();
            void startNfc();
          }}
        >
          <Nfc className="size-4" />
          {armed || isNfcListening ? "Listening" : "Read"}
        </Button>
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      {!error && (armed || isNfcListening) ? (
        <p className="text-xs text-muted">
          Tap the card on NFC or a USB reader now.
        </p>
      ) : null}
    </div>
  );
}
