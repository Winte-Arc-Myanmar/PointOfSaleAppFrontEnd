"use client";

import { useState } from "react";
import { Info } from "lucide-react";

/** An ⓘ beside a label (safe inside a button or choice card): the one-sentence explanation shows on hover, focus or tap. */
export function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex align-middle">
      <span
        role="button"
        tabIndex={0}
        aria-label={text}
        className="ml-1 inline-flex cursor-help text-muted hover:text-foreground focus:text-foreground focus:outline-none"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Info className="h-3.5 w-3.5" />
      </span>
      {open ? (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-1 w-56 -translate-x-1/2 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-foreground shadow-lg"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
