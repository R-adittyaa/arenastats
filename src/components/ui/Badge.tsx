import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-neutral-800 text-neutral-300 border-neutral-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    neutral: "bg-transparent text-neutral-500 border-neutral-800",
  };

  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded tracking-wider uppercase border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}