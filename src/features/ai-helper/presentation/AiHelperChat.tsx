"use client";

import { useMemo, useRef, useState } from "react";
import { Loader2, Minus, Send, WifiOff, X } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/lib/utils";
import type { AgentMessage } from "@/core/domain/entities/AiAgent";
import { useToast } from "@/presentation/providers/ToastProvider";
import {
  useAiHelperStatus,
  useAiHelperTurn,
  visibleChatMessages,
} from "@/presentation/hooks/useAiHelper";
import { LoliAvatar } from "./LoliAvatar";

const SUGGESTIONS = [
  "How do I check out an order?",
  "Where do I receive stock (GRN)?",
  "How do I create a staff user?",
];

export function AiHelperChat() {
  const [open, setOpen] = useState(false);
  const statusQuery = useAiHelperStatus(open);
  const turn = useAiHelperTurn();
  const toast = useToast();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const connection = statusQuery.data;
  const visible = useMemo(() => visibleChatMessages(messages), [messages]);
  const busy = turn.isPending;

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setDraft("");
    try {
      const result = await turn.mutateAsync({ messages, userContent: content });
      setMessages(result.messages);
    } catch {
      toast.error("Loli could not complete that request.");
    }
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="pointer-events-auto flex h-[min(70vh,520px)] w-[min(calc(100vw-2rem),380px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <LoliAvatar size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Loli</p>
                <ConnectionBadge
                  loading={statusQuery.isLoading}
                  state={connection?.state}
                />
              </div>
            </div>
            <div className="flex shrink-0">
              <button
                type="button"
                className="rounded-md p-1.5 text-muted hover:bg-muted/20 hover:text-foreground"
                onClick={() => setOpen(false)}
                aria-label="Minimize helper"
              >
                <Minus className="size-4" />
              </button>
              <button
                type="button"
                className="rounded-md p-1.5 text-muted hover:bg-muted/20 hover:text-foreground"
                onClick={() => {
                  setOpen(false);
                  setMessages([]);
                  setDraft("");
                }}
                aria-label="Close helper"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {visible.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted">
                  Hi, I&apos;m Loli, your customer service agent. Ask me how to
                  use checkout, stock, users, or reports.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="rounded-full border border-border bg-background px-2.5 py-1 text-left text-[11px] hover:bg-mint/10"
                      onClick={() => void send(suggestion)}
                      disabled={busy}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              visible.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    message.role === "user"
                      ? "ml-auto bg-mint text-white dark:text-gloss-black"
                      : "bg-muted/40 text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ))
            )}
            {busy ? (
              <p className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="size-4 animate-spin" />
                Thinking...
              </p>
            ) : null}
          </div>

          <form
            className="flex items-end gap-2 border-t border-border p-2.5"
            onSubmit={(event) => {
              event.preventDefault();
              void send(draft);
            }}
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(draft);
                }
              }}
              rows={2}
              placeholder="Ask Loli..."
              disabled={busy}
              className="min-h-12 w-full resize-none rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint dark:border-border dark:bg-background dark:text-foreground dark:placeholder:text-muted"
            />
            <Button type="submit" size="icon" disabled={busy || !draft.trim()}>
              <Send className="size-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        className="pointer-events-auto rounded-full bg-transparent p-0"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Hide Loli" : "Open Loli"}
        aria-expanded={open}
      >
        <LoliAvatar size="lg" />
      </button>
    </div>
  );
}

function ConnectionBadge({
  loading,
  state,
}: {
  loading: boolean;
  state?: string;
}) {
  if (loading) {
    return <p className="text-[11px] text-muted">Checking connection...</p>;
  }
  if (state === "ready") {
    return <p className="text-[11px] text-mint">Connected</p>;
  }
  return (
    <p className="inline-flex items-center gap-1 text-[11px] text-muted">
      <WifiOff className="size-3" />
      {state === "error" ? "Connection error" : "Not connected yet"}
    </p>
  );
}
