import React from "react";
import type { ActivityItem } from "@/types/surveillance";

interface RecentActivityListProps {
  activities: ActivityItem[];
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  activities,
}) => {
  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-3.5">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Registro de Actividad
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Historial reciente de operaciones y seguridad
        </p>
      </div>

      <div className="space-y-3.5">
        {activities.map((item, index) => (
          <div key={item.id} className="relative flex gap-3 pb-1">
            {index !== activities.length - 1 && (
              <span
                className="absolute left-2 top-5 -bottom-1 w-0.5 bg-gray-100 dark:bg-gray-800"
                aria-hidden="true"
              />
            )}
            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {item.title}
                </h4>
                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                  {item.timestamp}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
