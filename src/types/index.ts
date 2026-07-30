export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  condition:
    | "stable"
    | "critical"
    | "recovering"
    | "chronic"
    | "discharged"
    | "under observation";
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  doctor: Doctor | string;
  admittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
}

export interface DashboardStats {
  totals: { doctors: number; patients: number };
  patientsPerDoctor: {
    doctorId: string;
    doctorName: string;
    specialization: string;
    hospital: string;
    patientCount: number;
  }[];
  conditionBreakdown: { condition: string; count: number }[];
  genderBreakdown: { gender: string; count: number }[];
  monthlyPatients: { year: number; month: number; count: number }[];
  topSpecializations: { specialization: string; count: number }[];
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
  condition?: string;
  gender?: string;
  specialization?: string;
}
