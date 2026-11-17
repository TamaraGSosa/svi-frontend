import { useMemo } from "react";
import { useParams, Link } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { VideoIcon, ChevronLeftIcon, AlertIcon, CheckCircleIcon } from "@/icons";
import { MOCK_DASHBOARD_DATA } from "@/data/mockSurveillance";
import type { VideoStatus } from "@/types/surveillance";

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Resolución del video a partir de los datos simulados centralizados
  const video = useMemo(() => {
    return MOCK_DASHBOARD_DATA.videos.find(
      (v) => v.id.toLowerCase() === id?.toLowerCase()
    );
  }, [id]);

  // Detecciones asociadas a este video o a su cámara de origen
  const associatedDetections = useMemo(() => {
    if (!video) return [];
    return MOCK_DASHBOARD_DATA.recentDetections.filter(
      (d) =>
        d.cameraName.toLowerCase().includes(video.cameraOrigin.toLowerCase())
    );
  }, [video]);

  const getStatusBadge = (status?: VideoStatus) => {
    switch (status) {
      case "completed":
        return <Badge color="success">Completado</Badge>;
      case "analyzing":
        return <Badge color="warning">En análisis</Badge>;
      case "pending":
        return <Badge color="info">Pendiente</Badge>;
      case "error":
      default:
        return <Badge color="error">Error</Badge>;
    }
  };

  if (!video) {
    return (
      <>
        <PageMeta
          title="Video no encontrado | SVI - Sistema de Vigilancia Inteligente"
          description="La grabación solicitada no existe o no se encuentra registrada."
        />
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Link
              to="/videos"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ChevronLeftIcon className="size-4" />
              <span>Volver a Videos</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-500 dark:bg-error-500/10">
              <AlertIcon className="size-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Grabación no encontrada
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              No existe ningún registro de video con el identificador{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                {id}
              </code>
              . Verifica el enlace o consulta el catálogo de grabaciones.
            </p>
            <div className="mt-6">
              <Link
                to="/videos"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600"
              >
                <ChevronLeftIcon className="size-4" />
                <span>Ir al listado de grabaciones</span>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={`${video.name} | SVI - Sistema de Vigilancia Inteligente`}
        description={`Detalle y metadatos del archivo de grabación ${video.name}`}
      />

      <div className="space-y-6">
        {/* Cabecera con navegación de regreso */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/videos"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
              title="Volver a Grabaciones"
            >
              <ChevronLeftIcon className="size-5" />
            </Link>
            <div>
              <PageBreadcrumb pageTitle={video.name} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(video.status)}
            <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-1.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
              <span className="flex h-2 w-2 rounded-full bg-amber-500" />
              <span>Registro de demostración • Sin archivo real en servidor</span>
            </div>
          </div>
        </div>

        {/* Fila Principal: Reproductor / Placeholder y Panel de Metadatos */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Contenedor Visual del Video (8 cols) */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="relative aspect-video w-full bg-gray-950 flex flex-col items-center justify-center p-6">
              {/* Overlay superior */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="rounded bg-black/70 px-2.5 py-1 text-xs font-mono text-white/90 backdrop-blur-xs">
                  {video.name}
                </span>
                <span className="rounded bg-black/70 px-2.5 py-1 text-xs font-mono text-gray-300 backdrop-blur-xs">
                  {video.resolution} • {video.duration}
                </span>
              </div>

              {/* Centro de la previsualización */}
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-xs">
                  <VideoIcon className="size-8" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">
                    Vista previa de video grabado
                  </h4>
                  <p className="mt-1 text-xs text-gray-400 max-w-sm">
                    {video.status === "completed"
                      ? "Grabación analizada con metadatos de clasificación disponibles."
                      : video.status === "analyzing"
                      ? "El archivo se encuentra en cola de análisis por el motor de visión."
                      : video.status === "error"
                      ? "Ocurrió un error en la lectura o decodificación de la grabación."
                      : "Archivo registrado a la espera de procesamiento."}
                  </p>
                </div>
              </div>

              {/* Overlay inferior con metadatos técnicos */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-gray-400">
                <span>CÁMARA: {video.cameraOrigin}</span>
                <span>TAMAÑO: {video.size}</span>
                <span>DEMO ARCHIVE</span>
              </div>
            </div>

            {/* Barra de estado y acciones */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Cámara de procedencia:
                </span>
                <Link
                  to={`/cameras/${video.cameraId}`}
                  className="text-xs font-semibold text-brand-500 hover:underline dark:text-brand-400"
                >
                  {video.cameraOrigin} &rarr;
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/detections?video=${video.id}`}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Ver detecciones
                </Link>
                <Link
                  to="/videos"
                  className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                >
                  Volver al listado
                </Link>
              </div>
            </div>
          </div>

          {/* Panel Lateral: Ficha Técnica de Grabación (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
                Ficha Técnica del Archivo
              </h3>
              <dl className="space-y-3 divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                <div className="flex justify-between pt-2">
                  <dt className="text-gray-500 dark:text-gray-400">Identificador</dt>
                  <dd className="font-mono font-semibold text-gray-800 dark:text-white/90">
                    {video.id}
                  </dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-gray-500 dark:text-gray-400">Estado</dt>
                  <dd>{getStatusBadge(video.status)}</dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-gray-500 dark:text-gray-400">Fecha de Registro</dt>
                  <dd className="font-medium text-gray-800 dark:text-white/90">
                    {video.date}
                  </dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-gray-500 dark:text-gray-400">Duración</dt>
                  <dd className="font-mono text-gray-800 dark:text-white/90">
                    {video.duration}
                  </dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-gray-500 dark:text-gray-400">Tamaño en Disco</dt>
                  <dd className="font-mono text-gray-800 dark:text-white/90">
                    {video.size}
                  </dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-gray-500 dark:text-gray-400">Resolución</dt>
                  <dd className="text-gray-800 dark:text-white/90">
                    {video.resolution} @ {video.fps} FPS
                  </dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="text-gray-500 dark:text-gray-400">Detecciones registradas</dt>
                  <dd className="font-semibold text-brand-600 dark:text-brand-400">
                    {video.detectedCount !== undefined ? `${video.detectedCount} objetos` : "No analizado"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Enlace y resumen a Detecciones */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-2">
                Consulta en Detecciones
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Los eventos de seguridad y clasificación de objetos generados a partir de esta grabación se administran en la sección correspondiente.
              </p>
              <Link
                to={`/detections?video=${video.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <span>Explorar eventos en Detecciones</span>
                <AlertIcon className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Detecciones vinculadas a la cámara de origen */}
        {associatedDetections.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  Detecciones Recientes en la misma Cámara ({video.cameraOrigin})
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Eventos de seguridad coincidentes en tiempo y ubicación
                </p>
              </div>
              <Link
                to={`/detections?video=${video.id}`}
                className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Ver todas &rarr;
              </Link>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {associatedDetections.map((det) => (
                <div key={det.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        det.severity === "high"
                          ? "bg-error-50 text-error-500 dark:bg-error-500/10"
                          : det.severity === "medium"
                          ? "bg-warning-50 text-warning-500 dark:bg-warning-500/10"
                          : "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                      }`}
                    >
                      {det.severity === "high" || det.severity === "medium" ? (
                        <AlertIcon className="size-4" />
                      ) : (
                        <CheckCircleIcon className="size-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-white/90">
                        {det.type}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Confianza: {Math.round(det.confidence * 100)}% • {det.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      size="sm"
                      color={
                        det.severity === "high"
                          ? "error"
                          : det.severity === "medium"
                          ? "warning"
                          : "info"
                      }
                    >
                      {det.severity === "high"
                        ? "Alta"
                        : det.severity === "medium"
                        ? "Media"
                        : "Baja"}
                    </Badge>
                    <Link
                      to={`/events/${det.id}`}
                      className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Revisar evento
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

