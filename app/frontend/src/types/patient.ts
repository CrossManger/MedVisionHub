// Patient interfaces aligned with api_contracts.json (Phase 3)

export interface Patient {
  id: number;
  full_name: string;
  date_of_birth: string | null; // YYYY-MM-DD
  gender: string | null;
  phone: string | null;
  created_at: string; // ISO 8601
}

export interface PatientDetail {
  id: number;
  user_id: number | null;
  full_name: string;
  date_of_birth: string | null; // YYYY-MM-DD
  gender: string | null;
  phone: string | null;
  address: string | null;
  medical_history: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  scan_sessions: ScanSessionSummary[];
}

export interface ScanSessionSummary {
  id: number;
  scan_type: string;
  status: string;
  created_at: string;
  image_count: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PatientListResponse {
  data: Patient[];
  pagination: Pagination;
}

export interface CreatePatientRequest {
  full_name: string;
  date_of_birth?: string; // YYYY-MM-DD
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  medical_history?: string;
}

export interface UpdatePatientRequest {
  full_name?: string;
  date_of_birth?: string; // YYYY-MM-DD
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  medical_history?: string;
}

export interface CreatePatientResponse {
  message: string;
  patient: {
    id: number;
    full_name: string;
  };
}
