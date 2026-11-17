import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import { ProtectedImage } from "@/components/siv/ProtectedImage";
import { CameraStatusBadge, formatDateTime } from "@/components/siv/StatusBadges";
import { SivBadge } from "@/components/siv/ui/SivBadge";
import { SivCard } from "@/components/siv/ui/SivCard";
import { useAuth } from "@/context/AuthContext";
import { camerasService } from "@/services/camerasService";
import type { Camera } from "@/types";

export default function CameraDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "supervisor";

  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshotTick, setSnapshotTick] = useState<number>(0);
  const [streamBusy, setStreamBusy] = useState(false);

  const loadCamera = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const data = await camerasService.getById(id);
      setCamera(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la cámara.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadCamera();
  }, [loadCamera]);

  useEffect(() => {
    if (!camera?.streamActive) return;
    const timer = window.setInterval(() => {
      setSnapshotTick(Date.now());
    }, 2000);
    return () => window.clearInterval(timer);
  }, [camera?.streamActive]);

  const handleToggleStream = async () => {
    if (!camera) return;
    setStreamBusy(true);
    setError(null);
    try {
      if (camera.streamActive) {
        await camerasService.disconnect(camera.id);
      } else {
        await camerasService.connect(camera.id);
        setSnapshotTick(Date.now());
      }
      await loadCamera();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el estado de conexión.");
    } finally {
      setStreamBusy(false);
    }
  };

  return (
    <>
      <PageMeta
        title={camera ? `${camera.name} | SIV IA` : "Detalle de Cámara | SIV IA"}
        description="Detalle operativo, telemetría y vista previa de transmisión de la cámara"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/cameras"
            className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00A874] hover:underline dark:text-[#00D68F]"
          >
            ← Volver a Cámaras
          </Link>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)]" />
        ) : error && !camera ? (
          <div className="rounded-[20px] border border-[#F0453F]/40 bg-[#F0453F]/10 p-4 text-sm text-[#F0453F]">
            {error}
          </div>
        ) : camera ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Visor de transmisión */}
            <div className="space-y-6 lg:col-span-2">
              <SivCard>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-semibold text-[#00A874] dark:text-[#00D68F]">
                      {camera.code}
                    </span>
                    <h1 className="text-xl font-bold text-[var(--siv-fg)]">{camera.name}</h1>
                    <p className="text-xs text-[var(--siv-muted)]">{camera.location}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {camera.isSimulated ? <SivBadge label="SIMULADA" variant="info" /> : null}
                    {camera.streamActive ? <SivBadge label="STREAM ACTIVO" variant="success" /> : null}
                    <CameraStatusBadge status={camera.status} />
                    {canManage && (camera.sourceUri || camera.stream?.url) ? (
                      <button
                        type="button"
                        disabled={streamBusy}
                        onClick={() => void handleToggleStream()}
                        className="rounded-xl border border-[#00D68F]/40 bg-[#00D68F]/10 px-3 py-1.5 text-xs font-semibold text-[#00A874] dark:text-[#00D68F] disabled:opacity-50"
                      >
                        {camera.streamActive ? "Desconectar stream" : "Conectar stream"}
                      </button>
                    ) : null}
                  </div>
                </div>

                {error ? (
                  <div className="mb-3 rounded-xl border border-[#F0453F]/40 bg-[#F0453F]/10 p-3 text-xs text-[#F0453F]">
                    {error}
                  </div>
                ) : null}

                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-[#1E293B] bg-[#0B0F17]">
                  {camera.streamActive || snapshotTick > 0 ? (
                    <ProtectedImage
                      src={camerasService.getSnapshotUrl(camera.id, snapshotTick)}
                      alt={`Vista previa ${camera.name}`}
                      className="h-full w-full"
                    />
                  ) : camera.stream?.url ? (
                    <div className="text-center text-xs text-slate-300">
                      <p className="font-semibold text-[#00D68F]">
                        Stream configurado ({camera.stream.protocol.toUpperCase()})
                      </p>
                      <p className="mt-1 break-all px-4 font-mono text-[11px] text-slate-400">
                        {camera.stream.url}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSnapshotTick(Date.now())}
                        className="mt-3 rounded-xl border border-[#00D68F]/40 bg-[#00D68F]/10 px-3 py-1.5 text-xs font-semibold text-[#00D68F]"
                      >
                        Capturar vista previa
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-slate-400">
                      <p className="font-semibold text-slate-300">
                        Sin stream en vivo configurado
                      </p>
                      <p className="mt-1">
                        Editá la cámara para configurar su URL RTSP o iniciá el monitoreo desde el módulo de Monitoreo.
                      </p>
                    </div>
                  )}
                </div>
              </SivCard>
            </div>

            {/* Telemetría */}
            <div className="space-y-4">
              <SivCard>
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--siv-muted)]">
                  Telemetría de cámara
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--siv-muted)]">Host / IP</dt>
                    <dd className="font-mono font-semibold text-[var(--siv-fg)]">
                      {camera.host ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--siv-muted)]">Resolución</dt>
                    <dd className="font-semibold text-[var(--siv-fg)]">{camera.resolution}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--siv-muted)]">FPS</dt>
                    <dd className="font-semibold text-[var(--siv-fg)]">{camera.fps}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--siv-muted)]">Frecuencia YOLO</dt>
                    <dd className="font-mono font-semibold text-[#00B4D8]">
                      {camera.processingIntervalSeconds ?? 2}s
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--siv-muted)]">Latencia</dt>
                    <dd className="font-semibold text-[var(--siv-fg)]">
                      {camera.latencyMs != null ? `${camera.latencyMs} ms` : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--siv-muted)]">Detecciones hoy</dt>
                    <dd className="font-mono font-semibold text-[#00B4D8]">
                      {camera.detectionsToday}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--siv-muted)]">Última detección</dt>
                    <dd className="text-right font-mono text-xs text-[var(--siv-muted)]">
                      {formatDateTime(camera.lastDetectionAt)}
                    </dd>
                  </div>
                </dl>
              </SivCard>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
