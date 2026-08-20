import { VisualizationType } from '../../models/visualization-type.enum';
import { VisualizationValueDto } from './visualization-value.dto';

export interface CreateVisualizationDto {
  name: string;
  type: VisualizationType;
  values: VisualizationValueDto[];
}
