export type ScanType = 'xray' | 'mri' | 'ct_scan' | 'ultrasound';
export type ScanStatus = 'pending' | 'in_progress' | 'completed';

export interface ScanSession {
  id: number;
  patient_id: number;
  patient_name?: string;
  doctor_id: number;
  doctor_name?: string;
  scan_type: ScanType;
  status: ScanStatus;
  notes?: string | null;
  diagnostic_result?: string | null;
  image_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateScanRequest {
  scan_type: ScanType;
  notes?: string;
}

export interface CompleteScanRequest {
  diagnostic_result?: string;
}

export interface ScanListResponse {
  data: ScanSession[];
}

export interface ScanResponse {
  message?: string;
  data: ScanSession;
}
