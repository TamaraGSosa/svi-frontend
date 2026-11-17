import type {
  Alert,
  AlertListFilters,
  AlertSummary,
  Paginated,
  ValidateAlertAction,
} from "@/types";
import { apiRequest } from "./apiClient";

export const alertsService = {
  list(filters: AlertListFilters = {}): Promise<Paginated<AlertSummary>> {
    return apiRequest<Paginated<AlertSummary>>(
      "/alerts",
      { method: "GET" },
      {
        type: filters.type,
        severity: filters.severity,
        status: filters.status,
        camera_id: filters.cameraId,
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
        page: filters.page ?? 1,
        page_size: filters.pageSize ?? 20,
      },
    );
  },

  listRecent(limit = 10): Promise<AlertSummary[]> {
    return apiRequest<AlertSummary[]>("/alerts/recent", { method: "GET" }, { limit });
  },

  getById(id: string): Promise<Alert> {
    return apiRequest<Alert>(`/alerts/${id}`, { method: "GET" });
  },

  validate(id: string, action: ValidateAlertAction, notes?: string): Promise<Alert> {
    return apiRequest<Alert>(`/alerts/${id}/validate`, {
      method: "PATCH",
      body: JSON.stringify(notes !== undefined ? { action, notes } : { action }),
    });
  },

  updateNotes(id: string, notes: string): Promise<Alert> {
    return apiRequest<Alert>(`/alerts/${id}/notes`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    });
  },
};
