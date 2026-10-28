import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-arena-card border border-arena-border rounded-lg overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}