import { VisualizationInfo } from './visualization-info.model';
import { VisualizationValue } from './visualization-value.model';
import { GroupLegendItem } from './group-legend-item.model';

export interface GroupVisualization extends VisualizationInfo {
  values: VisualizationValue[];
  legend: GroupLegendItem[];
}
