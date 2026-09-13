import { createReducer, on } from '@ngrx/store';
import { VisualizationsState } from './visualizations-state';
import { loadVisualizationsSuccess } from '../actions/load-visualizations.action';
import {
  clearSelectedVisualization,
  selectVisualization,
  selectVisualizationFailure,
  selectVisualizationSuccess
} from '../actions/select-visualization.action';
import { deleteVisualizationSuccess } from '../actions/delete-visualization.action';
import { uploadHeatmapVisualizationSuccess } from '../actions/upload-heatmap-visualization.action';
import { uploadGroupVisualizationSuccess } from '../actions/upload-group-visualization.action';
import { logoutSuccess } from '../auth/auth.actions';

export const initialState: VisualizationsState = {
  items: [],
  selectedVisualization: null,
  selectedVisualizationError: null,
  isLoadingSelectedVisualization: false
};

export const visualizationsReducer = createReducer(
  initialState,
  on(loadVisualizationsSuccess, (state, { visualizations }) => ({
    ...state,
    items: visualizations
  })),
  on(uploadHeatmapVisualizationSuccess, uploadGroupVisualizationSuccess, (state, { visualization }) => ({
    ...state,
    items: [...state.items.filter(item => item.id !== visualization.id), visualization]
  })),
  on(selectVisualization, state => ({
    ...state,
    selectedVisualization: null,
    selectedVisualizationError: null,
    isLoadingSelectedVisualization: true
  })),
  on(selectVisualizationSuccess, (state, { visualization }) => ({
    ...state,
    selectedVisualization: visualization,
    selectedVisualizationError: null,
    isLoadingSelectedVisualization: false
  })),
  on(selectVisualizationFailure, (state, { error }) => ({
    ...state,
    selectedVisualization: null,
    selectedVisualizationError: error,
    isLoadingSelectedVisualization: false
  })),
  on(clearSelectedVisualization, state => ({
    ...state,
    selectedVisualization: null,
    selectedVisualizationError: null,
    isLoadingSelectedVisualization: false
  })),
  on(deleteVisualizationSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter(item => item.id !== id),
    selectedVisualization: state.selectedVisualization?.id === id ? null : state.selectedVisualization
  })),
  on(logoutSuccess, () => ({
    ...initialState
  }))
);
