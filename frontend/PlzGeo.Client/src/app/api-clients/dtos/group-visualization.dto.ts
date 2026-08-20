import { VisualizationDto } from './visualization.dto';
import { GroupLegendItemDto } from './group-legend-item.dto';

export interface GroupVisualizationDto extends VisualizationDto {
  legend: GroupLegendItemDto[];
}
