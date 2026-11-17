export interface SurveillanceMetrics {
  totalVideos: number;
  analyzedVideos: number;
  totalDetections: number;
  pendingEvents: number;
}

export type VideoStatus = "pending" | "analyzing" | "completed" | "error";

export interface VideoRecord {
  id: string;
  name: string;
  cameraOrigin: string;
  cameraId: string;
  date: string;
  duration: string;
  size: string;
  status: VideoStatus;
  detectedCount?: number;
  fps?: number;
  resolution?: string;
}

export type CameraStatus = "online" | "offline" | "recording" | "no_signal";

export interface CameraOverview {
  id: string;
  name: string;
  location: string;
  status: CameraStatus;
  resolution: string;
  fps: number;
  ip?: string;
  lastEvent?: string;
}

export type DetectionSeverity = "high" | "medium" | "low";

export interface RecentDetection {
  id: string;
  type: string;
  confidence: number;
  cameraName: string;
  timestamp: string;
  severity: DetectionSeverity;
  status: "reviewed" | "pending";
  videoId?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "detection" | "video_processed" | "camera_status" | "system";
}

export interface DashboardData {
  metrics: SurveillanceMetrics;
  cameras: CameraOverview[];
  videos: VideoRecord[];
  recentDetections: RecentDetection[];
  recentActivity: ActivityItem[];
  hourlyDetections: {
    hours: string[];
    counts: number[];
  };
}

