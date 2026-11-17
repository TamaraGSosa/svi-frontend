import type { AlertSummary, YoloClassName } from "./alert";

export interface DashboardRecentDetection {
  id: string;
  cameraId: string;
  cameraName: string;
  yoloClassName: YoloClassName;
  confidence: number;
  detectedAt: string;
}

export interface DashboardSummary {
  online: boolean;
  totalCameras?: number;
  activeCameras: number;
  connectedCameras?: number;
  offlineCameras: number;
  disconnectedCameras?: number;
  inactiveCameras?: number;
  pendingAlerts: number;
  confirmedAlerts?: number;
  falsePositiveAlerts?: number;
  detectionsToday: number;
  recentAlerts: AlertSummary[];
  recentDetections?: DashboardRecentDetection[];
}
