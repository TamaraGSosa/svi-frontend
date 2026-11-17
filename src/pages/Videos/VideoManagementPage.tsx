import { useState, useMemo } from "react";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import { VideoListTable } from "@/components/surveillance/VideoListTable";
import { MOCK_DASHBOARD_DATA } from "@/data/mockSurveillance";
import type { VideoRecord } from "@/types/surveillance";

export default function VideoManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cameraFilter, setCameraFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoList, setVideoList] = useState<VideoRecord[]>(MOCK_DASHBOARD_DATA.videos);

  // Lista única de cámaras con grabaciones registradas
  const camerasWithRecordings = useMemo(() => {
    const map = new Map<string, string>();
    videoList.forEach((v) => map.set(v.cameraId, v.cameraOrigin));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [videoList]);

  // Métricas propias de grabaciones almacenadas (sin mezclar con estados de análisis)
  const recordingMetrics = useMemo(() => {
    const totalCount = videoList.length;
    const uniqueCamerasCount = new Set(videoList.map((v) => v.cameraId)).size;

    // Suma aproximada del almacenamiento de los archivos
    const totalSizeMB = videoList.reduce((acc, v) => {
      const num = parseFloat(v.size);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);

    const formattedSize =
      totalSizeMB > 1024
        ? `${(totalSizeMB / 1024).toFixed(2)} GB`
        : `${totalSizeMB.toFixed(1)} MB`;

    // Grabaciones con fecha de hoy (26/10/2026 en datos demo)
    const todayCount = videoList.filter((v) => v.date.startsWith("26/10/2026")).length;

    return {
      total: totalCount,
      camerasCount: uniqueCamerasCount,
      totalStorage: formattedSize,
      todayRecordings: todayCount,
    };
  }, [videoList]);

  // Filtrado reactivo por búsqueda, cámara de origen y fecha
  const filteredVideos = useMemo(() => {
    return videoList.filter((video) => {
      const matchesSearch =
        video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.cameraOrigin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCamera =
        cameraFilter === "all" ? true : video.cameraId === cameraFilter;

      const matchesDate =
        dateFilter === "all"
          ? true
          : dateFilter === "today"
          ? video.date.startsWith("26/10/2026")
          : dateFilter === "recent"
          ? video.date.includes("15:00") || video.date.includes("14:30") || video.date.includes("14:00")
          : true;

      return matchesSearch && matchesCamera && matchesDate;
    });
  }, [videoList, searchTerm, cameraFilter, dateFilter]);

  return (
    <>
      <PageMeta
        title="Gestión de Videos | SVI - Sistema de Vigilancia Inteligente"
        description="Listado, búsqueda y consulta de grabaciones almacenadas en el sistema."
      />

      <div className="space-y-6">
        {/* Cabecera y Miga de Pan con la Barra de Demostración intacta */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PageBreadcrumb pageTitle="Gestión de Videos" />

          {/* Barra de Demostración intacta y funcional para pruebas de estados */}
          <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-1.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-medium">Demostración:</span> Registro simulado de grabaciones
            <div className="ms-2 flex items-center gap-1 border-s border-amber-300 ps-2 dark:border-amber-800">
              <button
                onClick={() => {
                  setIsLoading(false);
                  setError(null);
                  setVideoList(MOCK_DASHBOARD_DATA.videos);
                }}
                className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                  !isLoading && !error && videoList.length > 0
                    ? "bg-amber-600 text-white dark:bg-amber-500 dark:text-gray-900"
                    : "hover:bg-amber-200/60 dark:hover:bg-amber-900/40"
                }`}
                title="Cargar lista normal"
              >
                Normal
              </button>
              <button
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                }}
                className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                  isLoading
                    ? "bg-amber-600 text-white dark:bg-amber-500 dark:text-gray-900"
                    : "hover:bg-amber-200/60 dark:hover:bg-amber-900/40"
                }`}
                title="Simular carga"
              >
                Carga
              </button>
              <button
                onClick={() => {
                  setIsLoading(false);
                  setError("No se pudo sincronizar la lista de grabaciones del servidor.");
                }}
                className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                  error
                    ? "bg-amber-600 text-white dark:bg-amber-500 dark:text-gray-900"
                    : "hover:bg-amber-200/60 dark:hover:bg-amber-900/40"
                }`}
                title="Simular error"
              >
                Error
              </button>
              <button
                onClick={() => {
                  setIsLoading(false);
                  setError(null);
                  setVideoList([]);
                }}
                className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                  videoList.length === 0 && !isLoading && !error
                    ? "bg-amber-600 text-white dark:bg-amber-500 dark:text-gray-900"
                    : "hover:bg-amber-200/60 dark:hover:bg-amber-900/40"
                }`}
                title="Simular lista vacía"
              >
                Vacío
              </button>
            </div>
          </div>
        </div>

        {/* Tarjetas Métricas Propias de Grabaciones Almacenadas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {/* Total Grabaciones */}
          <div
            onClick={() => {
              setCameraFilter("all");
              setDateFilter("all");
            }}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              cameraFilter === "all" && dateFilter === "all"
                ? "border-brand-500 bg-brand-50/20 dark:bg-brand-500/10"
                : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-white/[0.03]"
            }`}
          >
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Total Grabaciones
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {recordingMetrics.total}
              </span>
              <Badge color="light">Total</Badge>
            </div>
          </div>

          {/* Cámaras con Grabaciones */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Cámaras con Grabaciones
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                {recordingMetrics.camerasCount}
              </span>
              <Badge color="info">Fuentes</Badge>
            </div>
          </div>

          {/* Grabaciones de Hoy */}
          <div
            onClick={() => setDateFilter("today")}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              dateFilter === "today"
                ? "border-success-500 bg-success-50/20 dark:bg-success-500/10"
                : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-white/[0.03]"
            }`}
          >
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Grabaciones de Hoy
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-success-600 dark:text-success-400">
                {recordingMetrics.todayRecordings}
              </span>
              <Badge color="success">26/10</Badge>
            </div>
          </div>

          {/* Almacenamiento Estimado */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Almacenamiento Total
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {recordingMetrics.totalStorage}
              </span>
              <Badge color="light">Disco</Badge>
            </div>
          </div>
        </div>

        {/* Barra de Filtros Pertinentes: Búsqueda, Cámara de Origen y Período */}
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Búsqueda por texto */}
          <div className="w-full sm:max-w-xs">
            <Input
              type="text"
              placeholder="Buscar por archivo, cámara o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          {/* Controles de Filtrado: Cámara y Fecha */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por Cámara de Origen */}
            <div className="flex items-center gap-2">
              <label htmlFor="camera-filter" className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Cámara:
              </label>
              <select
                id="camera-filter"
                value={cameraFilter}
                onChange={(e) => setCameraFilter(e.target.value)}
                className="h-9 appearance-none rounded-lg border border-gray-300 bg-transparent px-3 py-1 pe-8 text-xs text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="all" className="dark:bg-gray-900">Todas las cámaras</option>
                {camerasWithRecordings.map((c) => (
                  <option key={c.id} value={c.id} className="dark:bg-gray-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Fecha de Grabación */}
            <div className="flex items-center gap-2">
              <label htmlFor="date-filter" className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Fecha:
              </label>
              <select
                id="date-filter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-9 appearance-none rounded-lg border border-gray-300 bg-transparent px-3 py-1 pe-8 text-xs text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="all" className="dark:bg-gray-900">Cualquier fecha</option>
                <option value="today" className="dark:bg-gray-900">Grabaciones de hoy</option>
                <option value="recent" className="dark:bg-gray-900">Últimas 2 horas</option>
              </select>
            </div>

            {/* Botón para restablecer si hay filtros aplicados */}
            {(cameraFilter !== "all" || dateFilter !== "all" || searchTerm !== "") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCameraFilter("all");
                  setDateFilter("all");
                }}
                className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Vista Principal Condicional según Estados de Demostración */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Sincronizando almacén de grabaciones...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-center dark:border-error-800/40 dark:bg-error-500/10">
            <h3 className="text-base font-semibold text-error-700 dark:text-error-400">
              Error al consultar grabaciones
            </h3>
            <p className="mt-1 text-sm text-error-600 dark:text-error-400/80">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setVideoList(MOCK_DASHBOARD_DATA.videos);
              }}
              className="mt-4 rounded-lg bg-error-600 px-4 py-2 text-xs font-medium text-white hover:bg-error-700"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <VideoListTable videos={filteredVideos} />
        )}
      </div>
    </>
  );
}
