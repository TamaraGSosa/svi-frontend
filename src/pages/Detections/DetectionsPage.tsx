import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import { ProtectedImage } from "@/components/siv/ProtectedImage";
import { formatDateTime, yoloClassLabels } from "@/components/siv/StatusBadges";
import { SivBadge } from "@/components/siv/ui/SivBadge";
import { SivCard } from "@/components/siv/ui/SivCard";
import { RefreshCwIcon } from "@/components/siv/ui/SivIcons";
import { useAuth } from "@/context/AuthContext";
import { camerasService } from "@/services/camerasService";
import { detectionsService } from "@/services/detectionsService";
import type { Camera, DetectionOut, YoloClassName } from "@/types";

export default function DetectionsPage() {
  const { subscribeRealtime } = useAuth();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [detections, setDetections] = useState<DetectionOut[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [cameraFilter, setCameraFilter] = useState<string>("");
  const [yoloClassFilter, setYoloClassFilter] = useState<YoloClassName | "">("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    camerasService
      .list()
      .then(setCameras)
      .catch(() => setCameras([]));
  }, []);

  const loadDetections = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await detectionsService.list({
        cameraId: cameraFilter || undefined,
        yoloClass: yoloClassFilter || undefined,
        dateFrom: dateFrom ? new Date(`${dateFrom}T00:00:00`).toISOString() : undefined,
        dateTo: dateTo ? new Date(`${dateTo}T23:59:59`).toISOString() : undefined,
        page,
        pageSize: 15,
      });
      setDetections(res.items);
      setTotal(res.total);
      setHasMore(res.page * res.pageSize < res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las detecciones.");
    } finally {
      setLoadingList(false);
    }
  }, [cameraFilter, yoloClassFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    void loadDetections();
  }, [loadDetections]);

  useEffect(() => {
    return subscribeRealtime((ev) => {
      if (ev.event === "alert.created" || ev.event === "alert.updated") {
        void loadDetections();
      }
    });
  }, [subscribeRealtime, loadDetections]);

  return (
    <>
      <PageMeta
        title="Detecciones | SIV IA"
        description="Listado de detecciones automáticas registradas en las cámaras del sistema"
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-[var(--siv-fg)]">
                Detecciones
              </h1>
              <SivBadge label={`${total} Registros`} variant="info" />
            </div>
            <p className="mt-1 text-sm text-[var(--siv-muted)]">
              Objetos detectados automáticamente en las cámaras monitoreadas
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDetections()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--siv-fg)] transition hover:bg-[var(--siv-surface-alt)]"
          >
            <RefreshCwIcon size={14} />
            Actualizar
          </button>
        </div>

        {/* Filtros operativos */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={cameraFilter}
            onChange={(e) => {
              setPage(1);
              setCameraFilter(e.target.value);
            }}
            aria-label="Filtrar por cámara"
            className="h-11 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3.5 text-xs font-semibold text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
          >
            <option value="">Todas las cámaras</option>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>

          <select
            value={yoloClassFilter}
            onChange={(e) => {
              setPage(1);
              setYoloClassFilter(e.target.value as YoloClassName | "");
            }}
            aria-label="Filtrar por tipo de objeto"
            className="h-11 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3.5 text-xs font-semibold text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
          >
            <option value="">Todos los objetos</option>
            <option value="knife">Cuchillo</option>
            <option value="scissors">Tijeras</option>
            <option value="box_cutter">Cúter</option>
            <option value="lighter">Encendedor</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setPage(1);
              setDateFrom(e.target.value);
            }}
            aria-label="Fecha desde"
            className="h-11 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3 text-xs font-semibold text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setPage(1);
              setDateTo(e.target.value);
            }}
            aria-label="Fecha hasta"
            className="h-11 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3 text-xs font-semibold text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
          />
        </div>

        {error ? (
          <div className="rounded-[20px] border border-[#F0453F]/50 bg-[#F0453F]/10 p-4 text-sm text-[#F0453F]">
            {error}
          </div>
        ) : null}

        <SivCard className="overflow-hidden p-0">
          {loadingList ? (
            <div className="p-10 text-center text-sm text-[var(--siv-muted)]">
              Cargando detecciones...
            </div>
          ) : detections.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--siv-muted)]">
              No hay detecciones registradas para los filtros seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--siv-border)] bg-[var(--siv-surface-alt)] font-mono text-[10px] uppercase tracking-widest text-[var(--siv-muted)]">
                  <tr>
                    <th className="px-4 py-3.5">Imagen</th>
                    <th className="px-4 py-3.5">Objeto</th>
                    <th className="px-4 py-3.5">Cámara</th>
                    <th className="px-4 py-3.5">Confianza</th>
                    <th className="px-4 py-3.5">Resolución</th>
                    <th className="px-4 py-3.5">Fecha y hora</th>
                    <th className="px-4 py-3.5 text-right">Alerta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--siv-border)]">
                  {detections.map((d) => (
                    <tr
                      key={d.id}
                      className="transition-colors hover:bg-[var(--siv-surface-alt)]/60"
                    >
                      <td className="px-4 py-3">
                        {d.imageUrl ? (
                          <ProtectedImage
                            src={d.imageUrl}
                            alt={d.cameraName ?? "Detección"}
                            className="h-12 w-20 rounded-lg"
                          />
                        ) : (
                          <span className="text-xs text-[var(--siv-muted)]">Sin captura</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[var(--siv-fg)]">
                        {yoloClassLabels[d.yoloClassName] ?? d.yoloClassName}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--siv-fg)]/85">
                        {d.cameraName ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#00B4D8]">
                        {Math.round(d.confidence * 100)}%
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--siv-muted)]">
                        {d.frameWidth}×{d.frameHeight}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--siv-muted)]">
                        {formatDateTime(d.detectedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {d.alertId ? (
                          <Link
                            to={`/alerts/${d.alertId}`}
                            className="font-mono text-xs font-bold text-[#00A874] hover:underline dark:text-[#00D68F]"
                          >
                            Ver alerta →
                          </Link>
                        ) : (
                          <span className="text-xs text-[var(--siv-muted)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SivCard>

        {total > 15 ? (
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-4 py-2 font-mono text-xs font-semibold text-[var(--siv-fg)] disabled:opacity-40"
            >
              ← Anterior
            </button>
            <span className="font-mono text-xs text-[var(--siv-muted)]">Página {page}</span>
            <button
              type="button"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-4 py-2 font-mono text-xs font-semibold text-[var(--siv-fg)] disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
