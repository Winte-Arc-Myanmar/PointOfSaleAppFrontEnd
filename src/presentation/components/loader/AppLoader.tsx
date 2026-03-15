"use client";

import { motion, type Easing } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { APP_NAME } from "@/presentation/components/brand/AppLogo";

type LoaderSize = "xs" | "sm" | "md" | "lg";

interface AppLoaderProps {
  showName?: boolean;
  fullScreen?: boolean;
  message?: string;
  /** xs = button/inline, sm = card/modal, md = section, lg = full-page (default) */
  size?: LoaderSize;
}

const LOGO_SRC = "/logo.svg";

const SIZE_MAP = {
  xs: { logo: 24, imgClass: "h-6 w-6", ring0: 40, ringStep: 10, glow: 30, dotSize: "h-1 w-1", dotGap: "gap-1", py: "py-2", mt: "mt-2", textClass: "text-[10px]", msgClass: "text-[10px] mt-1", showRings: false, showGhost: false, showShimmer: true },
  sm: { logo: 40, imgClass: "h-10 w-10", ring0: 64, ringStep: 16, glow: 50, dotSize: "h-1.5 w-1.5", dotGap: "gap-1.5", py: "py-6", mt: "mt-3", textClass: "text-xs font-semibold", msgClass: "text-xs mt-2", showRings: true, showGhost: true, showShimmer: true },
  md: { logo: 64, imgClass: "h-16 w-16", ring0: 100, ringStep: 24, glow: 76, dotSize: "h-1.5 w-1.5", dotGap: "gap-1.5", py: "py-10", mt: "mt-5", textClass: "text-base font-bold", msgClass: "text-sm mt-3", showRings: true, showGhost: true, showShimmer: true },
  lg: { logo: 96, imgClass: "h-24 w-24", ring0: 140, ringStep: 36, glow: 110, dotSize: "h-2 w-2", dotGap: "gap-2", py: "py-16", mt: "mt-8", textClass: "text-xl sm:text-2xl font-bold tracking-tight", msgClass: "text-sm mt-4", showRings: true, showGhost: true, showShimmer: true },
} as const;

const THEME_COLORS = {
  dark: {
    ring: (opacity: number) => `rgba(173, 255, 195, ${opacity})`,
    glowSoft: "rgba(173, 255, 195, 0.15)",
    glowStrong: "rgba(173, 255, 195, 0.35)",
    glowOuter: "rgba(173, 255, 195, 0.05)",
    glowOuterStrong: "rgba(173, 255, 195, 0.12)",
    shimmer: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0.2) 60%, transparent 65%)",
  },
  light: {
    ring: (opacity: number) => `rgba(16, 185, 129, ${opacity * 1.6})`,
    glowSoft: "rgba(16, 185, 129, 0.12)",
    glowStrong: "rgba(16, 185, 129, 0.28)",
    glowOuter: "rgba(16, 185, 129, 0.06)",
    glowOuterStrong: "rgba(16, 185, 129, 0.14)",
    shimmer: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.7) 55%, rgba(255,255,255,0.35) 60%, transparent 65%)",
  },
} as const;

const ringVariants = {
  animate: (i: number) => ({
    rotate: i % 2 === 0 ? 360 : -360,
    transition: {
      duration: 3 + i * 0.8,
      repeat: Infinity,
      ease: "linear" as Easing,
    },
  }),
};

const dotVariants = {
  animate: (i: number) => ({
    scale: [1, 1.5, 1],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      delay: i * 0.15,
      ease: "easeInOut" as Easing,
    },
  }),
};

export function AppLoader({
  showName = true,
  fullScreen = true,
  message,
  size: sizeProp,
}: AppLoaderProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const size = sizeProp ?? (fullScreen ? "lg" : "md");
  const s = SIZE_MAP[size];
  const showLabel = showName && size !== "xs";

  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
          : `flex flex-col items-center justify-center ${s.py}`
      }
    >
      <div className="relative flex items-center justify-center" style={{ perspective: 800 }}>
        {/* Orbital rings */}
        {s.showRings &&
          [0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: s.ring0 + i * s.ringStep,
                height: s.ring0 + i * s.ringStep,
                borderColor: colors.ring(0.2 - i * 0.05),
                rotateX: 65 + i * 8,
                rotateZ: i * 30,
              }}
              custom={i}
              variants={ringVariants}
              animate="animate"
            />
          ))}

        {/* Glow pulse behind logo */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: s.glow, height: s.glow }}
          animate={{
            boxShadow: [
              `0 0 ${s.glow * 0.18}px 4px ${colors.glowSoft}, 0 0 ${s.glow * 0.55}px 8px ${colors.glowOuter}`,
              `0 0 ${s.glow * 0.36}px 12px ${colors.glowStrong}, 0 0 ${s.glow * 0.73}px 24px ${colors.glowOuterStrong}`,
              `0 0 ${s.glow * 0.18}px 4px ${colors.glowSoft}, 0 0 ${s.glow * 0.55}px 8px ${colors.glowOuter}`,
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Logo container: float + 3D spin */}
        <motion.div
          className="relative z-10"
          animate={{
            y: [0, size === "xs" ? -4 : size === "sm" ? -8 : -14, 0],
            rotateY: [0, 360],
          }}
          transition={{
            y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
            rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
          }}
        >
          {/* Soft shadow layer */}
          {s.showGhost && (
            <div
              className="absolute inset-0 z-0 blur-md dark:opacity-15 opacity-25"
              style={{ transform: "translateY(8px) scale(1.06)" }}
            >
              <Image
                src={LOGO_SRC}
                alt=""
                width={s.logo}
                height={s.logo}
                className={`${s.imgClass} object-contain`}
                unoptimized
                aria-hidden
              />
            </div>
          )}

          {/* Main logo */}
          <Image
            src={LOGO_SRC}
            alt={APP_NAME}
            width={s.logo}
            height={s.logo}
            className={`relative z-10 ${s.imgClass} object-contain drop-shadow-lg`}
            unoptimized
            priority
          />

          {/* Shimmer sweep clipped to logo shape */}
          {s.showShimmer && (
            <div
              className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
              style={{
                maskImage: `url(${LOGO_SRC})`,
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskMode: "alpha",
                WebkitMaskImage: `url(${LOGO_SRC})`,
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
              }}
            >
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: colors.shimmer,
                }}
                animate={{
                  x: ["-150%", "150%", "150%", "-150%"],
                  opacity: [1, 1, 0, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  times: [0, 0.22, 0.23, 1],
                }}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* App name with stagger reveal */}
      {showLabel && (
        <motion.div
          className={`${s.mt} flex items-center gap-0.5 text-foreground ${s.textClass}`}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04, delayChildren: 0.6 } },
          }}
        >
          {APP_NAME.split("").map((char, i) => (
            <motion.span
              key={i}
              className={char === " " ? "inline-block w-1.5" : "inline-block"}
              variants={{
                hidden: { opacity: 0, y: 10, rotateX: -90 },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  transition: { type: "spring", stiffness: 200, damping: 12 },
                },
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.div>
      )}

      {/* Loading dots */}
      <div className={`${size === "xs" ? "mt-1" : s.mt} flex items-center ${s.dotGap}`}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={`block rounded-full bg-mint dark:bg-mint ${s.dotSize}`}
            custom={i}
            variants={dotVariants}
            animate="animate"
          />
        ))}
      </div>

      {/* Optional message */}
      {message && (
        <motion.p
          className={`text-muted ${s.msgClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
