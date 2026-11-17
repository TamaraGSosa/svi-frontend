import React from "react";
import { ShieldCheckIcon } from "@/components/siv/ui/SivIcons";
import { cn } from "@/utils";

interface BrandLogoProps {
  isCompact?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  isCompact = false,
  className = "",
}) => {
  if (isCompact) {
    return (
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00A874]/40 bg-[#00A874]/10 text-[#00A874] transition-colors dark:border-[#00D68F]/50 dark:bg-[#172033] dark:text-[#00D68F]",
          className,
        )}
        title="SIV IA - Sistema de Videovigilancia Inteligente"
      >
        <ShieldCheckIcon size={22} />
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-3 select-none", className)}
      title="SVI - Sistema de Videovigilancia Inteligente"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00A874]/40 bg-[#00A874]/10 text-[#00A874] dark:border-[#00D68F]/50 dark:bg-[#172033] dark:text-[#00D68F]">
        <ShieldCheckIcon size={22} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2 leading-none">
          <span className="font-display text-lg tracking-[4px] text-[var(--siv-fg)]">
            SVI
          </span>
          <span className="rounded border border-[#00A874]/35 bg-[#00A874]/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#00A874] dark:border-[#00D68F]/40 dark:bg-[#00D68F]/10 dark:text-[#00D68F]">
            IA
          </span>
        </div>
        <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-[var(--siv-muted)]">
          Vigilancia Inteligente
        </span>
      </div>
    </div>
  );
};
