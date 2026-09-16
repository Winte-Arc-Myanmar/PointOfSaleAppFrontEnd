"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import onScan from "onscan.js";
import { isLikelyCardUid, normalizeCardUid } from "@/lib/card-uid";

export type CardReadSource = "nfc" | "reader";

export interface CardReadResult {
  uid: string;
  source: CardReadSource;
}

function isNfcSupported(): boolean {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

function uidFromNdefEvent(event: NDEFReadingEvent): string | null {
  const serial = normalizeCardUid(event.serialNumber ?? "");
  if (isLikelyCardUid(serial)) return serial;

  for (const record of event.message?.records ?? []) {
    if (record.recordType !== "text" || !record.data) continue;
    try {
      const decoder = new TextDecoder(record.encoding ?? "utf-8");
      const text = normalizeCardUid(decoder.decode(record.data));
      if (isLikelyCardUid(text)) return text;
    } catch {
      // Ignore unreadable NDEF records and keep using serialNumber.
    }
  }
  return serial || null;
}

export function useCardReader({
  enabled = true,
  listenKeyboardWedge = false,
  onRead,
}: {
  enabled?: boolean;
  listenKeyboardWedge?: boolean;
  onRead?: (result: CardReadResult) => void;
} = {}) {
  const [nfcSupported] = useState(isNfcSupported);
  const [isNfcListening, setIsNfcListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onReadRef = useRef(onRead);
  const nfcAbortRef = useRef<AbortController | null>(null);
  onReadRef.current = onRead;

  const emit = useCallback((uid: string, source: CardReadSource) => {
    const normalized = normalizeCardUid(uid);
    if (!isLikelyCardUid(normalized)) return;
    onReadRef.current?.({ uid: normalized, source });
  }, []);

  useEffect(() => {
    if (!enabled || !listenKeyboardWedge || typeof document === "undefined") {
      return;
    }
    if (onScan.isAttachedTo(document)) {
      onScan.detachFrom(document);
    }
    onScan.attachTo(document, {
      suffixKeyCodes: [13],
      minLength: 4,
      avgTimeByChar: 40,
      reactToPaste: false,
      ignoreIfFocusOn: false,
      onScan: (code) => emit(code, "reader"),
    });
    return () => {
      if (onScan.isAttachedTo(document)) {
        onScan.detachFrom(document);
      }
    };
  }, [enabled, listenKeyboardWedge, emit]);

  const stopNfc = useCallback(() => {
    nfcAbortRef.current?.abort();
    nfcAbortRef.current = null;
    setIsNfcListening(false);
  }, []);

  const startNfc = useCallback(async () => {
    if (!nfcSupported) {
      setError(
        "NFC is not available in this browser. Use Chrome on Android, or a USB card reader.",
      );
      return false;
    }
    setError(null);
    nfcAbortRef.current?.abort();
    const abort = new AbortController();
    nfcAbortRef.current = abort;
    try {
      const reader = new NDEFReader();
      await reader.scan({ signal: abort.signal });
      setIsNfcListening(true);
      reader.onreading = (event) => {
        const uid = uidFromNdefEvent(event);
        if (uid) emit(uid, "nfc");
      };
      reader.onreadingerror = () => {
        setError("Could not read that tag. Try tapping again.");
      };
      return true;
    } catch (err) {
      if (abort.signal.aborted) {
        setIsNfcListening(false);
        return false;
      }
      const message =
        err instanceof Error ? err.message : "NFC scan was blocked or failed.";
      setError(message);
      setIsNfcListening(false);
      return false;
    }
  }, [emit, nfcSupported]);

  useEffect(
    () => () => {
      nfcAbortRef.current?.abort();
    },
    [],
  );

  return {
    nfcSupported,
    isNfcListening,
    error,
    startNfc,
    stopNfc,
  };
}
