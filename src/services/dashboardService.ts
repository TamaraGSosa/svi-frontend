import type { DashboardSummary } from "@/types";
import { apiRequest } from "./apiClient";

export const dashboardService = {
  getSummary(): Promise<DashboardSummary> {
    return apiRequest<DashboardSummary>("/dashboard/summary", { method: "GET" });
  },
};
