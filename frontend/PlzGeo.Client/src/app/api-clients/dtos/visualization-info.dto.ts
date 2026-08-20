import { VisualizationType } from '../../models/visualization-type.enum';

export interface VisualizationInfoDto {
  id: string;
  name: string;
  type: VisualizationType;
}
