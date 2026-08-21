import { createReducer, on } from '@ngrx/store';
import { HeatmapUploadState } from './heatmap-upload-state';
import {
  uploadHeatmapVisualization,
  uploadHeatmapVisualizationSuccess,
  uploadHeatmapVisualizationFailure,
  resetHeatmapUploadState
} from '../actions/upload-heatmap-visualization.action';

export const initialState: HeatmapUploadState = {
  status: 'idle',
  error: null
};

export const heatmapUploadReducer = createReducer(
  initialState,
  on(uploadHeatmapVisualization, (state): HeatmapUploadState => ({
    ...state,
    status: 'loading',
    error: null
  })),
  on(uploadHeatmapVisualizationSuccess, (state): HeatmapUploadState => ({
    ...state,
    status: 'success',
    error: null
  })),
  on(uploadHeatmapVisualizationFailure, (state, { error }): HeatmapUploadState => ({
    ...state,
    status: 'error',
    error
  })),
  on(resetHeatmapUploadState, (): HeatmapUploadState => initialState)
);
