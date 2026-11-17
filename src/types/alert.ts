export type AlertType =
  | "firearm"
  | "knife"
  | "suspicious_object"
  | "loitering"
  | "weapon"
  | "intrusion"
  | "fire"
  | "behavioral";

export type YoloClassName = "knife" | "scissors" | "box_cutter" | "lighter";

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type AlertStatus =
  | "pending_validation"
  | "pending"
  | "confirmed"
  | "false_positive"
  | "archived";

export type ValidateAlertAction = "confirm" | "false_positive";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface AlertFrame {
  id: string;
  offsetSeconds: number;
  imageUrl: string;
}

export interface AlertEvidence {
  snapshotUrl: string;
  clipUrl?: string | null;
  frames: AlertFrame[];
  boundingBox?: BoundingBox | null;
}

export interface AlertReview {
  reviewerId?: string | null;
  reviewerName: string;
  reviewerShift: string;
  reviewedAt?: string | null;
  notes: string;
  notesUpdatedAt?: string | null;
}

export interface AlertLinkedDetection {
  id: string;
  yoloClassName: YoloClassName;
  confidence: number;
  detectedAt: string;
}

export interface AlertReviewHistory {
  id: string;
  action: string;
  actorId?: string | null;
  actorName: string;
  decision?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface AlertSummary {
  id: string;
  type: AlertType;
  primaryYoloClass: YoloClassName;
  severity: AlertSeverity;
  status: AlertStatus;
  confidence: number;
  cameraId: string;
  cameraName: string;
  location: string;
  detectedAt: string;
  thumbnailUrl: string;
  boundingBox?: BoundingBox | null;
}

export interface Alert {
  id: string;
  type: AlertType;
  primaryYoloClass: YoloClassName;
  severity: AlertSeverity;
  status: AlertStatus;
  confidence: number;
  cameraId: string;
  cameraName: string;
  location: string;
  detectedAt: string;
  evidence: AlertEvidence;
  review?: AlertReview | null;
  detections?: AlertLinkedDetection[];
  reviewHistory?: AlertReviewHistory[];
  autoProtocol?: string | null;
}

export interface HistoryEntry {
  id: string;
  alertId?: string;
  type: AlertType;
  primaryYoloClass: YoloClassName;
  severity: AlertSeverity;
  status: AlertStatus;
  risk?: "high" | "medium" | "low";
  confidence: number;
  cameraId: string;
  cameraName: string;
  location: string;
  detectedAt: string;
  thumbnailUrl: string;
  notes?: string | null;
}

export interface AlertListFilters {
  type?: AlertType;
  severity?: AlertSeverity;
  status?: AlertStatus;
  cameraId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface HistoryListFilters {
  cameraId?: string;
  type?: AlertType;
  yoloClass?: YoloClassName;
  severity?: AlertSeverity;
  status?: AlertStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "detected_at" | "confidence" | "severity";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
