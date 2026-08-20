import { VisualizationInfo } from './visualization-info.model';
import { VisualizationValue } from './visualization-value.model';
import { HeatmapLegendItem } from './heatmap-legend-item.model';

export interface HeatmapVisualization extends VisualizationInfo {
  values: VisualizationValue[];
  legend: HeatmapLegendItem[];
}
