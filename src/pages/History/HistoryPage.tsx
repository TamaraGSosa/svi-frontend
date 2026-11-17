import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import { ProtectedImage } from "@/components/siv/ProtectedImage";
import {
  AlertStatusBadge,
  formatDateTime,
  SeverityBadge,
  yoloClassLabels,
} from "@/components/siv/StatusBadges";
import { SivCard } from "@/components/siv/ui/SivCard";
import { RefreshCwIcon } from "@/components/siv/ui/SivIcons";
import { historyService } from "@/services/historyService";
import type { AlertSeverity, AlertStatus, HistoryEntry, YoloClassName } from "@/types";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [statusFilter, setStatusFilter] = useState<AlertStatus | "">("");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "">("");
  const [yoloClassFilter, setYoloClassFilter] = useState<YoloClassName | "">("");
  const [order, setOrder] = useState<"desc" | "asc">("desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await historyService.list({
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        yoloClass: yoloClassFilter || undefined,
        sortBy: "detected_at",
        order,
        page,
        pageSize: 15,
      });
      setItems(res.items);
      setTotal(res.total);
      setHasMore(res.page * res.pageSize < res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, yoloClassFilter, order, page]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <>
      <PageMeta
        title="Historial | SIV IA"
        description="Historial filtrable de alertas y detecciones registradas"
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--siv-fg)]">
              Historial
            </h1>
            <p className="mt-1 text-sm text-[var(--siv-muted)]">
              {total} registro(s) históricos de eventos y validaciones
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadHistory()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--siv-fg)] transition hover:bg-[var(--siv-surface-alt)]"
          >
            <RefreshCwIcon size={14} />
            Actualizar
          </button>
        </div>

        {/* Filtros estilo Mobile Select */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={yoloClassFilter}
            onChange={(e) => {
              setPage(1);
              setYoloClassFilter(e.target.value as YoloClassName | "");
            }}
            aria-label="Filtrar por clase YOLO"
            className="h-11 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3.5 text-xs font-semibold text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
          >
            <option value="">Todas las clases YOLO</option>
            <option value="knife">Cuchillo (knife)</option>
            <option value="scissors">Tijeras (scissors)</option>
            <option value="box_cutter">Cúter (box_cutter)</option>
            <option value="lighter">Encendedor (lighter)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value as AlertStatus | "");
            }}
            aria-label="Filtrar por estado"
            className="h-11 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3.5 text-xs font-semibold text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
          >
            <option value="">Todos los estados</option>
            <option value="pending_validation">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="false_positive">Falso positivo</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => {
              setPage(1);
              setSeverityFilter(e.target.value as AlertSeverity | "");
            }}
            aria-label="Filtrar por severidad"
            className="h-11 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3.5 text-xs font-semibold text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
          >
            <option value="">Todas las severidades</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <button
            type="button"
            onClick={() => setOrder((o) => (o === "desc" ? "asc" : "desc"))}
            className="h-11 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--siv-fg)] transition hover:bg-[var(--siv-surface-alt)]"
          >
            Orden: {order === "desc" ? "Más recientes" : "Más antiguos"}
          </button>
        </div>

        {error ? (
          <div className="rounded-[20px] border border-[#F0453F]/50 bg-[#F0453F]/10 p-4 text-sm text-[#F0453F]">
            {error}
          </div>
        ) : null}

        <SivCard className="overflow-hidden p-0">
          {loading ? (
            <div className="p-10 text-center text-sm text-[var(--siv-muted)]">
              Cargando historial...
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--siv-muted)]">
              No hay registros en el historial para estos filtros.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--siv-border)] bg-[var(--siv-surface-alt)] font-mono text-[10px] uppercase tracking-widest text-[var(--siv-muted)]">
                  <tr>
                    <th className="px-4 py-3.5">Evidencia</th>
                    <th className="px-4 py-3.5">Objeto / Confianza</th>
                    <th className="px-4 py-3.5">Cámara</th>
                    <th className="px-4 py-3.5">Severidad</th>
                    <th className="px-4 py-3.5">Estado</th>
                    <th className="px-4 py-3.5">Fecha</th>
                    <th className="px-4 py-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--siv-border)]">
                  {items.map((entry) => (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-[var(--siv-surface-alt)]/60"
                    >
                      <td className="px-4 py-3">
                        <ProtectedImage
                          src={entry.thumbnailUrl}
                          alt={entry.cameraName}
                          className="h-12 w-20 rounded-lg"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[var(--siv-fg)]">
                          {yoloClassLabels[entry.primaryYoloClass] ?? entry.primaryYoloClass}
                        </p>
                        <p className="font-mono text-xs text-[#00B4D8]">
                          {Math.round(entry.confidence * 100)}%
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--siv-fg)]">
                          {entry.cameraName}
                        </p>
                        <p className="text-xs text-[var(--siv-muted)]">{entry.location}</p>
                      </td>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={entry.severity} />
                      </td>
                      <td className="px-4 py-3">
                        <AlertStatusBadge status={entry.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--siv-muted)]">
                        {formatDateTime(entry.detectedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/alerts/${entry.alertId ?? entry.id}`}
                          className="font-mono text-xs font-bold text-[#00A874] hover:underline dark:text-[#00D68F]"
                        >
                          Ver detalle →
                        </Link>
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
