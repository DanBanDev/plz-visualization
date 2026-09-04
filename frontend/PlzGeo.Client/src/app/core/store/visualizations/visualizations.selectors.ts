import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VisualizationsState } from './visualizations-state';

export const selectVisualizationsState = createFeatureSelector<VisualizationsState>('visualizations');

export const selectVisualizations = createSelector(
  selectVisualizationsState,
  (state: VisualizationsState) => state.items
);

export const selectSelectedVisualization = createSelector(
  selectVisualizationsState,
  (state: VisualizationsState) => state.selectedVisualization
);

export const selectIsLoadingSelectedVisualization = createSelector(
  selectVisualizationsState,
  (state: VisualizationsState) => state.isLoadingSelectedVisualization
);
