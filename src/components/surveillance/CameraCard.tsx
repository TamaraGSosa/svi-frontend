import React from "react";
import { Link } from "react-router";
import Badge from "@/components/ui/badge/Badge";
import { VideoIcon, EyeIcon } from "@/icons";
import type { CameraOverview } from "@/types/surveillance";

interface CameraCardProps {
  camera: CameraOverview;
}

export const CameraCard: React.FC<CameraCardProps> = ({ camera }) => {
  const getStatusBadge = (status: CameraOverview["status"]) => {
    switch (status) {
      case "online":
        return <Badge color="success">Conectada</Badge>;
      case "recording":
        return <Badge color="info">Grabando</Badge>;
      case "no_signal":
        return <Badge color="warning">Sin señal</Badge>;
      case "offline":
      default:
        return <Badge color="error">Desconectada</Badge>;
    }
  };

  const isLive = camera.status === "online" || camera.status === "recording";

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:border-brand-500/30 hover:shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/30">
      {/* Vista previa simulada de la cámara */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-950 flex flex-col items-center justify-center p-4">
        {/* Marcador de esquina simulando feed de videovigilancia */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-2 z-10">
          <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white/90 backdrop-blur-xs">
            {camera.id.toUpperCase()}
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5 rounded bg-error-600/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              SIM
            </span>
          )}
        </div>

        {/* Indicador de resolución / FPS */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono text-gray-300 backdrop-blur-xs">
            {camera.resolution} • {camera.fps} FPS
          </span>
        </div>

        {/* Centro del reproductor simulado */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-xs">
            <VideoIcon className="size-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-300">
              Vista previa simulada
            </span>
            <span className="block text-[11px] text-gray-400">
              {camera.status === "offline"
                ? "Dispositivo fuera de línea"
                : camera.status === "no_signal"
                ? "Pérdida de señal de entrada"
                : "Señal de demostración activa"}
            </span>
          </div>
        </div>

        {/* Pie de la vista previa: IP / timestamp simulado */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-gray-400">
          <span>{camera.ip || "RTSP Stream"}</span>
          <span>DEMO FEED</span>
        </div>
      </div>

      {/* Información de la cámara y controles */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {camera.name}
              </h4>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {camera.location}
              </p>
            </div>
            <div>{getStatusBadge(camera.status)}</div>
          </div>

          {camera.lastEvent && (
            <div className="mt-3 rounded-lg bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
              <span className="font-medium text-gray-700 dark:text-gray-200">
                Última actividad:
              </span>{" "}
              {camera.lastEvent}
            </div>
          )}
        </div>

        {/* Acciones de la tarjeta */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">ID: {camera.id}</span>
          <Link
            to={`/cameras/${camera.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            <EyeIcon className="size-3.5" />
            <span>Ver detalle</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

