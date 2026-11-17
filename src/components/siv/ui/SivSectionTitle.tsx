import { cn } from "@/utils";

interface SivSectionTitleProps {
  title: string;
  aside?: string;
  asideClassName?: string;
  className?: string;
}

export function SivSectionTitle({
  title,
  aside,
  asideClassName = "text-[var(--siv-muted)]",
  className,
}: SivSectionTitleProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="text-lg font-semibold text-[var(--siv-fg)]">{title}</h2>
      {aside ? (
        <span className={cn("font-mono text-[10px] uppercase tracking-widest", asideClassName)}>
          {aside}
        </span>
      ) : null}
    </div>
  );
}
