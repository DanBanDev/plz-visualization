import { VisualizationInfo } from '../../../models/visualization-info.model';
import { Visualization } from '../../../models/visualization.model';

export interface VisualizationsState {
  items: VisualizationInfo[];
  selectedVisualization: Visualization | null;
  selectedVisualizationError: string | null;
  isLoadingSelectedVisualization: boolean;
}
