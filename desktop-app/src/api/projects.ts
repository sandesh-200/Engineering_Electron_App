import { api } from "./axios";

export interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateProjectPayload {
  name: string;
  type: string;
  description: string;
}

export const projectsApi = {
  getAll: async () => {
    const res = await api.get<Project[]>("/projects");
    return res.data;
  },

  getOne: async (id: string) => {
    const res = await api.get<Project>(`/projects/${id}`);
    return res.data;
  },

  create: async (payload: CreateProjectPayload) => {
    const res = await api.post<Project>("/projects", payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<CreateProjectPayload>) => {
    const res = await api.put<Project>(`/projects/${id}`, payload);
    return res.data;
  },

  remove: async (id: string) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
};
