"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import "./loli-prompts.css";

const PROMPT_QUESTIONS = [
  "How do I check out an order?",
  "Where do I receive stock (GRN)?",
  "How do I create a staff user?",
  "Which report should I print at close?",
  "How do I process a refund?",
  "Where are purchase orders?",
];

/** Questions that fit the page open; the first match wins. */
const PAGE_QUESTIONS: Array<{ paths: string[]; questions: string[] }> = [
  {
    paths: ["/checkout", "/counter-orders", "/sales-orders", "/refunds"],
    questions: ["How do I check out an order?", "How do I process a refund?"],
  },
  {
    paths: ["/inventory-ledger", "/goods-received-notes", "/purchase-orders", "/purchase-requisitions", "/vendors"],
    questions: ["Where do I receive stock (GRN)?", "Where are purchase orders?"],
  },
  { paths: ["/users", "/roles"], questions: ["How do I create a staff user?"] },
  { paths: ["/reports", "/dashboard", "/pos-sessions"], questions: ["Which report should I print at close?"] },
  { paths: ["/tenants", "/admin"], questions: ["How do I add a new shop?", "How do I reset a shop's data?"] },
];

function questionsFor(pathname: string): string[] {
  const match = PAGE_QUESTIONS.find(({ paths }) =>
    paths.some((path) => pathname === path || pathname.startsWith(`${path}/`)),
  );
  return match?.questions ?? PROMPT_QUESTIONS;
}

const ROTATE_MS = 4200;

export function LoliQuestionPrompts({
  onSelect,
  onDismiss,
}: {
  onSelect: (question: string) => void;
  onDismiss: () => void;
}) {
  const questions = questionsFor(usePathname());
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => current + 1);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const question = questions[index % questions.length];

  return (
    <div
      className="loli-prompt"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.button
          key={question}
          type="button"
          initial={{ opacity: 0, y: 8, x: 6 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -6, x: 6 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="loli-prompt__bubble"
          onClick={() => onSelect(question)}
        >
          <span className="loli-prompt__label">Ask Loli</span>
          {question}
        </motion.button>
      </AnimatePresence>
      <button
        type="button"
        onClick={onDismiss}
        className="pointer-events-auto absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-muted shadow-sm hover:text-foreground"
        aria-label="Hide tips"
        title="Hide tips"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export { PROMPT_QUESTIONS };
