"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const APP_NAME = "Vision AI Pos";

const LOGO_SRC = "/logo.svg";

const SIZE_CONFIG = {
  sidebar: {
    width: 36,
    height: 36,
    imgClass: "h-9 w-9",
    textClass: "text-base font-semibold",
  },
  sidebarCollapsed: {
    width: 40,
    height: 40,
    imgClass: "h-10 w-10",
    textClass: "",
  },
  auth: {
    width: 96,
    height: 96,
    imgClass: "h-20 w-20 sm:h-24 sm:w-24 drop-shadow-sm",
    textClass: "text-xl sm:text-2xl font-bold tracking-tight",
  },
  navbar: {
    width: 32,
    height: 32,
    imgClass: "h-8 w-8",
    textClass: "text-sm font-semibold",
  },
} as const;

type LogoSize = keyof typeof SIZE_CONFIG;

interface AppLogoProps {
  showName?: boolean;
  href?: string;
  size?: LogoSize;
  onClick?: () => void;
  className?: string;
}

export function AppLogo({
  showName = true,
  href,
  size = "sidebar",
  onClick,
  className,
}: AppLogoProps) {
  const config = SIZE_CONFIG[size];
  const showLabel = showName && size !== "sidebarCollapsed";

  const logoImage = (
    <Image
      src={LOGO_SRC}
      alt={APP_NAME}
      width={config.width}
      height={config.height}
      className={cn("shrink-0 object-contain", config.imgClass)}
      priority
      unoptimized
      sizes={
        size === "auth"
          ? "(max-width: 640px) 80px, 96px"
          : size === "sidebar" || size === "sidebarCollapsed"
          ? "40px"
          : "32px"
      }
    />
  );

  const content = (
    <>
      {logoImage}
      {showLabel && (
        <span
          className={cn("whitespace-nowrap text-foreground", config.textClass)}
        >
          {APP_NAME}
        </span>
      )}
    </>
  );

  const wrapperClass = cn(
    "flex items-center gap-2.5 transition-opacity shrink-0",
    href && "hover:opacity-90 active:opacity-95",
    size === "auth" && "flex-col gap-4",
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={wrapperClass}
        aria-label={`${APP_NAME} home`}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
