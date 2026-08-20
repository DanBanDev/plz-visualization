import { VisualizationValue } from './visualization-value.model';
import { HeatmapLegendItem } from './heatmap-legend-item.model';

export interface CreateHeatmapVisualization {
  name: string;
  values: VisualizationValue[];
  legend: HeatmapLegendItem[];
}
