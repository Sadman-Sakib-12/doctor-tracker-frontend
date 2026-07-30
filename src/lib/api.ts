import api from "./axios";
import {
  Doctor,
  Patient,
  PaginatedResponse,
  DashboardStats,
  QueryParams,
  User,
} from "@/types";

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ success: boolean; token: string; user: User }>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; token: string; user: User }>("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  me: () => api.get<{ success: boolean; user: User }>("/auth/me"),
};

// ── Doctors ───────────────────────────────────────────────────────────────────
export const doctorApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<Doctor>>("/doctors", { params }),

  getOne: (id: string) =>
    api.get<{ success: boolean; data: Doctor }>(`/doctors/${id}`),

  create: (data: Omit<Doctor, "_id" | "createdAt" | "updatedAt">) =>
    api.post<{ success: boolean; data: Doctor }>("/doctors", data),

  update: (id: string, data: Partial<Doctor>) =>
    api.put<{ success: boolean; data: Doctor }>(`/doctors/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/doctors/${id}`),

  getPatients: (id: string, params?: QueryParams) =>
    api.get<PaginatedResponse<Patient>>(`/doctors/${id}/patients`, { params }),

  addPatient: (doctorId: string, data: Omit<Patient, "_id" | "createdAt" | "updatedAt" | "doctor">) =>
    api.post<{ success: boolean; data: Patient }>(`/doctors/${doctorId}/patients`, data),
};

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<Patient>>("/patients", { params }),

  getOne: (id: string) =>
    api.get<{ success: boolean; data: Patient }>(`/patients/${id}`),

  update: (id: string, data: Partial<Patient>) =>
    api.put<{ success: boolean; data: Patient }>(`/patients/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/patients/${id}`),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () =>
    api.get<{ success: boolean; data: DashboardStats }>("/dashboard/stats"),
};
