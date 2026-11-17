import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import { ProtectedImage } from "@/components/siv/ProtectedImage";
import { CameraStatusBadge } from "@/components/siv/StatusBadges";
import { SivBadge } from "@/components/siv/ui/SivBadge";
import { SivCard } from "@/components/siv/ui/SivCard";
import { MonitorPlayIcon, RefreshCwIcon, VideoIcon } from "@/components/siv/ui/SivIcons";
import { useAuth } from "@/context/AuthContext";
import { camerasService, monitoringService } from "@/services/camerasService";
import type { MonitoringCamera, MonitoringStreamInfo } from "@/types";

export default function LiveMonitoringPage() {
  const { user, subscribeRealtime } = useAuth();
  const canControl = user?.role === "admin" || user?.role === "supervisor";

  const [cameras, setCameras] = useState<MonitoringCamera[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid");
  const [streamInfo, setStreamInfo] = useState<MonitoringStreamInfo | null>(null);
  const [tick, setTick] = useState<number>(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMonitoring = useCallback(async () => {
    setError(null);
    try {
      const list = await monitoringService.listAvailable();
      setCameras(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].cameraId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las cámaras para monitoreo.");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    void loadMonitoring();
  }, [loadMonitoring]);

  useEffect(() => {
    return subscribeRealtime((ev) => {
      if (ev.event === "camera.status") {
        void loadMonitoring();
      }
    });
  }, [subscribeRealtime, loadMonitoring]);

  // Refresco periódico de snapshots para cámaras en estado 'monitoreando'
  useEffect(() => {
    const anyStreaming = cameras.some((c) => c.monitoringStatus === "monitoreando");
    if (!anyStreaming) return;
    const timer = window.setInterval(() => {
      setTick(Date.now());
    }, 2000);
    return () => window.clearInterval(timer);
  }, [cameras]);

  useEffect(() => {
    if (!selectedId) {
      setStreamInfo(null);
      return;
    }
    monitoringService
      .getStreamInfo(selectedId)
      .then(setStreamInfo)
      .catch(() => setStreamInfo(null));
  }, [selectedId, cameras]);

  const handleToggleMonitoring = async (cam: MonitoringCamera) => {
    setBusyId(cam.cameraId);
    setError(null);
    try {
      if (cam.monitoringStatus === "monitoreando") {
        await monitoringService.stop(cam.cameraId);
      } else {
        await monitoringService.start(cam.cameraId);
        setTick(Date.now());
      }
      await loadMonitoring();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el estado de monitoreo.");
    } finally {
      setBusyId(null);
    }
  };

  const streamingCount = cameras.filter((c) => c.monitoringStatus === "monitoreando").length;
  const visibleCameras =
    viewMode === "single" && selectedId
      ? cameras.filter((c) => c.cameraId === selectedId)
      : cameras;

  return (
    <>
      <PageMeta
        title="Monitoreo en Vivo | SIV IA"
        description="Centro de monitoreo multi-cámara e individual en tiempo real"
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-[var(--siv-fg)]">
                Monitoreo
              </h1>
              <SivBadge
                label={`${streamingCount}/${cameras.length} Monitoreando`}
                variant={streamingCount > 0 ? "success" : "neutral"}
              />
            </div>
            <p className="mt-1 text-sm text-[var(--siv-muted)]">
              Visualización individual y múltiple • Captura continua e inferencia YOLO26n
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg px-3 py-1.5 font-mono text-[11px] font-semibold uppercase transition ${
                  viewMode === "grid"
                    ? "bg-[#00D68F] text-[#0B0F17]"
                    : "text-[var(--siv-muted)] hover:text-[var(--siv-fg)]"
                }`}
              >
                Mosaico
              </button>
              <button
                type="button"
                onClick={() => setViewMode("single")}
                className={`rounded-lg px-3 py-1.5 font-mono text-[11px] font-semibold uppercase transition ${
                  viewMode === "single"
                    ? "bg-[#00D68F] text-[#0B0F17]"
                    : "text-[var(--siv-muted)] hover:text-[var(--siv-fg)]"
                }`}
              >
                Individual
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setTick(Date.now());
                void loadMonitoring();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--siv-fg)] transition hover:bg-[var(--siv-surface-alt)]"
            >
              <RefreshCwIcon size={14} />
              Actualizar
            </button>

            <Link
              to="/cameras"
              className="rounded-[12px] bg-gradient-to-r from-[#00D68F] to-[#00B4D8] px-4 py-2 text-xs font-semibold text-[#0B0F17] transition hover:brightness-105"
            >
              Administrar / + Nueva cámara
            </Link>
          </div>
        </div>

        {viewMode === "single" && cameras.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {cameras.map((cam) => (
              <button
                key={cam.cameraId}
                type="button"
                onClick={() => setSelectedId(cam.cameraId)}
                className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition ${
                  selectedId === cam.cameraId
                    ? "border-[#00D68F]/60 bg-[#00D68F]/15 font-semibold text-[#00A874] dark:text-[#00D68F]"
                    : "border-[var(--siv-border)] bg-[var(--siv-surface)] text-[var(--siv-muted)]"
                }`}
              >
                {cam.code} • {cam.name}
              </button>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[20px] border border-[#F0453F]/50 bg-[#F0453F]/10 p-4 text-sm text-[#F0453F]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="aspect-video animate-pulse rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)]"
              />
            ))}
          </div>
        ) : cameras.length === 0 ? (
          <SivCard className="border-dashed py-14 text-center">
            <VideoIcon size={32} className="mx-auto text-[var(--siv-muted)]" />
            <p className="mt-3 text-sm font-semibold text-[var(--siv-fg)]">
              No hay cámaras activas disponibles para monitoreo
            </p>
            <p className="mt-1 text-xs text-[var(--siv-muted)]">
              Registrá o activá una cámara desde el módulo de Cámaras para comenzar a monitorear.
            </p>
            <Link
              to="/cameras"
              className="mt-4 inline-flex rounded-xl bg-[#00D68F] px-4 py-2 text-xs font-bold text-[#0B0F17]"
            >
              Ir a Cámaras
            </Link>
          </SivCard>
        ) : (
          <div
            className={
              viewMode === "single"
                ? "grid grid-cols-1 gap-6 lg:grid-cols-3"
                : "grid grid-cols-1 gap-5 md:grid-cols-2"
            }
          >
            <div
              className={
                viewMode === "single"
                  ? "space-y-4 lg:col-span-2"
                  : "col-span-full grid grid-cols-1 gap-5 md:grid-cols-2"
              }
            >
              {visibleCameras.map((cam) => {
                const isStreaming = cam.monitoringStatus === "monitoreando";
                return (
                  <SivCard
                    key={cam.cameraId}
                    onClick={() => setSelectedId(cam.cameraId)}
                    className={`cursor-pointer overflow-hidden p-4 transition ${
                      selectedId === cam.cameraId
                        ? "border-[#00D68F]/60"
                        : "hover:border-[#00D68F]/35"
                    }`}
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#00A874] dark:text-[#00D68F]">
                            {cam.code}
                          </span>
                          <span className="font-semibold text-[var(--siv-fg)]">{cam.name}</span>
                          {cam.isSimulated ? <SivBadge label="SIMULADA" variant="info" /> : null}
                        </div>
                        <p className="text-xs text-[var(--siv-muted)]">{cam.location}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <CameraStatusBadge status={cam.connectionStatus} />
                        <SivBadge
                          label={isStreaming ? "MONITOREANDO" : "DETENIDO"}
                          variant={isStreaming ? "success" : "neutral"}
                        />
                      </div>
                    </div>

                    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-[#1E293B] bg-[#0B0F17]">
                      {isStreaming ? (
                        <ProtectedImage
                          src={camerasService.getSnapshotUrl(cam.cameraId, tick)}
                          alt={cam.name}
                          className="h-full w-full"
                        />
                      ) : (
                        <div className="flex flex-col items-center px-4 text-center text-xs text-slate-400">
                          <MonitorPlayIcon size={28} className="mb-2 text-slate-500" />
                          <p className="font-semibold text-slate-300">Monitoreo detenido</p>
                          <p className="mt-0.5 text-[11px]">
                            Iniciá el monitoreo para capturar fotogramas y evaluar con YOLO26n.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-[11px] text-[var(--siv-muted)]">
                        {cam.resolution} • {cam.fps} FPS • Frames: {cam.framesCaptured} (YOLO:{" "}
                        {cam.framesProcessed})
                      </span>

                      <div className="flex items-center gap-2">
                        {canControl ? (
                          <button
                            type="button"
                            disabled={busyId === cam.cameraId}
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleToggleMonitoring(cam);
                            }}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                              isStreaming
                                ? "border border-[#F58220]/40 bg-[#F58220]/15 text-[#F58220]"
                                : "bg-[#00D68F] text-[#0B0F17]"
                            }`}
                          >
                            {isStreaming ? "Detener monitoreo" : "Iniciar monitoreo"}
                          </button>
                        ) : null}
                        <Link
                          to={`/cameras/${cam.cameraId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-xs font-semibold text-[#00B4D8] hover:underline"
                        >
                          Detalle →
                        </Link>
                      </div>
                    </div>
                  </SivCard>
                );
              })}
            </div>

            {viewMode === "single" && streamInfo ? (
              <SivCard className="space-y-3 self-start">
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--siv-muted)]">
                  Información de Reproducción Web
                </h2>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-[var(--siv-muted)]">Estado monitoreo</dt>
                    <dd className="font-mono font-semibold uppercase text-[var(--siv-fg)]">
                      {streamInfo.monitoringStatus}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--siv-muted)]">Protocolo origen</dt>
                    <dd className="font-mono font-semibold uppercase text-[#00B4D8]">
                      {streamInfo.protocol ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--siv-muted)]">Compatible nativo Web</dt>
                    <dd className="font-semibold text-[var(--siv-fg)]">
                      {streamInfo.webCompatible ? "Sí (HLS/WebRTC/MJPEG)" : "Requiere gateway / Snapshot"}
                    </dd>
                  </div>
                </dl>
                <p className="rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] p-3 text-[11px] text-[var(--siv-muted)]">
                  {streamInfo.webDeliveryNote}
                </p>
              </SivCard>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
