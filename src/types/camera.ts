export type CameraStatus = "online" | "offline" | "error" | "recording" | "no_signal";
export type StreamProtocol = "hls" | "mjpeg" | "webrtc" | "rtsp";

export interface CameraStream {
  protocol: StreamProtocol;
  url: string;
}

export interface Camera {
  id: string;
  code: string;
  name: string;
  location: string;
  manufacturer?: string | null;
  model?: string | null;
  host?: string | null;
  port?: number | null;
  hasCredentials?: boolean;
  status: CameraStatus;
  isActive?: boolean;
  isRecording: boolean;
  isSimulated?: boolean;
  streamActive?: boolean;
  stream?: CameraStream | null;
  sourceUri?: string | null;
  resolution: string;
  fps: number;
  processingIntervalSeconds?: number;
  latencyMs?: number | null;
  detectionsToday: number;
  aiFilters: string[];
  lastDetectionAt?: string | null;
  lastConnectedAt?: string | null;
  lastError?: string | null;
}

export interface CameraCreatePayload {
  code: string;
  name: string;
  location: string;
  manufacturer?: string | null;
  model?: string | null;
  host?: string | null;
  port?: number | null;
  username?: string | null;
  password?: string | null;
  status?: CameraStatus;
  isRecording?: boolean;
  isSimulated?: boolean;
  streamProtocol?: StreamProtocol | null;
  streamUrl?: string | null;
  sourceUri?: string | null;
  resolution?: string;
  fps?: number;
  processingIntervalSeconds?: number;
  onvifXaddrs?: string | null;
  onvifProfileToken?: string | null;
  aiFilters?: string[];
  validateConnection?: boolean;
}

export interface CameraUpdatePayload {
  name?: string;
  location?: string;
  manufacturer?: string | null;
  model?: string | null;
  host?: string | null;
  port?: number | null;
  username?: string | null;
  password?: string | null;
  status?: CameraStatus;
  isRecording?: boolean;
  isSimulated?: boolean;
  streamProtocol?: StreamProtocol | null;
  streamUrl?: string | null;
  sourceUri?: string | null;
  resolution?: string;
  fps?: number;
  processingIntervalSeconds?: number;
  latencyMs?: number | null;
  aiFilters?: string[];
}

export interface DiscoveredProfile {
  token: string;
  name: string;
  encoding: string;
  resolution: string;
  fps: number;
  rtspUrl?: string | null;
}

export interface DiscoveredCamera {
  deviceId: string;
  name: string;
  manufacturer?: string | null;
  model?: string | null;
  ip: string;
  port: number;
  xaddrs: string;
  services: string[];
  profiles: DiscoveredProfile[];
  requiresCredentials: boolean;
  isSimulated: boolean;
  error?: string | null;
}

export interface CameraDiscoverPayload {
  timeoutSeconds?: number;
  maxDevices?: number;
  username?: string;
  password?: string;
  simulate: boolean;
}

export interface CameraDiscoverResponse {
  mode: string;
  count: number;
  devices: DiscoveredCamera[];
  warnings: string[];
}

export interface CameraTestConnectionPayload {
  url: string;
  username?: string;
  password?: string;
  isSimulated?: boolean;
  timeoutSeconds?: number;
}

export interface CameraTestConnectionResponse {
  success: boolean;
  message: string;
  latencyMs?: number | null;
  resolution?: string | null;
  isSimulated: boolean;
  previewBase64?: string | null;
}

export interface CameraStreamStatus {
  cameraId: string;
  running: boolean;
  connected: boolean;
  isSimulated: boolean;
  framesCaptured: number;
  framesProcessed: number;
  lastFrameAt?: string | null;
  lastError?: string | null;
}

export interface CameraConnectionStatus {
  cameraId: string;
  code: string;
  name: string;
  isActive: boolean;
  connectionStatus: CameraStatus;
  isConnected: boolean;
  streamActive: boolean;
  latencyMs?: number | null;
  lastConnectedAt?: string | null;
  lastError?: string | null;
}

export type MonitoringState = "monitoreando" | "detenido";

export interface MonitoringCamera {
  cameraId: string;
  code: string;
  name: string;
  location: string;
  isActive: boolean;
  connectionStatus: CameraStatus;
  monitoringStatus: MonitoringState;
  isSimulated: boolean;
  resolution: string;
  fps: number;
  latencyMs?: number | null;
  framesCaptured: number;
  framesProcessed: number;
  lastFrameAt?: string | null;
  lastError?: string | null;
}

export interface MonitoringStreamInfo {
  cameraId: string;
  monitoringStatus: MonitoringState;
  connectionStatus: CameraStatus;
  isActive: boolean;
  protocol?: StreamProtocol | null;
  webCompatible: boolean;
  transcodingRequired: boolean;
  playbackUrl?: string | null;
  snapshotUrl?: string | null;
  webDeliveryNote: string;
}
