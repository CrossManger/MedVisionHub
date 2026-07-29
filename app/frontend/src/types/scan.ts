export type ScanType = 'xray' | 'mri' | 'ct_scan' | 'ultrasound';
export type ScanStatus = 'pending' | 'in_progress' | 'completed';

export interface ScanSession {
  id: number;
  patient_id: number;
  doctor_id: number;
  scan_type: ScanType;
  status: ScanStatus;
  notes?: string | null;
  image_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateScanRequest {
  scan_type: ScanType;
  notes?: string;
}

export interface ScanListResponse {
  data: ScanSession[];
}

export interface ScanResponse {
  message?: string;
  data: ScanSession;
}
