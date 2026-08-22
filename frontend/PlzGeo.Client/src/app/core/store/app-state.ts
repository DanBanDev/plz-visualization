import { MapState } from "./map/map-state";
import { HeatmapUploadState } from "./heatmap-upload/heatmap-upload-state";
import { GroupUploadState } from "./group-upload/group-upload-state";
import { VisualizationsState } from "./visualizations/visualizations-state";

export interface AppState {
  map: MapState;
  heatmapUpload: HeatmapUploadState;
  groupUpload: GroupUploadState;
  visualizations: VisualizationsState;
}