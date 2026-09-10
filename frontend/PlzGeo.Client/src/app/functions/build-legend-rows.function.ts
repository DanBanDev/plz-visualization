import { GroupVisualization } from '../models/group-visualization.model';
import { HeatmapVisualization } from '../models/heatmap-visualization.model';
import { Visualization } from '../models/visualization.model';
import { VisualizationType } from '../models/visualization-type.enum';
import { PdfLegendRow } from '../features/map-page/services/map-pdf-export.service';
import { withOpacity } from './with-opacity.function';

export interface LegendRow extends PdfLegendRow {
  groupValue?: number;
  fromValue?: number;
  toValue?: number;
}

export function buildLegendRows(visualization: Visualization): LegendRow[] {
  if (visualization.type === VisualizationType.Group) {
    const groupVisualization = visualization as GroupVisualization;
    return groupVisualization.legend.map(item => ({
      color: withOpacity(item.color, 0.7),
      label: `${item.name}`,
      groupValue: item.value
    }));
  }

  const heatmapVisualization = visualization as HeatmapVisualization;
  return heatmapVisualization.legend.map(item => ({
    color: withOpacity(item.color, 0.7),
    label: `From ${item.fromValue} to ${item.toValue}`,
    fromValue: item.fromValue,
    toValue: item.toValue
  }));
}
