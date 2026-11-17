import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import { CameraStatusBadge, formatDateTime } from "@/components/siv/StatusBadges";
import { SivBadge } from "@/components/siv/ui/SivBadge";
import { SivCard } from "@/components/siv/ui/SivCard";
import { RefreshCwIcon, SearchIcon } from "@/components/siv/ui/SivIcons";
import { useAuth } from "@/context/AuthContext";
import { camerasService } from "@/services/camerasService";
import type {
  Camera,
  CameraCreatePayload,
  CameraDiscoverResponse,
  CameraStatus,
  CameraTestConnectionResponse,
  DiscoveredCamera,
  StreamProtocol,
} from "@/types";

export default function CameraMonitoringPage() {
  const { user, subscribeRealtime } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "supervisor";
  const isAdmin = user?.role === "admin";

  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<CameraStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [busyCameraId, setBusyCameraId] = useState<string | null>(null);

  // Modal de alta / edición manual RTSP
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("554");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<CameraStatus>("offline");
  const [resolution, setResolution] = useState("1080p FHD");
  const [fps, setFps] = useState("24");
  const [processingInterval, setProcessingInterval] = useState("2.0");
  const [streamProtocol, setStreamProtocol] = useState<StreamProtocol | "">("rtsp");
  const [streamUrl, setStreamUrl] = useState("");
  const [isSimulated, setIsSimulated] = useState(false);
  const [validateConnection, setValidateConnection] = useState(false);
  const [onvifXaddrs, setOnvifXaddrs] = useState("");
  const [onvifProfileToken, setOnvifProfileToken] = useState("");

  // Prueba de conexión dentro del modal
  const [testingConn, setTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<CameraTestConnectionResponse | null>(null);

  // Modal de descubrimiento ONVIF / Simulado
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [discoverSim, setDiscoverSim] = useState(true);
  const [discoverUser, setDiscoverUser] = useState("");
  const [discoverPass, setDiscoverPass] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [discoverResult, setDiscoverResult] = useState<CameraDiscoverResponse | null>(null);
  const [discoverTestMap, setDiscoverTestMap] = useState<
    Record<string, CameraTestConnectionResponse>
  >({});

  const loadCameras = useCallback(async () => {
    setError(null);
    try {
      const list = await camerasService.list();
      setCameras(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las cámaras.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCameras();
  }, [loadCameras]);

  useEffect(() => {
    return subscribeRealtime((ev) => {
      if (ev.event === "camera.status") {
        setCameras((prev) =>
          prev.map((cam) =>
            cam.id === ev.data.id
              ? { ...cam, status: ev.data.status, latencyMs: ev.data.latencyMs ?? cam.latencyMs }
              : cam,
          ),
        );
      }
    });
  }, [subscribeRealtime]);

  const resetModalFields = () => {
    setCode("");
    setName("");
    setLocation("");
    setManufacturer("");
    setModel("");
    setHost("");
    setPort("554");
    setUsername("");
    setPassword("");
    setStatus("offline");
    setResolution("1080p FHD");
    setFps("24");
    setProcessingInterval("2.0");
    setStreamProtocol("rtsp");
    setStreamUrl("");
    setIsSimulated(false);
    setValidateConnection(false);
    setOnvifXaddrs("");
    setOnvifProfileToken("");
    setFormError(null);
    setTestResult(null);
  };

  const openCreateModal = () => {
    setEditingCamera(null);
    resetModalFields();
    setModalOpen(true);
  };

  const openRegisterFromDiscovery = (dev: DiscoveredCamera) => {
    setEditingCamera(null);
    resetModalFields();
    const firstProfile = dev.profiles[0];
    setCode(`CAM-${dev.ip.split(".").pop() ?? "01"}`);
    setName(dev.name);
    setLocation("Red local");
    setManufacturer(dev.manufacturer ?? "");
    setModel(dev.model ?? "");
    setHost(dev.ip);
    setPort(String(dev.port || 554));
    setUsername(discoverUser);
    setPassword(discoverPass);
    setStreamProtocol("rtsp");
    setStreamUrl(firstProfile?.rtspUrl ?? "");
    setResolution(firstProfile?.resolution ?? "1080p FHD");
    setFps(String(firstProfile?.fps ?? 24));
    setIsSimulated(dev.isSimulated);
    setValidateConnection(true);
    setOnvifXaddrs(dev.xaddrs);
    setOnvifProfileToken(firstProfile?.token ?? "");
    setDiscoverOpen(false);
    setModalOpen(true);
  };

  const openEditModal = (cam: Camera) => {
    setEditingCamera(cam);
    setCode(cam.code);
    setName(cam.name);
    setLocation(cam.location);
    setManufacturer(cam.manufacturer ?? "");
    setModel(cam.model ?? "");
    setHost(cam.host ?? "");
    setPort(cam.port ? String(cam.port) : "554");
    setUsername("");
    setPassword("");
    setStatus(cam.status);
    setResolution(cam.resolution);
    setFps(String(cam.fps));
    setProcessingInterval(String(cam.processingIntervalSeconds ?? 2.0));
    setStreamProtocol(cam.stream?.protocol ?? "");
    setStreamUrl(cam.sourceUri ?? cam.stream?.url ?? "");
    setIsSimulated(Boolean(cam.isSimulated));
    setValidateConnection(false);
    setOnvifXaddrs("");
    setOnvifProfileToken("");
    setFormError(null);
    setTestResult(null);
    setModalOpen(true);
  };

  const handleTestInModal = async () => {
    if (!streamUrl.trim()) {
      setFormError("Ingresá la URL RTSP o de stream antes de probar la conexión.");
      return;
    }
    setFormError(null);
    setTestingConn(true);
    setTestResult(null);
    try {
      const res = await camerasService.testConnection({
        url: streamUrl.trim(),
        username: username.trim() || undefined,
        password: password || undefined,
        isSimulated: isSimulated || streamUrl.trim().toLowerCase().startsWith("sim://"),
      });
      setTestResult(res);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al probar la conexión.");
    } finally {
      setTestingConn(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const fpsNum = Math.max(1, Math.min(120, Number(fps) || 24));
      const intervalNum = Math.max(0.5, Math.min(60, Number(processingInterval) || 2.0));
      const portNum = port ? Number(port) : null;

      if (editingCamera) {
        await camerasService.update(editingCamera.id, {
          name: name.trim(),
          location: location.trim(),
          manufacturer: manufacturer.trim() || null,
          model: model.trim() || null,
          host: host.trim() || null,
          port: portNum,
          username: username.trim() || undefined,
          password: password || undefined,
          status,
          resolution: resolution.trim(),
          fps: fpsNum,
          processingIntervalSeconds: intervalNum,
          isSimulated,
          streamProtocol: streamProtocol || null,
          streamUrl: streamUrl.trim() || null,
          sourceUri: streamUrl.trim() || null,
        });
      } else {
        const payload: CameraCreatePayload = {
          code: code.trim(),
          name: name.trim(),
          location: location.trim(),
          manufacturer: manufacturer.trim() || null,
          model: model.trim() || null,
          host: host.trim() || null,
          port: portNum,
          username: username.trim() || null,
          password: password || null,
          status,
          isSimulated,
          resolution: resolution.trim(),
          fps: fpsNum,
          processingIntervalSeconds: intervalNum,
          streamProtocol: streamProtocol || null,
          streamUrl: streamUrl.trim() || null,
          sourceUri: streamUrl.trim() || null,
          onvifXaddrs: onvifXaddrs || null,
          onvifProfileToken: onvifProfileToken || null,
          validateConnection,
        };
        await camerasService.create(payload);
      }
      setModalOpen(false);
      await loadCameras();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar la cámara.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscover = async (e: FormEvent) => {
    e.preventDefault();
    setDiscovering(true);
    setDiscoverError(null);
    setDiscoverTestMap({});
    try {
      const res = await camerasService.discover({
        simulate: discoverSim,
        username: discoverUser.trim() || undefined,
        password: discoverPass || undefined,
        timeoutSeconds: 4.0,
        maxDevices: 20,
      });
      setDiscoverResult(res);
    } catch (err) {
      setDiscoverError(err instanceof Error ? err.message : "Error al buscar cámaras.");
    } finally {
      setDiscovering(false);
    }
  };

  const handleTestDiscovered = async (dev: DiscoveredCamera) => {
    const rtspUrl = dev.profiles[0]?.rtspUrl;
    if (!rtspUrl) return;
    try {
      const res = await camerasService.testConnection({
        url: rtspUrl,
        username: discoverUser.trim() || undefined,
        password: discoverPass || undefined,
        isSimulated: dev.isSimulated,
      });
      setDiscoverTestMap((prev) => ({ ...prev, [dev.deviceId]: res }));
    } catch (err) {
      setDiscoverTestMap((prev) => ({
        ...prev,
        [dev.deviceId]: {
          success: false,
          message: err instanceof Error ? err.message : "Error de conexión",
          isSimulated: dev.isSimulated,
        },
      }));
    }
  };

  const handleConnectToggle = async (cam: Camera) => {
    setBusyCameraId(cam.id);
    setActionMsg(null);
    setError(null);
    try {
      if (cam.streamActive) {
        await camerasService.disconnect(cam.id);
        setActionMsg(`Transmisión detenida para ${cam.name}.`);
      } else {
        await camerasService.connect(cam.id);
        setActionMsg(`Transmisión iniciada para ${cam.name}.`);
      }
      await loadCameras();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el estado del stream.");
    } finally {
      setBusyCameraId(null);
    }
  };

  const handleTestRegistered = async (cam: Camera) => {
    setBusyCameraId(cam.id);
    setActionMsg(null);
    setError(null);
    try {
      const res = await camerasService.testRegistered(cam.id);
      if (res.success) {
        setActionMsg(`${cam.name}: ${res.message} (${res.latencyMs ?? 0} ms)`);
      } else {
        setError(`${cam.name}: ${res.message}`);
      }
      await loadCameras();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al probar cámara.");
    } finally {
      setBusyCameraId(null);
    }
  };

  const handleToggleActive = async (cam: Camera) => {
    setBusyCameraId(cam.id);
    setActionMsg(null);
    setError(null);
    try {
      const nextActive = cam.isActive === false;
      await camerasService.setActive(cam.id, nextActive);
      setActionMsg(
        `Cámara ${cam.name} ${nextActive ? "activada" : "desactivada"} operativamente.`,
      );
      await loadCameras();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el estado operativo.");
    } finally {
      setBusyCameraId(null);
    }
  };

  const handleDelete = async (cam: Camera) => {
    if (!window.confirm(`¿Dar de baja la cámara "${cam.name}" (${cam.code})?`)) return;
    try {
      await camerasService.remove(cam.id);
      await loadCameras();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la cámara.");
    }
  };

  const filtered = cameras.filter((cam) => {
    if (filterStatus !== "all" && cam.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        cam.name.toLowerCase().includes(q) ||
        cam.code.toLowerCase().includes(q) ||
        cam.location.toLowerCase().includes(q) ||
        (cam.host ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <PageMeta
        title="Administración y Monitoreo de Cámaras | SIV IA"
        description="Descubrimiento ONVIF, registro RTSP, simulación y supervisión de cámaras"
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--siv-fg)]">
              Administración de Cámaras
            </h1>
            <p className="mt-1 text-sm text-[var(--siv-muted)]">
              {cameras.length} cámaras registradas • Descubrimiento ONVIF, RTSP y simulación
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void loadCameras()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--siv-fg)] transition hover:bg-[var(--siv-surface-alt)]"
            >
              <RefreshCwIcon size={14} />
              Actualizar
            </button>
            {canManage ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDiscoverError(null);
                    setDiscoverOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#00B4D8]/40 bg-[#00B4D8]/10 px-4 py-2 text-xs font-semibold text-[#00B4D8] transition hover:bg-[#00B4D8]/20"
                >
                  <SearchIcon size={14} />
                  Buscar cámaras en la red
                </button>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="rounded-[12px] bg-gradient-to-r from-[#00D68F] to-[#00B4D8] px-4 py-2 text-xs font-semibold text-[#0B0F17] transition hover:brightness-105"
                >
                  + Agregar cámara
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código, ubicación o IP..."
            className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-4 py-2.5 text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F] sm:w-80"
          />
          <div className="flex flex-wrap gap-1.5">
            {(["all", "online", "offline", "error"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition ${
                  filterStatus === st
                    ? "border-[#00D68F]/60 bg-[#00D68F]/15 font-semibold text-[#00A874] dark:text-[#00D68F]"
                    : "border-[var(--siv-border)] bg-[var(--siv-surface)] text-[var(--siv-muted)]"
                }`}
              >
                {st === "all"
                  ? "Todas"
                  : st === "online"
                    ? "En línea"
                    : st === "offline"
                      ? "Offline"
                      : "Error"}
              </button>
            ))}
          </div>
        </div>

        {actionMsg ? (
          <div className="rounded-[20px] border border-[#00D68F]/40 bg-[#00D68F]/10 p-4 text-sm text-[#00A874] dark:text-[#00D68F]">
            {actionMsg}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[20px] border border-[#F0453F]/40 bg-[#F0453F]/10 p-4 text-sm text-[#F0453F]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-56 animate-pulse rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)]"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <SivCard className="border-dashed py-14 text-center text-sm text-[var(--siv-muted)]">
            No se encontraron cámaras con los filtros actuales.
          </SivCard>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((cam) => (
              <SivCard
                key={cam.id}
                className="flex flex-col justify-between transition hover:border-[#00D68F]/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#00A874] dark:text-[#00D68F]">
                          {cam.code}
                        </span>
                        {cam.isActive === false ? (
                          <SivBadge label="INACTIVA" variant="warning" />
                        ) : null}
                        {cam.isSimulated ? <SivBadge label="SIMULADA" variant="info" /> : null}
                        {cam.streamActive ? <SivBadge label="STREAM ACTIVO" variant="success" /> : null}
                      </div>
                      <h2 className="mt-1 text-base font-bold text-[var(--siv-fg)]">
                        {cam.name}
                      </h2>
                      <p className="text-xs text-[var(--siv-muted)]">{cam.location}</p>
                    </div>
                    <CameraStatusBadge status={cam.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] p-3 text-xs">
                    <div>
                      <span className="text-[var(--siv-muted)]">Host / IP:</span>{" "}
                      <span className="font-mono font-semibold text-[var(--siv-fg)]">
                        {cam.host ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--siv-muted)]">Protocolo:</span>{" "}
                      <span className="font-mono font-semibold uppercase text-[var(--siv-fg)]">
                        {cam.stream?.protocol ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--siv-muted)]">Frec. YOLO:</span>{" "}
                      <span className="font-mono font-semibold text-[#00B4D8]">
                        {cam.processingIntervalSeconds ?? 2}s
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--siv-muted)]">Detec. hoy:</span>{" "}
                      <span className="font-mono font-semibold text-[#00D68F]">
                        {cam.detectionsToday}
                      </span>
                    </div>
                  </div>

                  {cam.manufacturer || cam.model ? (
                    <p className="mt-2 text-[11px] text-[var(--siv-muted)]">
                      {[cam.manufacturer, cam.model].filter(Boolean).join(" • ")}
                    </p>
                  ) : null}

                  {cam.lastError ? (
                    <p className="mt-1.5 text-[11px] text-[#F0453F]">{cam.lastError}</p>
                  ) : cam.lastDetectionAt ? (
                    <p className="mt-1.5 text-[11px] text-[var(--siv-muted)]">
                      Última detección: {formatDateTime(cam.lastDetectionAt)}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--siv-border)] pt-3">
                  <Link
                    to={`/cameras/${cam.id}`}
                    className="font-mono text-xs font-bold text-[#00A874] hover:underline dark:text-[#00D68F]"
                  >
                    Vista previa / Detalle →
                  </Link>

                  {canManage ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        disabled={busyCameraId === cam.id}
                        onClick={() => void handleConnectToggle(cam)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
                          cam.streamActive
                            ? "border border-[#F58220]/40 bg-[#F58220]/10 text-[#F58220]"
                            : "border border-[#00D68F]/40 bg-[#00D68F]/10 text-[#00A874] dark:text-[#00D68F]"
                        }`}
                      >
                        {cam.streamActive ? "Desconectar" : "Conectar"}
                      </button>
                      <button
                        type="button"
                        disabled={busyCameraId === cam.id}
                        onClick={() => void handleTestRegistered(cam)}
                        className="rounded-lg border border-[var(--siv-border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--siv-fg)] hover:bg-[var(--siv-surface-alt)] disabled:opacity-50"
                      >
                        Probar
                      </button>
                      <button
                        type="button"
                        disabled={busyCameraId === cam.id}
                        onClick={() => void handleToggleActive(cam)}
                        className="rounded-lg border border-[var(--siv-border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--siv-fg)] hover:bg-[var(--siv-surface-alt)] disabled:opacity-50"
                      >
                        {cam.isActive === false ? "Activar" : "Desactivar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(cam)}
                        className="rounded-lg border border-[var(--siv-border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--siv-fg)] hover:bg-[var(--siv-surface-alt)]"
                      >
                        Editar
                      </button>
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => void handleDelete(cam)}
                          className="rounded-lg border border-[#F0453F]/30 px-2.5 py-1 text-[11px] font-semibold text-[#F0453F] hover:bg-[#F0453F]/10"
                        >
                          Eliminar
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </SivCard>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Descubrimiento ONVIF / Simulado */}
      {discoverOpen ? (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[24px] border border-[var(--siv-border)] bg-[var(--siv-surface)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--siv-fg)]">
                  Buscar cámaras en la red (ONVIF)
                </h2>
                <p className="mt-1 text-xs text-[var(--siv-muted)]">
                  Los dispositivos encontrados se muestran para revisión y no se registran automáticamente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDiscoverOpen(false)}
                className="rounded-lg border border-[var(--siv-border)] px-2.5 py-1 text-xs text-[var(--siv-muted)] hover:text-[var(--siv-fg)]"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleDiscover} className="mt-4 space-y-3 rounded-2xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--siv-fg)]">
                  <input
                    type="checkbox"
                    checked={discoverSim}
                    onChange={(e) => setDiscoverSim(e.target.checked)}
                    className="h-4 w-4 accent-[#00D68F]"
                  />
                  Usar simulador sin hardware (para pruebas sin cámara física)
                </label>
                <button
                  type="submit"
                  disabled={discovering}
                  className="rounded-[12px] bg-gradient-to-r from-[#00D68F] to-[#00B4D8] px-4 py-2 text-xs font-semibold text-[#0B0F17] disabled:opacity-50"
                >
                  {discovering ? "Buscando..." : "Iniciar búsqueda"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={discoverUser}
                  onChange={(e) => setDiscoverUser(e.target.value)}
                  placeholder="Usuario ONVIF (opcional)"
                  className="rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3 py-2 text-xs text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                />
                <input
                  type="password"
                  value={discoverPass}
                  onChange={(e) => setDiscoverPass(e.target.value)}
                  placeholder="Contraseña ONVIF (opcional)"
                  className="rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3 py-2 text-xs text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                />
              </div>
            </form>

            {discoverError ? (
              <div className="mt-4 rounded-xl border border-[#F0453F]/40 bg-[#F0453F]/10 p-3 text-xs text-[#F0453F]">
                {discoverError}
              </div>
            ) : null}

            {discoverResult ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--siv-muted)]">
                  <span>
                    Modo: <strong className="uppercase text-[var(--siv-fg)]">{discoverResult.mode}</strong> •{" "}
                    {discoverResult.count} dispositivo(s) encontrado(s)
                  </span>
                </div>
                {discoverResult.warnings.map((w, idx) => (
                  <p key={idx} className="text-xs text-[#F58220]">
                    {w}
                  </p>
                ))}
                {discoverResult.devices.map((dev) => {
                  const testSt = discoverTestMap[dev.deviceId];
                  return (
                    <div
                      key={dev.deviceId}
                      className="rounded-2xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-[var(--siv-fg)]">{dev.name}</span>
                            {dev.isSimulated ? <SivBadge label="SIMULADA" variant="info" /> : null}
                            {dev.requiresCredentials ? (
                              <SivBadge label="REQUIERE CREDENCIALES" variant="warning" />
                            ) : null}
                          </div>
                          <p className="mt-1 font-mono text-xs text-[var(--siv-muted)]">
                            IP: {dev.ip}:{dev.port} • {[dev.manufacturer, dev.model].filter(Boolean).join(" / ")}
                          </p>
                          {dev.profiles[0]?.rtspUrl ? (
                            <p className="mt-1 break-all font-mono text-[11px] text-[#00B4D8]">
                              {dev.profiles[0].rtspUrl} ({dev.profiles[0].resolution})
                            </p>
                          ) : null}
                          {dev.error ? <p className="mt-1 text-xs text-[#F58220]">{dev.error}</p> : null}
                          {testSt ? (
                            <p
                              className={`mt-1 text-xs ${
                                testSt.success ? "text-[#00D68F]" : "text-[#F0453F]"
                              }`}
                            >
                              {testSt.message}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          {dev.profiles[0]?.rtspUrl ? (
                            <button
                              type="button"
                              onClick={() => void handleTestDiscovered(dev)}
                              className="rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--siv-fg)] hover:border-[#00D68F]/50"
                            >
                              Probar conexión
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => openRegisterFromDiscovery(dev)}
                            className="rounded-xl bg-[#00D68F] px-3 py-1.5 text-xs font-bold text-[#0B0F17] hover:brightness-105"
                          >
                            Registrar cámara
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Modal Crear / Editar cámara RTSP */}
      {modalOpen ? (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-[var(--siv-border)] bg-[var(--siv-surface)] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--siv-fg)]">
              {editingCamera ? `Editar ${editingCamera.name}` : "Agregar cámara (RTSP / Simulada)"}
            </h2>

            {formError ? (
              <div className="mt-3 rounded-xl border border-[#F0453F]/40 bg-[#F0453F]/10 p-3 text-xs text-[#F0453F]">
                {formError}
              </div>
            ) : null}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {!editingCamera ? (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--siv-muted)]">
                      Código *
                    </label>
                    <input
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="CAM-05"
                      className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3 py-2 text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                    />
                  </div>
                ) : null}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--siv-muted)]">
                    Nombre *
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Acceso Principal"
                    className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3 py-2 text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--siv-muted)]">
                    Ubicación / Descripción *
                  </label>
                  <input
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Entrada Norte"
                    className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3 py-2 text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--siv-muted)]">
                    Fabricante (opcional)
                  </label>
                  <input
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="Hikvision / Dahua / Axis"
                    className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3 py-2 text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--siv-muted)]">
                    Modelo (opcional)
                  </label>
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="DS-2CD2143G2"
                    className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3 py-2 text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--siv-muted)]">
                    IP o Host
                  </label>
                  <input
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="192.168.10.101"
                    className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3 py-2 font-mono text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--siv-muted)]">
                    Puerto
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={65535}
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3 py-2 font-mono text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--siv-muted)]">
                    Protocolo
                  </label>
                  <select
                    value={streamProtocol}
                    onChange={(e) => setStreamProtocol(e.target.value as StreamProtocol | "")}
                    className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3 py-2 text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                  >
                    <option value="rtsp">RTSP</option>
                    <option value="hls">HLS</option>
                    <option value="mjpeg">MJPEG</option>
                    <option value="webrtc">WebRTC</option>
                    <option value="">Sin definir</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-[var(--siv-muted)]">
                    URL RTSP / Transmisión
                  </label>
                  <input
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="rtsp://192.168.10.101:554/Streaming/Channels/101"
                    className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3 py-2 font-mono text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--siv-muted)]">
                    Usuario RTSP
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3 py-2 text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--siv-muted)]">
                    Contraseña RTSP
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingCamera?.hasCredentials ? "(sin cambios)" : "••••••"}
                    className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3 py-2 text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--siv-muted)]">
                    Frecuencia YOLO (seg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={0.5}
                    max={60}
                    value={processingInterval}
                    onChange={(e) => setProcessingInterval(e.target.value)}
                    className="w-full rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3 py-2 font-mono text-sm text-[var(--siv-fg)] outline-none focus:border-[#00D68F]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] p-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-[var(--siv-fg)]">
                    <input
                      type="checkbox"
                      checked={isSimulated}
                      onChange={(e) => setIsSimulated(e.target.checked)}
                      className="h-4 w-4 accent-[#00D68F]"
                    />
                    Cámara simulada (sin hardware físico)
                  </label>
                  {!editingCamera ? (
                    <label className="flex items-center gap-2 text-xs text-[var(--siv-fg)]">
                      <input
                        type="checkbox"
                        checked={validateConnection}
                        onChange={(e) => setValidateConnection(e.target.checked)}
                        className="h-4 w-4 accent-[#00D68F]"
                      />
                      Validar conexión antes de guardar como operativa
                    </label>
                  ) : null}
                </div>

                <button
                  type="button"
                  disabled={testingConn}
                  onClick={() => void handleTestInModal()}
                  className="rounded-xl border border-[#00B4D8]/40 bg-[#00B4D8]/10 px-4 py-2 text-xs font-semibold text-[#00B4D8] hover:bg-[#00B4D8]/20 disabled:opacity-50"
                >
                  {testingConn ? "Probando..." : "Probar conexión"}
                </button>
              </div>

              {testResult ? (
                <div
                  className={`rounded-xl border p-3 text-xs ${
                    testResult.success
                      ? "border-[#00D68F]/40 bg-[#00D68F]/10 text-[#00A874] dark:text-[#00D68F]"
                      : "border-[#F0453F]/40 bg-[#F0453F]/10 text-[#F0453F]"
                  }`}
                >
                  <p className="font-semibold">{testResult.message}</p>
                  {testResult.latencyMs ? (
                    <p className="mt-0.5 font-mono text-[11px]">
                      Latencia: {testResult.latencyMs} ms • Resolución: {testResult.resolution ?? "—"}
                    </p>
                  ) : null}
                  {testResult.previewBase64 ? (
                    <img
                      src={`data:image/jpeg;base64,${testResult.previewBase64}`}
                      alt="Vista previa de prueba"
                      className="mt-2 h-32 rounded-lg border border-[var(--siv-border)] object-contain"
                    />
                  ) : null}
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[var(--siv-border)] px-4 py-2 text-xs font-semibold text-[var(--siv-muted)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#00D68F] to-[#00B4D8] px-5 py-2 text-xs font-bold text-[#0B0F17] disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar cámara"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
