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
import {
  ChevronRightIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from "@/components/siv/ui/SivIcons";
import { useAuth } from "@/context/AuthContext";
import { alertsService } from "@/services/alertsService";
import type { AlertSeverity, AlertStatus, AlertSummary } from "@/types";

export default function AlertsPage() {
  const { wsState, subscribeRealtime } = useAuth();
  const [items, setItems] = useState<AlertSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "">("");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await alertsService.list({
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        page,
        pageSize: 12,
      });
      setItems(res.items);
      setTotal(res.total);
      setHasMore(res.page * res.pageSize < res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las alertas.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, page]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    return subscribeRealtime((ev) => {
      if (ev.event === "alert.created" || ev.event === "alert.updated") {
        void loadAlerts();
      }
    });
  }, [subscribeRealtime, loadAlerts]);

  const activeCount = items.filter(
    (a) => a.status === "pending_validation" || a.status === "pending",
  ).length;

  return (
    <>
      <PageMeta
        title="Alertas | SIV IA"
        description="Gestión y validación humana de alertas generadas por YOLO26n"
      />

      <div className="space-y-6">
        {/* Header estilo Mobile alerts/index.tsx */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-[var(--siv-fg)]">
                Alertas
              </h1>
              <span className="rounded-full border border-[#F0453F]/50 bg-[#F0453F]/15 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#F0453F]">
                {activeCount} Activas
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--siv-muted)]">
              {total} detecciones registradas • Validación humana en tiempo real
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3 py-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  wsState === "connected" ? "bg-[#00D68F] animate-pulse" : "bg-[#F58220]"
                }`}
              />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--siv-muted)]">
                {wsState === "connected" ? "Auto-sync" : wsState}
              </span>
            </div>

            <button
              type="button"
              onClick={() => void loadAlerts()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--siv-fg)] transition hover:bg-[var(--siv-surface-alt)]"
            >
              <RefreshCwIcon size={14} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Filtros estilo Mobile pills + selects */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { value: "", label: "Todas" },
              { value: "pending_validation", label: "Pendientes" },
              { value: "confirmed", label: "Confirmadas" },
              { value: "false_positive", label: "Falso positivo" },
            ].map((opt) => {
              const selected = statusFilter === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setStatusFilter(opt.value as AlertStatus | "");
                  }}
                  className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition ${
                    selected
                      ? "border-[#00D68F]/60 bg-[#00D68F]/15 font-semibold text-[#00A874] dark:text-[#00D68F]"
                      : "border-[var(--siv-border)] bg-[var(--siv-surface)] text-[var(--siv-muted)] hover:text-[var(--siv-fg)]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <select
            value={severityFilter}
            onChange={(e) => {
              setPage(1);
              setSeverityFilter(e.target.value as AlertSeverity | "");
            }}
            aria-label="Filtrar por severidad"
            className="h-10 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3.5 text-xs font-semibold text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
          >
            <option value="">Todas las severidades</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        {error ? (
          <div className="rounded-[20px] border border-[#F0453F]/50 bg-[#F0453F]/10 p-4 text-sm text-[#F0453F]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 animate-pulse rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <SivCard className="border-dashed py-14 text-center text-sm text-[var(--siv-muted)]">
            No hay alertas para los filtros seleccionados.
          </SivCard>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((alert) => (
              <Link
                key={alert.id}
                to={`/alerts/${alert.id}`}
                className="group overflow-hidden rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)] transition hover:border-[#00D68F]/50"
              >
                <ProtectedImage
                  src={alert.thumbnailUrl}
                  alt={alert.cameraName}
                  className="h-44 w-full"
                  boxes={alert.boundingBox ? [alert.boundingBox] : []}
                />
                <div className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-base font-bold text-[var(--siv-fg)] group-hover:text-[#00A874] dark:group-hover:text-[#00D68F]">
                      {yoloClassLabels[alert.primaryYoloClass] ?? alert.primaryYoloClass}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#00B4D8]">
                      {Math.round(alert.confidence * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <SeverityBadge severity={alert.severity} />
                    <AlertStatusBadge status={alert.status} />
                  </div>
                  <p className="mt-3 text-xs text-[var(--siv-fg)]/80">
                    {alert.cameraName} • {alert.location}
                  </p>
                  <div className="mt-2 flex items-center justify-between border-t border-[var(--siv-border)] pt-2.5">
                    <span className="font-mono text-[11px] text-[var(--siv-muted)]">
                      {formatDateTime(alert.detectedAt)}
                    </span>
                    <ChevronRightIcon
                      size={16}
                      className="text-[var(--siv-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[#00D68F]"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Protocolo de respuesta estilo Mobile ResponseProtocolCard */}
        <SivCard className="flex flex-wrap items-center justify-between gap-4 border-[#00D68F]/25 bg-[var(--siv-surface-alt)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00D68F]/40 bg-[#00D68F]/10 text-[#00A874] dark:text-[#00D68F]">
              <ShieldCheckIcon size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--siv-fg)]">
                Protocolo de respuesta activa
              </p>
              <p className="text-xs text-[var(--siv-muted)]">
                Toda alerta crítica debe ser verificada visualmente antes de activar despacho.
              </p>
            </div>
          </div>
          <span className="rounded-lg border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[#00A874] dark:text-[#00D68F]">
            COD-SEC-9
          </span>
        </SivCard>

        {total > 12 ? (
          <div className="flex items-center justify-between pt-2">
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
