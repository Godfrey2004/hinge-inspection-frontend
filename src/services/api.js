import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 300000, // 5 min — large video processing can be slow
});

/**
 * Upload a video file and run AI inspection.
 * @param {File} file - The video file to upload.
 * @param {function} onUploadProgress - Callback for upload progress (0–100).
 * @returns {Promise<object>} Analytics JSON from the backend.
 */
export async function runInspection(file, onUploadProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total && onUploadProgress) {
        onUploadProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

  return response.data;
}

/**
 * Build the URL for a processed video served by the backend.
 * @param {string} filename - Filename returned by the backend.
 * @returns {string} Full URL to the processed video.
 */
export function getProcessedVideoUrl(filename) {
  return `${BASE_URL}/processed-video/${filename}`;
}
