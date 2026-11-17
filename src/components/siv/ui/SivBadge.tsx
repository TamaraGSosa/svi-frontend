import { cn } from "@/utils";

export type SivBadgeVariant = "success" | "info" | "danger" | "warning" | "caution" | "neutral";

const variantStyles: Record<SivBadgeVariant, string> = {
  success: "border-[#00A874]/40 bg-[#00A874]/10 text-[#00A874] dark:border-[#00D68F]/40 dark:bg-[#00D68F]/10 dark:text-[#00D68F]",
  info: "border-[#0090AD]/40 bg-[#0090AD]/10 text-[#0090AD] dark:border-[#00B4D8]/40 dark:bg-[#00B4D8]/10 dark:text-[#00B4D8]",
  danger: "border-[#F0453F]/40 bg-[#F0453F]/15 text-[#F0453F]",
  warning: "border-[#F58220]/40 bg-[#F58220]/15 text-[#F58220]",
  caution: "border-[#E6B800]/40 bg-[#E6B800]/15 text-[#C99A00] dark:text-[#E6B800]",
  neutral: "border-[var(--siv-border)] bg-[var(--siv-surface-alt)] text-[var(--siv-muted)]",
};

interface SivBadgeProps {
  label: string;
  variant?: SivBadgeVariant;
  className?: string;
}

export function SivBadge({ label, variant = "neutral", className }: SivBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest",
        variantStyles[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
