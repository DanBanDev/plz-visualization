import { createAction, props } from '@ngrx/store';
import { VisualizationInfo } from '../../../models/visualization-info.model';

export const loadVisualizationsSuccess = createAction(
  '[Visualizations] Load Visualizations Success',
  props<{ visualizations: VisualizationInfo[] }>()
);
