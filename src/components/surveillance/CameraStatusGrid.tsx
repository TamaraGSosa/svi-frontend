import React from "react";
import { Link } from "react-router";
import Badge from "@/components/ui/badge/Badge";
import type { CameraOverview } from "@/types/surveillance";

interface CameraStatusGridProps {
  cameras: CameraOverview[];
}

export const CameraStatusGrid: React.FC<CameraStatusGridProps> = ({ cameras }) => {
  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Estado de Cámaras
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dispositivos configurados y conectividad RTSP
          </p>
        </div>
        <Link
          to="/monitoring"
          className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          Ver en vivo &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {cameras.map((camera) => (
          <Link
            key={camera.id}
            to={`/cameras/${camera.id}`}
            className="flex items-center justify-between rounded-xl border border-gray-100 p-3 transition-colors hover:border-brand-200 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-800/40"
          >
            <div className="min-w-0 pr-2">
              <h4 className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                {camera.name}
              </h4>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {camera.location} • {camera.resolution} ({camera.fps} fps)
              </p>
            </div>
            <div className="shrink-0">
              <Badge
                size="sm"
                color={
                  camera.status === "online"
                    ? "success"
                    : camera.status === "recording"
                    ? "info"
                    : "error"
                }
              >
                {camera.status === "online"
                  ? "En línea"
                  : camera.status === "recording"
                  ? "Grabando"
                  : "Desconectada"}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
