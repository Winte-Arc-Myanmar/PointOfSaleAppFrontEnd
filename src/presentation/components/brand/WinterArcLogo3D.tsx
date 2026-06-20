"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { WinterArcSnowflakeIcon } from "@/presentation/components/brand/WinterArcSnowflakeIcon";

export interface WinterArcLogo3DProps {
  size?: number;
  className?: string;
}

export function WinterArcLogo3D({ size = 48, className }: WinterArcLogo3DProps) {
  return (
    <div
      className={cn("winter-arc-logo-3d relative", className)}
      style={{ width: size, height: size, perspective: size * 4 }}
      aria-hidden
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateY: [0, 360],
          rotateX: [8, -8, 8],
        }}
        transition={{
          rotateY: { duration: 10, repeat: Infinity, ease: "linear" },
          rotateX: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full winter-arc-logo-glow"
          style={{ transform: "translateZ(-12px)", filter: "blur(8px)" }}
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.92, 1.06, 0.92] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center winter-arc-logo-image"
          style={{ transform: "translateZ(16px)" }}
        >
          <WinterArcSnowflakeIcon />
        </div>
        <div
          className="absolute inset-[10%] rounded-full border-2 border-sky-800/35 dark:border-sky-200/30"
          style={{ transform: "rotateX(72deg) translateZ(8px)" }}
        />
      </motion.div>
    </div>
  );
}
