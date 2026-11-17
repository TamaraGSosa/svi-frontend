import type {
  Camera,
  CameraConnectionStatus,
  CameraCreatePayload,
  CameraDiscoverPayload,
  CameraDiscoverResponse,
  CameraStream,
  CameraStreamStatus,
  CameraTestConnectionPayload,
  CameraTestConnectionResponse,
  CameraUpdatePayload,
  MonitoringCamera,
  MonitoringStreamInfo,
} from "@/types";
import { apiRequest } from "./apiClient";

export const camerasService = {
  list(params?: { status?: string; isActive?: boolean }): Promise<Camera[]> {
    return apiRequest<Camera[]>(
      "/cameras",
      { method: "GET" },
      {
        status: params?.status,
        is_active: params?.isActive,
      },
    );
  },

  getById(id: string): Promise<Camera> {
    return apiRequest<Camera>(`/cameras/${id}`, { method: "GET" });
  },

  getStream(id: string): Promise<CameraStream | null> {
    return apiRequest<CameraStream | null>(`/cameras/${id}/stream`, { method: "GET" });
  },

  getConnectionStatus(id: string): Promise<CameraConnectionStatus> {
    return apiRequest<CameraConnectionStatus>(`/cameras/${id}/connection-status`, {
      method: "GET",
    });
  },

  setActive(id: string, isActive: boolean): Promise<Camera> {
    return apiRequest<Camera>(`/cameras/${id}/active`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },

  discover(payload: CameraDiscoverPayload): Promise<CameraDiscoverResponse> {
    return apiRequest<CameraDiscoverResponse>("/cameras/discover", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  testConnection(payload: CameraTestConnectionPayload): Promise<CameraTestConnectionResponse> {
    return apiRequest<CameraTestConnectionResponse>("/cameras/test-connection", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  testRegistered(id: string): Promise<CameraTestConnectionResponse> {
    return apiRequest<CameraTestConnectionResponse>(`/cameras/${id}/test-connection`, {
      method: "POST",
    });
  },

  connect(id: string): Promise<CameraStreamStatus> {
    return apiRequest<CameraStreamStatus>(`/cameras/${id}/connect`, { method: "POST" });
  },

  disconnect(id: string): Promise<CameraStreamStatus> {
    return apiRequest<CameraStreamStatus>(`/cameras/${id}/disconnect`, { method: "POST" });
  },

  getSnapshotUrl(id: string, cacheBust?: number): string {
    const suffix = cacheBust ? `?t=${cacheBust}` : "";
    return `/api/v1/cameras/${id}/snapshot${suffix}`;
  },

  create(payload: CameraCreatePayload): Promise<Camera> {
    return apiRequest<Camera>("/cameras", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: CameraUpdatePayload): Promise<Camera> {
    return apiRequest<Camera>(`/cameras/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/cameras/${id}`, { method: "DELETE" });
  },
};

export const monitoringService = {
  listAvailable(): Promise<MonitoringCamera[]> {
    return apiRequest<MonitoringCamera[]>("/monitoring/cameras", { method: "GET" });
  },

  listStreaming(): Promise<MonitoringCamera[]> {
    return apiRequest<MonitoringCamera[]>("/monitoring/cameras/streaming", { method: "GET" });
  },

  getStatus(cameraId: string): Promise<MonitoringCamera> {
    return apiRequest<MonitoringCamera>(`/monitoring/cameras/${cameraId}/status`, {
      method: "GET",
    });
  },

  start(cameraId: string): Promise<MonitoringCamera> {
    return apiRequest<MonitoringCamera>(`/monitoring/cameras/${cameraId}/start`, {
      method: "POST",
    });
  },

  stop(cameraId: string): Promise<MonitoringCamera> {
    return apiRequest<MonitoringCamera>(`/monitoring/cameras/${cameraId}/stop`, {
      method: "POST",
    });
  },

  getStreamInfo(cameraId: string): Promise<MonitoringStreamInfo> {
    return apiRequest<MonitoringStreamInfo>(`/monitoring/cameras/${cameraId}/stream-info`, {
      method: "GET",
    });
  },
};
