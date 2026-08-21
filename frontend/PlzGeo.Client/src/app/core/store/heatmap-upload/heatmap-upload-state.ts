export interface HeatmapUploadState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}
