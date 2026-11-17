import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";

interface SivCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function SivCard({ children, className, ...props }: SivCardProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)] p-5 transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
