import apiClient from './api';
import type {
  ScanSession,
  CreateScanRequest,
  CompleteScanRequest,
  ScanListResponse,
  ScanResponse,
} from '../types/scan';

export const scanService = {
  /**
   * Get all scan sessions for a specific patient.
   */
  getByPatientId: async (patientId: number): Promise<ScanSession[]> => {
    const response = await apiClient.get<ScanListResponse>(`/patients/${patientId}/scans`);
    return response.data.data;
  },

  /**
   * Get all scan sessions for the currently logged-in patient.
   */
  getMyScans: async (): Promise<ScanSession[]> => {
    const response = await apiClient.get<ScanListResponse>('/my-scans');
    return response.data.data;
  },

  /**
   * Get single scan session by ID.
   */
  getById: async (id: number): Promise<ScanSession> => {
    const response = await apiClient.get<ScanResponse | ScanSession>(`/scans/${id}`);
    if (response.data && typeof response.data === 'object' && 'data' in response.data && response.data.data) {
      return response.data.data as ScanSession;
    }
    return response.data as ScanSession;
  },

  /**
   * Create a new scan session for a patient.
   */
  create: async (patientId: number, data: CreateScanRequest): Promise<ScanSession> => {
    const response = await apiClient.post<ScanResponse>(`/patients/${patientId}/scans`, data);
    return response.data.data;
  },

  /**
   * Complete a scan session with diagnostic result.
   */
  complete: async (scanId: number, data: CompleteScanRequest): Promise<void> => {
    await apiClient.put(`/scans/${scanId}/complete`, data);
  },
};
