"use client";

import { cn } from "@/lib/utils";

interface WinterArcSnowflakeIconProps {
  className?: string;
}

/** Inline snowflake so light/dark colors apply reliably (external SVG img breaks gradients). */
export function WinterArcSnowflakeIcon({ className }: WinterArcSnowflakeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden="true"
      className={cn(
        "h-full w-full text-sky-900 dark:text-sky-100",
        "drop-shadow-[0_2px_6px_rgba(2,132,199,0.5)] dark:drop-shadow-[0_1px_0_rgba(255,255,255,0.15)]",
        className
      )}
    >
      <g
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="translate(256 256)">
          <g id="winter-arc-arm">
            <path d="M0 -8 L0 -168" />
            <path d="M0 -48 L-28 -68" />
            <path d="M0 -48 L28 -68" />
            <path d="M0 -96 L-22 -112" />
            <path d="M0 -96 L22 -112" />
            <path d="M0 -136 L-16 -148" />
            <path d="M0 -136 L16 -148" />
          </g>
          <use href="#winter-arc-arm" transform="rotate(60)" />
          <use href="#winter-arc-arm" transform="rotate(120)" />
          <use href="#winter-arc-arm" transform="rotate(180)" />
          <use href="#winter-arc-arm" transform="rotate(240)" />
          <use href="#winter-arc-arm" transform="rotate(300)" />
        </g>
      </g>
      <g fill="currentColor">
        <g transform="translate(256 256)">
          <circle cx="0" cy="-168" r="12" />
          <circle cx="0" cy="0" r="16" />
        </g>
      </g>
    </svg>
  );
}
