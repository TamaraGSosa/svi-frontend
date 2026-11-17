import type { BoundingBox, YoloClassName } from "./alert";

export interface DetectionOut {
  id: string;
  cameraId: string;
  cameraName?: string | null;
  yoloClassId: number;
  yoloClassName: YoloClassName;
  confidence: number;
  bboxX1: number;
  bboxY1: number;
  bboxX2: number;
  bboxY2: number;
  frameWidth: number;
  frameHeight: number;
  inferenceMs?: number | null;
  detectedAt: string;
  alertId?: string | null;
  imageUrl?: string | null;
}

export interface ProcessFrameResult {
  cameraId: string;
  inferenceMs: number;
  detectionsRecorded: DetectionOut[];
  alertId?: string | null;
  alertCreated: boolean;
  detectionsCount: number;
}

export interface NormalizedDetection {
  classId: number;
  className: YoloClassName;
  confidence: number;
  bboxXyxy: number[];
  boundingBox: BoundingBox;
}

export interface InferenceAnalysisResponse {
  frameWidth: number;
  frameHeight: number;
  inferenceMs: number;
  detectionsCount: number;
  detections: NormalizedDetection[];
}

export interface YoloHealthResponse {
  status?: string;
  model_loaded?: boolean;
  [key: string]: unknown;
}
