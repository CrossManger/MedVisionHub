import apiClient from './api';
import type {
  PatientListResponse,
  PatientDetail,
  CreatePatientRequest,
  UpdatePatientRequest,
  CreatePatientResponse,
} from '../types/patient';

export const patientService = {
  /**
   * Get paginated list of patients, with optional search by name.
   */
  getAll: async (
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<PatientListResponse> => {
    const params: Record<string, string | number> = { page, limit };
    if (search.trim()) {
      params.search = search.trim();
    }
    const response = await apiClient.get<PatientListResponse>('/patients', { params });
    return response.data;
  },

  /**
   * Get full detail of a single patient by ID (includes scan_sessions).
   */
  getById: async (id: number): Promise<PatientDetail> => {
    const response = await apiClient.get<{ data: PatientDetail } | PatientDetail>(`/patients/${id}`);
    if (response.data && typeof response.data === 'object' && 'data' in response.data && response.data.data) {
      return response.data.data;
    }
    return response.data as PatientDetail;
  },

  /**
   * Create a new patient record.
   */
  create: async (data: CreatePatientRequest): Promise<CreatePatientResponse> => {
    const response = await apiClient.post<CreatePatientResponse>('/patients', data);
    return response.data;
  },

  /**
   * Update an existing patient record by ID.
   */
  update: async (id: number, data: UpdatePatientRequest): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(`/patients/${id}`, data);
    return response.data;
  },

  /**
   * Delete a patient record by ID.
   */
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/patients/${id}`);
    return response.data;
  },
};
