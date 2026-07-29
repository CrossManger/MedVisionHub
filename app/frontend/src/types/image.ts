export interface MedicalImage {
  id: number;
  session_id: number;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  diagnostic_result?: string | null;
  uploaded_by?: number;
  uploader_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface ImageListResponse {
  data: MedicalImage[];
}

export interface UploadImageResponse {
  message: string;
  image: MedicalImage;
}

export interface DeleteImageResponse {
  message: string;
}
