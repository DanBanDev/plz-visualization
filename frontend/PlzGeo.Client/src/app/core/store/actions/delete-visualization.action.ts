import { createAction, props } from '@ngrx/store';

export const deleteVisualization = createAction(
  '[Visualizations] Delete Visualization',
  props<{ id: string; name: string }>()
);

export const deleteVisualizationSuccess = createAction(
  '[Visualizations] Delete Visualization Success',
  props<{ id: string; name: string }>()
);

export const deleteVisualizationFailure = createAction(
  '[Visualizations] Delete Visualization Failure',
  props<{ error: string }>()
);
