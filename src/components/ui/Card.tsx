import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ className, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-slate-900/70 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl transition-all duration-200",
        glow && "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
