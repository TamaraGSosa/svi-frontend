import type { HistoryEntry, HistoryListFilters, Paginated } from "@/types";
import { apiRequest } from "./apiClient";

export const historyService = {
  list(filters: HistoryListFilters = {}): Promise<Paginated<HistoryEntry>> {
    return apiRequest<Paginated<HistoryEntry>>(
      "/history",
      { method: "GET" },
      {
        camera_id: filters.cameraId,
        type: filters.type,
        yolo_class: filters.yoloClass,
        severity: filters.severity,
        status: filters.status,
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
        sort_by: filters.sortBy ?? "detected_at",
        order: filters.order ?? "desc",
        page: filters.page ?? 1,
        page_size: filters.pageSize ?? 20,
      },
    );
  },
};
