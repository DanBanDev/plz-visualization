import { createAction, props } from '@ngrx/store';
import { Visualization } from '../../../models/visualization.model';

export const selectVisualization = createAction(
  '[Visualizations] Select Visualization',
  props<{ id: string }>()
);

export const selectVisualizationSuccess = createAction(
  '[Visualizations] Select Visualization Success',
  props<{ visualization: Visualization }>()
);

export const selectVisualizationFailure = createAction(
  '[Visualizations] Select Visualization Failure',
  props<{ error: string }>()
);

export const clearSelectedVisualization = createAction(
  '[Visualizations] Clear Selected Visualization'
);