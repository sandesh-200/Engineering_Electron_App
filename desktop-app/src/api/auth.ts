import { api } from "./axios";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ENGINEER" | "VIEWER";
  subscriptionPlan: "FREE_TRIAL" | "PROFESSIONAL" | "ENTERPRISE";
  subscriptionExpiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ user: AuthUser; token: string; message: string }>(
      "/auth/login",
      { email, password }
    );
    return res.data;
  },

  register: async (name: string, email: string, password: string) => {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
  },

  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<AuthUser>("/auth/me");
    return res.data;
  },
};
