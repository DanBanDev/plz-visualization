import { MapState } from "./map/map-state";
import { HeatmapUploadState } from "./heatmap-upload/heatmap-upload-state";

export interface AppState {
  map: MapState;
  heatmapUpload: HeatmapUploadState;
}