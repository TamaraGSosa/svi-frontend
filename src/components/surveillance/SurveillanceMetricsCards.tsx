import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { VideoIcon, CheckCircleIcon, AlertIcon, TimeIcon } from "@/icons";
import type { SurveillanceMetrics } from "@/types/surveillance";

interface SurveillanceMetricsCardsProps {
  metrics: SurveillanceMetrics;
}

export const SurveillanceMetricsCards: React.FC<SurveillanceMetricsCardsProps> = ({
  metrics,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Videos */}
      <div className="rounded-xl border border-gray-200 bg-white p-4.5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Videos Registrados
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10">
            <VideoIcon className="size-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {metrics.totalVideos}
          </h4>
          <Badge color="light">Total</Badge>
        </div>
      </div>

      {/* Videos Analizados */}
      <div className="rounded-xl border border-gray-200 bg-white p-4.5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Videos Analizados
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-50 text-success-500 dark:bg-success-500/10">
            <CheckCircleIcon className="size-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {metrics.analyzedVideos}
          </h4>
          <Badge color="success">
            {Math.round((metrics.analyzedVideos / (metrics.totalVideos || 1)) * 100)}%
          </Badge>
        </div>
      </div>

      {/* Detecciones Registradas */}
      <div className="rounded-xl border border-gray-200 bg-white p-4.5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Detecciones Totales
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-50 text-warning-500 dark:bg-warning-500/10">
            <AlertIcon className="size-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {metrics.totalDetections}
          </h4>
          <Badge color="warning">YOLO</Badge>
        </div>
      </div>

      {/* Eventos Pendientes de Revisión */}
      <div className="rounded-xl border border-gray-200 bg-white p-4.5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Eventos Pendientes
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-50 text-error-500 dark:bg-error-500/10">
            <TimeIcon className="size-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {metrics.pendingEvents}
          </h4>
          <Badge color="error">Revisión</Badge>
        </div>
      </div>
    </div>
  );
};
