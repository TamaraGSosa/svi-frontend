import type { AlertSummary } from "./alert";
import type { CameraStatus } from "./camera";

export type SocketEvent =
  | { event: "alert.created"; data: AlertSummary }
  | { event: "alert.updated"; data: AlertSummary }
  | {
      event: "camera.status";
      data: { id: string; status: CameraStatus; latencyMs?: number };
    };

export type WsConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";
