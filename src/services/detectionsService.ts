import type {
  DetectionOut,
  InferenceAnalysisResponse,
  Paginated,
  ProcessFrameResult,
  YoloClassName,
  YoloHealthResponse,
} from "@/types";
import { apiRequest } from "./apiClient";

export const detectionsService = {
  list(params: {
    cameraId?: string;
    yoloClass?: YoloClassName;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<Paginated<DetectionOut>> {
    return apiRequest<Paginated<DetectionOut>>(
      "/detections",
      { method: "GET" },
      {
        camera_id: params.cameraId,
        yolo_class: params.yoloClass,
        date_from: params.dateFrom,
        date_to: params.dateTo,
        page: params.page ?? 1,
        page_size: params.pageSize ?? 20,
      },
    );
  },

  processCameraFrame(
    cameraId: string,
    file: File,
    options?: { conf?: number; iou?: number },
  ): Promise<ProcessFrameResult> {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<ProcessFrameResult>(
      `/detections/cameras/${cameraId}/process-frame`,
      {
        method: "POST",
        body: formData,
        timeoutMs: 60_000,
      },
      {
        conf: options?.conf,
        iou: options?.iou,
      },
    );
  },

  analyzeFrame(
    file: File,
    options?: { conf?: number; iou?: number },
  ): Promise<InferenceAnalysisResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<InferenceAnalysisResponse>(
      "/inference/analyze",
      {
        method: "POST",
        body: formData,
        timeoutMs: 60_000,
      },
      {
        conf: options?.conf,
        iou: options?.iou,
      },
    );
  },

  yoloHealth(): Promise<YoloHealthResponse> {
    return apiRequest<YoloHealthResponse>("/inference/health", {
      method: "GET",
      timeoutMs: 10_000,
    });
  },
};
