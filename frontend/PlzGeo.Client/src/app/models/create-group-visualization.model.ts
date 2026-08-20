import { VisualizationValue } from './visualization-value.model';
import { GroupLegendItem } from './group-legend-item.model';

export interface CreateGroupVisualization {
  name: string;
  values: VisualizationValue[];
  legend: GroupLegendItem[];
}
