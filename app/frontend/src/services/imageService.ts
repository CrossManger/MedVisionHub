import apiClient from './api';
import type {
  ImageListResponse,
  UploadImageResponse,
  DeleteImageResponse,
} from '../types/image';

export const imageService = {
  /**
   * Fetch all images associated with a scan session.
   */
  getByScanId: async (scanId: number): Promise<ImageListResponse> => {
    const response = await apiClient.get<ImageListResponse>(`/scans/${scanId}/images`);
    return response.data;
  },

  /**
   * Upload a medical image file for a scan session with progress tracking.
   */
  upload: async (
    scanId: number,
    file: File,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadImageResponse>(
      `/scans/${scanId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            onUploadProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
            });
          }
        },
      }
    );
    return response.data;
  },

  /**
   * Delete a medical image by ID.
   */
  delete: async (imageId: number): Promise<DeleteImageResponse> => {
    const response = await apiClient.delete<DeleteImageResponse>(`/images/${imageId}`);
    return response.data;
  },
};
