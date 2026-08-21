import { ActionReducerMap } from '@ngrx/store';
import { AppState } from './app-state';
import { mapReducer } from './map/map.reducer';
import { heatmapUploadReducer } from './heatmap-upload/heatmap-upload.reducer';

export const appReducer: ActionReducerMap<AppState> = {
      map: mapReducer,
      heatmapUpload: heatmapUploadReducer,
};