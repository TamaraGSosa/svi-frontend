import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import { ProtectedImage } from "@/components/siv/ProtectedImage";
import {
  AlertStatusBadge,
  formatDateTime,
  SeverityBadge,
  WsStatusPill,
  yoloClassLabels,
} from "@/components/siv/StatusBadges";
import { SivBadge } from "@/components/siv/ui/SivBadge";
import { SivCard } from "@/components/siv/ui/SivCard";
import {
  ChevronRightIcon,
  ClockIcon,
  CpuIcon,
  MonitorPlayIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
  VideoIcon,
} from "@/components/siv/ui/SivIcons";
import { SivSectionTitle } from "@/components/siv/ui/SivSectionTitle";
import { useAuth } from "@/context/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import { detectionsService } from "@/services/detectionsService";
import type { DashboardSummary, YoloHealthResponse } from "@/types";

export default function SurveillanceDashboard() {
  const { wsState, subscribeRealtime } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [yoloHealth, setYoloHealth] = useState<YoloHealthResponse | null>(null);
  const [yoloError, setYoloError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard.");
    } finally {
      setLoading(false);
    }

    detectionsService
      .yoloHealth()
      .then((res) => {
        setYoloHealth(res);
        setYoloError(false);
      })
      .catch(() => {
        setYoloHealth(null);
        setYoloError(true);
      });
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    return subscribeRealtime((ev) => {
      if (
        ev.event === "alert.created" ||
        ev.event === "alert.updated" ||
        ev.event === "camera.status"
      ) {
        void loadData();
      }
    });
  }, [subscribeRealtime, loadData]);

  const online = summary?.online ?? false;
  const connectedCameras = summary?.connectedCameras ?? summary?.activeCameras ?? 0;
  const disconnectedCameras = summary?.disconnectedCameras ?? summary?.offlineCameras ?? 0;
  const inactiveCameras = summary?.inactiveCameras ?? 0;
  const totalCameras =
    summary?.totalCameras ?? connectedCameras + disconnectedCameras + inactiveCameras;
  const pendingAlerts = summary?.pendingAlerts ?? 0;
  const confirmedAlerts = summary?.confirmedAlerts ?? 0;
  const falsePositiveAlerts = summary?.falsePositiveAlerts ?? 0;
  const hasAlerts = pendingAlerts > 0;
  const recentDetections = summary?.recentDetections ?? [];

  return (
    <>
      <PageMeta
        title="Dashboard | SIV IA"
        description="Resumen operativo en tiempo real del Sistema de Videovigilancia Inteligente"
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--siv-fg)]">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-[var(--siv-muted)]">
              Resumen del sistema • Cámaras, alertas y detecciones YOLO26n en tiempo real
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <WsStatusPill state={wsState} />
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-widest ${
                yoloError
                  ? "border-[#F0453F]/40 bg-[#F0453F]/10 text-[#F0453F]"
                  : "border-[#00B4D8]/40 bg-[#00B4D8]/10 text-[#00B4D8]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${yoloError ? "bg-[#F0453F]" : "bg-[#00B4D8]"}`}
              />
              {yoloError ? "YOLO offline" : `YOLO ${yoloHealth?.status ?? "activo"}`}
            </span>
            <div className="hidden text-right sm:block">
              <p
                className={`font-mono text-[11px] font-semibold uppercase tracking-widest ${
                  error
                    ? "text-[#F0453F]"
                    : online
                      ? "text-[#00A874] dark:text-[#00D68F]"
                      : "text-[#F58220]"
                }`}
              >
                {error ? "Sin conexión" : online ? "Online" : "En espera"}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--siv-muted)]">
                WS: {wsState}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadData()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--siv-fg)] transition hover:bg-[var(--siv-surface-alt)]"
            >
              <RefreshCwIcon size={14} />
              Actualizar
            </button>
          </div>
        </div>

        {error ? (
          <SivCard className="border-[#F0453F]/50 bg-[#F0453F]/10 p-4">
            <p className="text-sm text-[#F0453F]">{error}</p>
            <button
              type="button"
              onClick={() => void loadData()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#F0453F]/40 bg-[var(--siv-surface)] px-3 py-1.5 font-mono text-[11px] text-[#F0453F]"
            >
              <RefreshCwIcon size={14} />
              Reintentar
            </button>
          </SivCard>
        ) : null}

        {loading && !summary ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-36 animate-pulse rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)]"
              />
            ))}
          </div>
        ) : summary ? (
          <>
            {/* KPIs principales */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SivCard>
                <div className="flex items-center justify-between">
                  <SivBadge
                    label={`● ${connectedCameras}/${totalCameras} Conectadas`}
                    variant="success"
                  />
                  <VideoIcon size={18} className="text-[var(--siv-muted)]" />
                </div>
                <p className="mt-4 text-4xl font-bold text-[var(--siv-fg)]">
                  {totalCameras}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--siv-fg)]">
                  Total de cámaras
                </p>
                <p className="mt-1 font-mono text-[11px] text-[var(--siv-muted)]">
                  {connectedCameras} conectadas • {disconnectedCameras} desconectadas •{" "}
                  {inactiveCameras} inactivas
                </p>
              </SivCard>

              <SivCard>
                <div className="flex items-center justify-between">
                  <SivBadge
                    label={hasAlerts ? "! Pendientes" : "✓ Seguro"}
                    variant={hasAlerts ? "danger" : "info"}
                  />
                  <TriangleAlertIcon size={18} className="text-[var(--siv-muted)]" />
                </div>
                <p className="mt-4 text-4xl font-bold text-[var(--siv-fg)]">
                  {pendingAlerts}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--siv-fg)]">
                  Alertas pendientes
                </p>
                <p className="mt-1 text-xs text-[var(--siv-muted)]">
                  {hasAlerts ? "Requieren validación humana" : "Sin incidentes pendientes"}
                </p>
              </SivCard>

              <SivCard>
                <div className="flex items-center justify-between">
                  <SivBadge label="VALIDADAS" variant="warning" />
                  <MonitorPlayIcon size={18} className="text-[var(--siv-muted)]" />
                </div>
                <p className="mt-4 text-4xl font-bold text-[var(--siv-fg)]">
                  {confirmedAlerts}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--siv-fg)]">
                  Alertas confirmadas
                </p>
                <p className="mt-1 font-mono text-[11px] text-[var(--siv-muted)]">
                  Falsos positivos descartados: {falsePositiveAlerts}
                </p>
              </SivCard>

              <SivCard>
                <div className="flex items-center justify-between">
                  <SivBadge label="HOY • YOLO26n" variant="info" />
                  <CpuIcon size={18} className="text-[var(--siv-muted)]" />
                </div>
                <p className="mt-4 text-4xl font-bold text-[#00B4D8]">
                  {summary.detectionsToday}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--siv-fg)]">
                  Detecciones del día
                </p>
                <p className="mt-1 text-xs text-[var(--siv-muted)]">
                  Procesadas por YOLO26n
                </p>
              </SivCard>
            </div>

            {/* Distribución horizontal Desktop: Alertas y Detecciones recientes (2/3) + Accesos rápidos (1/3) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <SivCard>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <SivSectionTitle title="Últimas alertas" />
                      <p className="mt-0.5 text-xs text-[var(--siv-muted)]">
                        Eventos recientes generados por el motor de reglas
                      </p>
                    </div>
                    <Link
                      to="/alerts"
                      className="inline-flex items-center gap-1 rounded-[12px] bg-gradient-to-r from-[#00D68F] to-[#00B4D8] px-3.5 py-2 text-xs font-semibold text-[#0B0F17] transition hover:brightness-105"
                    >
                      Ver todas
                      <ChevronRightIcon size={14} />
                    </Link>
                  </div>

                  {summary.recentAlerts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[var(--siv-border)] py-10 text-center text-sm text-[var(--siv-muted)]">
                      No hay alertas recientes registradas.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {summary.recentAlerts.map((alert) => (
                        <Link
                          key={alert.id}
                          to={`/alerts/${alert.id}`}
                          className="group flex flex-col gap-4 rounded-2xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] p-3.5 transition hover:border-[#00D68F]/50 sm:flex-row sm:items-center"
                        >
                          <ProtectedImage
                            src={alert.thumbnailUrl}
                            alt={alert.cameraName}
                            className="h-20 w-full shrink-0 rounded-xl sm:w-32"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-[var(--siv-fg)] group-hover:text-[#00A874] dark:group-hover:text-[#00D68F]">
                                {yoloClassLabels[alert.primaryYoloClass] ?? alert.primaryYoloClass}
                              </span>
                              <SeverityBadge severity={alert.severity} />
                              <AlertStatusBadge status={alert.status} />
                            </div>
                            <p className="mt-1 text-xs text-[var(--siv-fg)]/80">
                              {alert.cameraName} • {alert.location}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] text-[var(--siv-muted)]">
                              {formatDateTime(alert.detectedAt)} • Confianza{" "}
                              {Math.round(alert.confidence * 100)}%
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#00A874] dark:text-[#00D68F]">
                            Revisar
                            <ChevronRightIcon size={16} />
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </SivCard>

                {/* Detecciones recientes */}
                <SivCard>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <SivSectionTitle title="Detecciones recientes" />
                      <p className="mt-0.5 text-xs text-[var(--siv-muted)]">
                        Últimos objetos identificados por YOLO26n en las cámaras
                      </p>
                    </div>
                    <Link
                      to="/detections"
                      className="rounded-xl border border-[#00B4D8]/35 bg-[#00B4D8]/10 px-3.5 py-2 font-mono text-[11px] font-semibold text-[#00B4D8] transition hover:bg-[#00B4D8]/20"
                    >
                      Ver detecciones →
                    </Link>
                  </div>

                  {recentDetections.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[var(--siv-border)] py-8 text-center text-sm text-[var(--siv-muted)]">
                      No hay detecciones recientes registradas.
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--siv-border)]">
                      {recentDetections.map((det) => (
                        <div
                          key={det.id}
                          className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-[var(--siv-fg)]">
                              {yoloClassLabels[det.yoloClassName] ?? det.yoloClassName}
                            </span>
                            <span className="ml-2 text-[var(--siv-muted)]">
                              • {det.cameraName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="font-semibold text-[#00B4D8]">
                              {Math.round(det.confidence * 100)}%
                            </span>
                            <span className="text-[11px] text-[var(--siv-muted)]">
                              {formatDateTime(det.detectedAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SivCard>
              </div>

              {/* Columna derecha: Accesos rápidos + Estado Motor YOLO */}
              <div className="space-y-4">
                <SivSectionTitle title="Accesos rápidos" aside="Módulos principales" />

                <div className="space-y-3">
                  <Link
                    to="/monitoring"
                    className="flex items-center rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)] p-3.5 transition hover:border-[#00D68F]/50"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] text-[#00A874] dark:text-[#00D68F]">
                      <MonitorPlayIcon size={22} />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <p className="font-semibold text-[var(--siv-fg)]">Monitoreo</p>
                      <p className="mt-0.5 text-xs text-[var(--siv-muted)]">
                        Transmisión e inferencia en vivo
                      </p>
                    </div>
                    <ChevronRightIcon size={20} className="text-[var(--siv-muted)]" />
                  </Link>

                  <Link
                    to="/cameras"
                    className="flex items-center rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)] p-3.5 transition hover:border-[#00D68F]/50"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] text-[#00A874] dark:text-[#00D68F]">
                      <VideoIcon size={22} />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <p className="font-semibold text-[var(--siv-fg)]">Cámaras</p>
                      <p className="mt-0.5 text-xs text-[var(--siv-muted)]">
                        Alta, edición, estado y pruebas RTSP
                      </p>
                    </div>
                    <ChevronRightIcon size={20} className="text-[var(--siv-muted)]" />
                  </Link>

                  <Link
                    to="/alerts"
                    className="flex items-center rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)] p-3.5 transition hover:border-[#00D68F]/50"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] text-[#00A874] dark:text-[#00D68F]">
                      <TriangleAlertIcon size={22} />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <p className="font-semibold text-[var(--siv-fg)]">Alertas</p>
                      <p className="mt-0.5 text-xs text-[var(--siv-muted)]">
                        Validación humana de incidentes
                      </p>
                    </div>
                    <ChevronRightIcon size={20} className="text-[var(--siv-muted)]" />
                  </Link>

                  <Link
                    to="/history"
                    className="flex items-center rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)] p-3.5 transition hover:border-[#00D68F]/50"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] text-[#00A874] dark:text-[#00D68F]">
                      <ClockIcon size={22} />
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <p className="font-semibold text-[var(--siv-fg)]">Historial</p>
                      <p className="mt-0.5 text-xs text-[var(--siv-muted)]">
                        Decisiones y auditoría de eventos
                      </p>
                    </div>
                    <ChevronRightIcon size={20} className="text-[var(--siv-muted)]" />
                  </Link>

                  <SivCard className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--siv-muted)]">
                        Motor de Inferencia
                      </span>
                      <SivBadge
                        label={yoloError ? "OFFLINE" : yoloHealth?.status ?? "ACTIVO"}
                        variant={yoloError ? "danger" : "info"}
                      />
                    </div>
                    <p className="mt-2.5 text-sm font-semibold text-[var(--siv-fg)]">
                      YOLO26n • Detección de objetos
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-[var(--siv-muted)]">
                      Clases: knife, scissors, box_cutter, lighter
                    </p>
                  </SivCard>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
