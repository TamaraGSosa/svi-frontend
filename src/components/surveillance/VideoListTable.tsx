import React from "react";
import { Link } from "react-router";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VideoIcon, PlayIcon, BoltIcon } from "@/icons";
import type { VideoRecord } from "@/types/surveillance";

interface VideoListTableProps {
  videos: VideoRecord[];
}

export const VideoListTable: React.FC<VideoListTableProps> = ({ videos }) => {
  // Renderizado del estado o resultado del análisis para la columna Detecciones
  const renderDetectionStatus = (vid: VideoRecord) => {
    switch (vid.status) {
      case "completed":
        if ((vid.detectedCount ?? 0) > 0) {
          return (
            <div className="flex items-center gap-1.5">
              <Badge color="success">
                {vid.detectedCount} {vid.detectedCount === 1 ? "evento" : "eventos"}
              </Badge>
              <Link
                to={`/detections?video=${vid.id}`}
                className="inline-flex items-center text-xs text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
                title="Consultar detecciones asociadas"
              >
                Ver
              </Link>
            </div>
          );
        }
        return (
          <Badge color="light">
            Sin detecciones
          </Badge>
        );

      case "analyzing":
        return (
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <Badge color="warning">En análisis</Badge>
          </div>
        );

      case "pending":
        return (
          <Badge color="info">
            Pendiente de análisis
          </Badge>
        );

      case "error":
      default:
        return (
          <Badge color="error">
            Error de análisis
          </Badge>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between px-5 py-4 sm:px-6">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Registro de Grabaciones
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Acceso a videos completos y eventos de detección clasificados
          </p>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {videos.length} archivo{videos.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Grabación
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Cámara
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Fecha y hora
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Duración
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Tamaño
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Detecciones
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                Acciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {videos.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron grabaciones con los criterios de búsqueda o filtros seleccionados.
                </TableCell>
                <TableCell className="py-8" />
                <TableCell className="py-8" />
                <TableCell className="py-8" />
                <TableCell className="py-8" />
                <TableCell className="py-8" />
                <TableCell className="py-8" />
              </TableRow>
            ) : (
              videos.map((vid) => (
                <TableRow key={vid.id}>
                  {/* Columna 1: Grabación (Nombre del archivo + Resolución y FPS) */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                        <VideoIcon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-gray-800 dark:text-white/90">
                          {vid.name}
                        </span>
                        <span className="block text-[11px] text-gray-400 font-mono">
                          {vid.resolution || "1080p"} {vid.fps ? `@ ${vid.fps} FPS` : ""}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Columna 2: Cámara de origen */}
                  <TableCell className="py-3 text-xs text-gray-600 dark:text-gray-300">
                    <Link
                      to={`/cameras/${vid.cameraId}`}
                      className="hover:text-brand-500 hover:underline"
                    >
                      {vid.cameraOrigin}
                    </Link>
                  </TableCell>

                  {/* Columna 3: Fecha y hora */}
                  <TableCell className="py-3 text-xs text-gray-500 dark:text-gray-400">
                    {vid.date}
                  </TableCell>

                  {/* Columna 4: Duración */}
                  <TableCell className="py-3 text-xs font-mono text-gray-700 dark:text-gray-300">
                    {vid.duration}
                  </TableCell>

                  {/* Columna 5: Tamaño */}
                  <TableCell className="py-3 text-xs font-mono text-gray-500 dark:text-gray-400">
                    {vid.size}
                  </TableCell>

                  {/* Columna 6: Detecciones (Estado del análisis) */}
                  <TableCell className="py-3">
                    {renderDetectionStatus(vid)}
                  </TableCell>

                  {/* Columna 7: Acciones (Ver video y Ver detecciones) */}
                  <TableCell className="py-3 text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Acción: Ver video */}
                      <Link
                        to={`/videos/${vid.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        title="Ver detalle y video de la grabación"
                      >
                        <PlayIcon className="size-3" />
                        <span>Ver video</span>
                      </Link>

                      {/* Acción: Ver detecciones */}
                      <Link
                        to={`/detections?video=${vid.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50/50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 hover:text-brand-800 dark:border-brand-900/50 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
                        title="Ver detecciones asociadas a esta grabación"
                      >
                        <BoltIcon className="size-3" />
                        <span>Ver detecciones</span>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
