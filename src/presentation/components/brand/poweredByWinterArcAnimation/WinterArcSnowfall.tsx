"use client";

import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type SnowVariant = "speck" | "flake" | "crystal";

interface SnowflakeParticle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  blur: number;
  sway: number;
  rotate: number;
  variant: SnowVariant;
  pattern: 1 | 2;
}

/** Deterministic pseudo-random values — stable across renders. */
function seed(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function buildSnowflakes(count: number): SnowflakeParticle[] {
  return Array.from({ length: count }, (_, i) => {
    const r = seed(i, 1);
    const r2 = seed(i, 2);
    const r3 = seed(i, 3);
    const r4 = seed(i, 4);

    const variantRoll = r3;
    const variant: SnowVariant =
      variantRoll < 0.45 ? "speck" : variantRoll < 0.82 ? "flake" : "crystal";

    const depth = 0.35 + r * 0.65;
    const size =
      variant === "speck"
        ? 1 + r2 * 1.2
        : variant === "flake"
          ? 2 + r2 * 2.2
          : 2.8 + r2 * 2.5;

    return {
      id: i,
      left: 4 + r * 92,
      size,
      delay: r2 * 3.2,
      duration: 2.8 + (1 - depth) * 2.4 + r4 * 1.6,
      opacity: 0.25 + depth * 0.55,
      blur: variant === "speck" ? 0.4 + r * 1.2 : variant === "flake" ? r * 0.6 : 0,
      sway: -14 + r2 * 28,
      rotate: 120 + r3 * 420,
      variant,
      pattern: r4 > 0.5 ? 2 : 1,
    };
  });
}

function particleCountForSize(size: number): number {
  if (size <= 30) return 14;
  if (size <= 44) return 20;
  return 26;
}

export interface WinterArcSnowfallProps {
  size: number;
  className?: string;
}

/** Falling snow + soft breeze around the logo. */
export function WinterArcSnowfall({ size, className }: WinterArcSnowfallProps) {
  const reduceMotion = useReducedMotion();
  const count = particleCountForSize(size);
  const snowflakes = useMemo(() => buildSnowflakes(count), [count]);

  if (reduceMotion) return null;

  const spreadW = Math.round(size * 1.95);
  const spreadH = Math.round(size * 2.35);

  return (
    <div
      className={cn(
        "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[50%] overflow-visible",
        className
      )}
      style={{ width: spreadW, height: spreadH }}
      aria-hidden
    >
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <span className="winter-arc-breeze winter-arc-breeze-1" />
        <span className="winter-arc-breeze winter-arc-breeze-2" />
        <span className="winter-arc-breeze winter-arc-breeze-3" />
      </div>

      <div
        className="winter-arc-snow-field absolute inset-0"
        style={{ ["--snow-fall-height" as string]: `${spreadH}px` }}
      >
        {snowflakes.map((flake) => (
          <span
            key={flake.id}
            className={cn(
              "winter-arc-snowflake",
              `winter-arc-snowflake--${flake.variant}`,
              flake.pattern === 2
                ? "winter-arc-snowflake--pattern-b"
                : "winter-arc-snowflake--pattern-a"
            )}
            style={{
              left: `${flake.left}%`,
              width: flake.size,
              height: flake.size,
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
              filter: flake.blur > 0 ? `blur(${flake.blur}px)` : undefined,
              ["--snow-opacity" as string]: String(flake.opacity),
              ["--snow-sway" as string]: `${flake.sway}px`,
              ["--snow-rotate" as string]: `${flake.rotate}deg`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
