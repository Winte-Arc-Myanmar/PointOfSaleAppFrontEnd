"use client";

import { cn } from "@/lib/utils";
import "./loli-avatar.css";

export function LoliAvatar({
  size = "lg",
  className,
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <span className={cn("loli-avatar", `loli-avatar--${size}`, className)}>
      <span className="loli-avatar__ring">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/loli-agent.png?v=3"
          alt="Loli"
          className="loli-avatar__face"
        />
      </span>
      <span className="loli-avatar__sparkle loli-avatar__sparkle--a" />
      <span className="loli-avatar__sparkle loli-avatar__sparkle--b" />
    </span>
  );
}
