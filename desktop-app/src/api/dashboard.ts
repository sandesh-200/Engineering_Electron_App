import { api } from "./axios";

export interface DashboardSummary {
  totalProjects: number;
  role: "ADMIN" | "ENGINEER" | "VIEWER";
  subscription: "FREE_TRIAL" | "PROFESSIONAL" | "ENTERPRISE";
  subscriptionExpiresAt: string | null;
  accountStatus: "ACTIVE" | "SUSPENDED";
}

export const dashboardApi = {
  getSummary: async () => {
    const res = await api.get<DashboardSummary>("/dashboard/summary");
    return res.data;
  },
};
