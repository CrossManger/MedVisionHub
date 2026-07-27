export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface PatientListResponse {
  data: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
