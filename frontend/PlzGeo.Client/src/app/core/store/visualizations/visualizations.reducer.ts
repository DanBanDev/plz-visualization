import { createReducer, on } from '@ngrx/store';
import { VisualizationsState } from './visualizations-state';
import { loadVisualizationsSuccess } from '../actions/load-visualizations.action';

export const initialState: VisualizationsState = {
  items: []
};

export const visualizationsReducer = createReducer(
  initialState,
  on(loadVisualizationsSuccess, (state, { visualizations }) => ({
    ...state,
    items: visualizations
  }))
);
