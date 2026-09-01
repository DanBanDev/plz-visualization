import { createReducer, on } from '@ngrx/store';
import { VisualizationsState } from './visualizations-state';
import { loadVisualizationsSuccess } from '../actions/load-visualizations.action';
import {
  selectVisualization,
  selectVisualizationFailure,
  selectVisualizationSuccess
} from '../actions/select-visualization.action';
import { deleteVisualizationSuccess } from '../actions/delete-visualization.action';
import { logoutSuccess } from '../auth/auth.actions';

export const initialState: VisualizationsState = {
  items: [],
  selectedVisualization: null,
  selectedVisualizationError: null
};

export const visualizationsReducer = createReducer(
  initialState,
  on(loadVisualizationsSuccess, (state, { visualizations }) => ({
    ...state,
    items: visualizations
  })),
  on(selectVisualization, state => ({
    ...state,
    selectedVisualization: null,
    selectedVisualizationError: null
  })),
  on(selectVisualizationSuccess, (state, { visualization }) => ({
    ...state,
    selectedVisualization: visualization,
    selectedVisualizationError: null
  })),
  on(selectVisualizationFailure, (state, { error }) => ({
    ...state,
    selectedVisualization: null,
    selectedVisualizationError: error
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
