import { VisualizationInfoDto } from './visualization-info.dto';
import { VisualizationValueDto } from './visualization-value.dto';

export interface VisualizationDto extends VisualizationInfoDto {
  values: VisualizationValueDto[];
}
