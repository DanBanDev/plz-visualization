import { createReducer, on } from '@ngrx/store';
import { GroupUploadState } from './group-upload-state';
import {
  uploadGroupVisualization,
  uploadGroupVisualizationSuccess,
  uploadGroupVisualizationFailure,
  resetGroupUploadState
} from '../actions/upload-group-visualization.action';

export const initialState: GroupUploadState = {
  status: 'idle',
  error: null
};

export const groupUploadReducer = createReducer(
  initialState,
  on(uploadGroupVisualization, (state): GroupUploadState => ({
    ...state,
    status: 'loading',
    error: null
  })),
  on(uploadGroupVisualizationSuccess, (state): GroupUploadState => ({
    ...state,
    status: 'success',
    error: null
  })),
  on(uploadGroupVisualizationFailure, (state, { error }): GroupUploadState => ({
    ...state,
    status: 'error',
    error
  })),
  on(resetGroupUploadState, (): GroupUploadState => initialState)
);
