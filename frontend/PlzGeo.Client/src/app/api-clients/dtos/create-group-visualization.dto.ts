import { CreateVisualizationDto } from './create-visualization.dto';
import { GroupLegendItemDto } from './group-legend-item.dto';

export interface CreateGroupVisualizationDto extends CreateVisualizationDto {
  legend: GroupLegendItemDto[];
}
