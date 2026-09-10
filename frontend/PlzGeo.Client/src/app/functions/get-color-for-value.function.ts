import { GroupVisualization } from '../models/group-visualization.model';
import { HeatmapVisualization } from '../models/heatmap-visualization.model';
import { Visualization } from '../models/visualization.model';
import { VisualizationType } from '../models/visualization-type.enum';
import { withOpacity } from './with-opacity.function';

export function getColorForValue(value: number, visualization: Visualization): string {
  if (visualization.type === VisualizationType.Group) {
    const groupVisualization = visualization as GroupVisualization;
    const legendItem = groupVisualization.legend.find(item => item.value === value);
    return withOpacity(legendItem?.color ?? '#eeeeee', 0.7);
  }

  const heatmapVisualization = visualization as HeatmapVisualization;
  const legendItem = heatmapVisualization.legend.find(item => value >= item.fromValue && value <= item.toValue);
  return withOpacity(legendItem?.color ?? '#eeeeee', 0.7);
}
