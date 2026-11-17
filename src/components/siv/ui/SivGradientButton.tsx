import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";

interface SivGradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: ReactNode;
}

export function SivGradientButton({
  label,
  icon,
  className,
  disabled,
  type = "button",
  ...props
}: SivGradientButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#00D68F] to-[#00B4D8] px-5 text-base font-semibold text-[#0B0F17] shadow-[0_8px_24px_rgba(0,214,143,0.22)] transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span>{label}</span>
      {icon}
    </button>
  );
}
