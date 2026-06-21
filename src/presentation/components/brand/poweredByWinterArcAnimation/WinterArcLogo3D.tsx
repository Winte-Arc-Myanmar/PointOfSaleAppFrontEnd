"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { WinterArcSnowflakeIcon } from "./WinterArcSnowflakeIcon";
import { WinterArcSnowfall } from "./WinterArcSnowfall";

export interface WinterArcLogo3DProps {
  size?: number;
  className?: string;
}

/** Organic tumble keyframes — uneven timing mimics a floating ice crystal. */
const TUMBLE = {
  rotateX: [14, -8, 6, -12, 10, -6, 14],
  rotateY: [0, 28, -22, 38, -16, 24, 0],
  rotateZ: [-5, 3, -2, 4, -3, 2, -5],
  y: [0, -4, 1, -3, 2, -2, 0],
  scale: [1, 1.03, 0.98, 1.02, 0.99, 1.01, 1],
};

const SHADOW = {
  scaleX: [1, 0.82, 0.94, 0.78, 0.9, 0.85, 1],
  opacity: [0.32, 0.18, 0.26, 0.14, 0.24, 0.2, 0.32],
};

const GLOW = {
  opacity: [0.35, 0.72, 0.42, 0.68, 0.38, 0.6, 0.35],
  scale: [0.88, 1.08, 0.92, 1.05, 0.9, 1.02, 0.88],
};

const SHIMMER_SWEEP = {
  x: ["-130%", "130%"],
};

const BREEZE_SWAY = {
  x: [0, 5, -4, 6, -3, 4, 0],
};

export function WinterArcLogo3D({ size = 48, className }: WinterArcLogo3DProps) {
  const reduceMotion = useReducedMotion();
  const depth = Math.max(12, Math.round(size * 0.35));
  const frameH = size + Math.round(size * 0.12);

  if (reduceMotion) {
    return (
      <div
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <div className="winter-arc-logo-image flex h-[88%] w-[88%] items-center justify-center">
          <WinterArcSnowflakeIcon />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("winter-arc-logo-3d relative flex items-end justify-center", className)}
      style={{
        width: Math.round(size * 1.85),
        height: Math.round(size * 1.55),
      }}
      aria-hidden
    >
      <WinterArcSnowfall size={size} />

      <motion.div
        className="relative z-10"
        style={{ width: size, height: frameH, perspective: size * 5 }}
        animate={BREEZE_SWAY}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.18, 0.36, 0.54, 0.72, 0.88, 1],
        }}
      >
        {/* Ground shadow — scales with tilt for depth cue */}
        <motion.div
          className="pointer-events-none absolute bottom-0 left-1/2 h-[18%] w-[72%] -translate-x-1/2 rounded-[50%] bg-sky-800/40 blur-[6px] dark:bg-sky-300/15"
          animate={SHADOW}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.18, 0.35, 0.52, 0.68, 0.84, 1],
          }}
        />

        <motion.div
          className="absolute inset-x-0 top-0"
          style={{ height: size, transformStyle: "preserve-3d" }}
          animate={TUMBLE}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.16, 0.32, 0.5, 0.66, 0.82, 1],
          }}
        >
          {/* Ambient ice glow behind crystal */}
          <motion.div
            className="absolute inset-[8%] rounded-full winter-arc-logo-glow"
            style={{
              transform: `translateZ(${-depth}px)`,
              filter: "blur(10px)",
            }}
            animate={GLOW}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.16, 0.32, 0.5, 0.66, 0.82, 1],
            }}
          />

          {/* Back facet — faint mirrored crystal */}
          <div
            className="absolute inset-[6%] opacity-[0.22] dark:opacity-[0.18]"
            style={{
              transform: `translateZ(${-depth * 0.6}px) rotateY(180deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <WinterArcSnowflakeIcon />
          </div>

          {/* Orbital ring — subtle 3D halo */}
          <motion.div
            className="absolute inset-[4%] rounded-full border border-sky-700/45 dark:border-sky-200/20"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateX: [72, 88, 68, 82, 72], rotateZ: [0, 120, 240, 360] }}
            transition={{
              rotateX: { duration: 9, repeat: Infinity, ease: "easeInOut" },
              rotateZ: { duration: 18, repeat: Infinity, ease: "linear" },
            }}
          />

          {/* Front crystal face */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full winter-arc-logo-image"
            style={{
              transform: `translateZ(${depth}px)`,
              transformStyle: "preserve-3d",
            }}
            animate={{ rotateZ: [0, -360] }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="relative h-[88%] w-[88%]">
              <WinterArcSnowflakeIcon />
              {/* Specular sweep — ice catching light */}
              <motion.div
                className="pointer-events-none absolute inset-0 winter-arc-logo-shimmer"
                animate={SHIMMER_SWEEP}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 2.2,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
