import { api } from "./axios";
import type { AuthUser } from "./auth";

export interface AdminUser extends AuthUser {
  _count: { projects: number };
}

export interface LoginLog {
  id: string;
  ipAddress: string | null;
  deviceInfo: string | null;
  loginTime: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const adminApi = {
  getUsers: async () => {
    const res = await api.get<AdminUser[]>("/admin/users");
    return res.data;
  },

  updateRole: async (userId: string, role: "ADMIN" | "ENGINEER" | "VIEWER") => {
    const res = await api.put(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  toggleStatus: async (userId: string, isActive: boolean) => {
    const res = await api.put(`/admin/users/${userId}/status`, { isActive });
    return res.data;
  },

  updateSubscription: async (
    userId: string,
    subscriptionPlan: "FREE_TRIAL" | "PROFESSIONAL" | "ENTERPRISE",
    subscriptionExpiresAt?: string | null
  ) => {
    const res = await api.put(`/admin/users/${userId}/subscription`, {
      subscriptionPlan,
      subscriptionExpiresAt,
    });
    return res.data;
  },

  deleteUser: async (userId: string) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  },

  getLoginLogs: async () => {
    const res = await api.get<LoginLog[]>("/admin/login-logs");
    return res.data;
  },
};
