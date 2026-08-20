import { VisualizationDto } from './visualization.dto';
import { HeatmapLegendItemDto } from './heatmap-legend-item.dto';

export interface HeatmapVisualizationDto extends VisualizationDto {
  legend: HeatmapLegendItemDto[];
}
