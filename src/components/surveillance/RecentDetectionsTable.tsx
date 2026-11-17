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
import type { RecentDetection } from "@/types/surveillance";

interface RecentDetectionsTableProps {
  detections: RecentDetection[];
}

export const RecentDetectionsTable: React.FC<RecentDetectionsTableProps> = ({
  detections,
}) => {
  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Detecciones Recientes
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Últimas alertas de objetos y eventos clasificados
          </p>
        </div>
        <Link
          to="/detections"
          className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          Ver todas &rarr;
        </Link>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-2.5 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Tipo de Detección
              </TableCell>
              <TableCell isHeader className="py-2.5 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Cámara
              </TableCell>
              <TableCell isHeader className="py-2.5 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Confianza
              </TableCell>
              <TableCell isHeader className="py-2.5 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Severidad
              </TableCell>
              <TableCell isHeader className="py-2.5 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Tiempo
              </TableCell>
              <TableCell isHeader className="py-2.5 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                Acción
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {detections.length === 0 ? (
              <TableRow>
                <TableCell className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay detecciones recientes registradas.
                </TableCell>
                <TableCell className="py-6" />
                <TableCell className="py-6" />
                <TableCell className="py-6" />
                <TableCell className="py-6" />
                <TableCell className="py-6" />
              </TableRow>
            ) : (
              detections.map((detection) => (
                <TableRow key={detection.id}>
                  <TableCell className="py-2.5 text-sm font-medium text-gray-800 dark:text-white/90">
                    {detection.type}
                  </TableCell>
                  <TableCell className="py-2.5 text-sm text-gray-500 dark:text-gray-400">
                    {detection.cameraName}
                  </TableCell>
                  <TableCell className="py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {Math.round(detection.confidence * 100)}%
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Badge
                      size="sm"
                      color={
                        detection.severity === "high"
                          ? "error"
                          : detection.severity === "medium"
                          ? "warning"
                          : "info"
                      }
                    >
                      {detection.severity === "high"
                        ? "Alta"
                        : detection.severity === "medium"
                        ? "Media"
                        : "Baja"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 text-sm text-gray-500 dark:text-gray-400">
                    {detection.timestamp}
                  </TableCell>
                  <TableCell className="py-2.5 text-end">
                    <Link
                      to={`/events/${detection.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Revisar
                    </Link>
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
