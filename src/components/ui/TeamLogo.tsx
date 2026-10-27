"use client";

import React, { useState } from "react";
import { cn, getInitials, getTeamColor } from "@/lib/utils";

interface TeamLogoProps {
  name: string;
  shortCode: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function TeamLogo({
  name,
  shortCode,
  logoUrl,
  size = "md",
  className,
}: TeamLogoProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl font-bold",
  };

  const gradient = getTeamColor(shortCode || name);
  const initials = shortCode ? shortCode.slice(0, 3) : getInitials(name);

  if (logoUrl && !imageError) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800 flex items-center justify-center shrink-0",
          sizeClasses[size],
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-contain p-1"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-br flex items-center justify-center font-bold text-white shadow-md uppercase tracking-wider shrink-0 select-none",
        gradient,
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
}
