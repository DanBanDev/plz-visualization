import { createAction, props } from '@ngrx/store';
import { CreateGroupVisualization } from '../../../models/create-group-visualization.model';
import { VisualizationInfo } from '../../../models/visualization-info.model';

export const uploadGroupVisualization = createAction(
  '[Group Upload Dialog] Upload Group Visualization',
  props<{ model: CreateGroupVisualization }>()
);

export const uploadGroupVisualizationSuccess = createAction(
  '[Group Upload API] Upload Group Visualization Success',
  props<{ visualization: VisualizationInfo }>()
);

export const uploadGroupVisualizationFailure = createAction(
  '[Group Upload API] Upload Group Visualization Failure',
  props<{ error: string }>()
);

export const resetGroupUploadState = createAction(
  '[Group Upload Dialog] Reset Group Upload State'
);
