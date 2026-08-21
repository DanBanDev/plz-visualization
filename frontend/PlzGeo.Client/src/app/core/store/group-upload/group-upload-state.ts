export interface GroupUploadState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}
