import { createAction, props } from '@ngrx/store';
import { CreateHeatmapVisualization } from '../../../models/create-heatmap-visualization.model';
import { VisualizationInfo } from '../../../models/visualization-info.model';

export const uploadHeatmapVisualization = createAction(
  '[Heatmap Upload Dialog] Upload Heatmap Visualization',
  props<{ model: CreateHeatmapVisualization }>()
);

export const uploadHeatmapVisualizationSuccess = createAction(
  '[Heatmap Upload API] Upload Heatmap Visualization Success',
  props<{ visualization: VisualizationInfo }>()
);

export const uploadHeatmapVisualizationFailure = createAction(
  '[Heatmap Upload API] Upload Heatmap Visualization Failure',
  props<{ error: string }>()
);

export const resetHeatmapUploadState = createAction(
  '[Heatmap Upload Dialog] Reset Heatmap Upload State'
);
