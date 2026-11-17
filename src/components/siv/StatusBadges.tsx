import type {
  AlertSeverity,
  AlertStatus,
  AlertType,
  CameraStatus,
  UserRole,
  WsConnectionState,
  YoloClassName,
} from "@/types";

export const yoloClassLabels: Record<YoloClassName, string> = {
  knife: "Cuchillo",
  scissors: "Tijeras",
  box_cutter: "Cúter",
  lighter: "Encendedor",
};

export const alertTypeLabels: Record<AlertType, string> = {
  firearm: "Arma de fuego",
  knife: "Arma blanca / Cuchillo",
  suspicious_object: "Objeto sospechoso",
  loitering: "Merodeo",
  weapon: "Arma / Objeto punzante",
  intrusion: "Intrusión",
  fire: "Fuego / Encendedor",
  behavioral: "Comportamiento",
};

export const severityLabels: Record<AlertSeverity, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

export const alertStatusLabels: Record<AlertStatus, string> = {
  pending_validation: "Pendiente",
  pending: "Pendiente",
  confirmed: "Confirmada",
  false_positive: "Falso positivo",
  archived: "Archivada",
};

export const cameraStatusLabels: Record<CameraStatus, string> = {
  online: "En línea",
  recording: "Grabando",
  offline: "Desconectada",
  error: "Error",
  no_signal: "Sin señal",
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  operator: "Operador",
};

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const styles: Record<AlertSeverity, string> = {
    critical: "bg-[#F0453F]/15 text-[#F0453F] border-[#F0453F]/30",
    high: "bg-[#F58220]/15 text-[#F58220] border-[#F58220]/30",
    medium: "bg-[#E6B800]/15 text-[#E6B800] border-[#E6B800]/30",
    low: "bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles[severity]}`}
    >
      {severityLabels[severity]}
    </span>
  );
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  const styles: Record<AlertStatus, string> = {
    pending_validation: "bg-[#F58220]/15 text-[#F58220] border-[#F58220]/30",
    pending: "bg-[#F58220]/15 text-[#F58220] border-[#F58220]/30",
    confirmed: "bg-[#F0453F]/15 text-[#F0453F] border-[#F0453F]/30",
    false_positive: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    archived: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${styles[status]}`}
    >
      {alertStatusLabels[status]}
    </span>
  );
}

export function CameraStatusBadge({ status }: { status: CameraStatus }) {
  const styles: Record<CameraStatus, string> = {
    online: "bg-[#00D68F]/15 text-[#00D68F] border-[#00D68F]/30",
    recording: "bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]/30",
    offline: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    error: "bg-[#F0453F]/15 text-[#F0453F] border-[#F0453F]/30",
    no_signal: "bg-[#F0453F]/15 text-[#F0453F] border-[#F0453F]/30",
  };

  const dotColors: Record<CameraStatus, string> = {
    online: "bg-[#00D68F]",
    recording: "bg-[#00B4D8] animate-pulse",
    offline: "bg-slate-400",
    error: "bg-[#F0453F]",
    no_signal: "bg-[#F0453F]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[status]}`} />
      {cameraStatusLabels[status]}
    </span>
  );
}

export function WsStatusPill({ state }: { state: WsConnectionState }) {
  const cfg: Record<WsConnectionState, { label: string; cls: string; dot: string }> = {
    connected: {
      label: "Tiempo real activo",
      cls: "border-[#00D68F]/30 bg-[#00D68F]/10 text-[#00D68F]",
      dot: "bg-[#00D68F] animate-pulse",
    },
    connecting: {
      label: "Conectando WS...",
      cls: "border-[#00B4D8]/30 bg-[#00B4D8]/10 text-[#00B4D8]",
      dot: "bg-[#00B4D8]",
    },
    reconnecting: {
      label: "Reconectando...",
      cls: "border-[#F58220]/30 bg-[#F58220]/10 text-[#F58220]",
      dot: "bg-[#F58220]",
    },
    disconnected: {
      label: "Desconectado",
      cls: "border-slate-500/30 bg-slate-500/10 text-slate-400",
      dot: "bg-slate-400",
    },
  };

  const item = cfg[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${item.cls}`}
    >
      <span className={`h-2 w-2 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}
