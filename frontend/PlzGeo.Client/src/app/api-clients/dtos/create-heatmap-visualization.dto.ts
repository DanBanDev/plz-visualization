import { CreateVisualizationDto } from './create-visualization.dto';
import { HeatmapLegendItemDto } from './heatmap-legend-item.dto';

export interface CreateHeatmapVisualizationDto extends CreateVisualizationDto {
  legend: HeatmapLegendItemDto[];
}
