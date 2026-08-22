"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./loli-prompts.css";

const PROMPT_QUESTIONS = [
  "How do I check out an order?",
  "Where do I receive stock (GRN)?",
  "How do I create a staff user?",
  "Which report should I print at close?",
  "How do I process a refund?",
  "Where are purchase orders?",
];

const ROTATE_MS = 4200;

export function LoliQuestionPrompts({
  onSelect,
}: {
  onSelect: (question: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % PROMPT_QUESTIONS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const question = PROMPT_QUESTIONS[index];

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
      <div className="loli-prompt__dots" aria-hidden="true">
        {PROMPT_QUESTIONS.map((item, dotIndex) => (
          <span
            key={item}
            className={
              dotIndex === index
                ? "loli-prompt__dot loli-prompt__dot--active"
                : "loli-prompt__dot"
            }
          />
        ))}
      </div>
    </div>
  );
}

export { PROMPT_QUESTIONS };
