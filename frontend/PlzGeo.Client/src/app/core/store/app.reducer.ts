import { ActionReducerMap } from '@ngrx/store';
import { AppState } from './app-state';
import { mapReducer } from './map/map.reducer';
import { heatmapUploadReducer } from './heatmap-upload/heatmap-upload.reducer';
import { groupUploadReducer } from './group-upload/group-upload.reducer';
import { visualizationsReducer } from './visualizations/visualizations.reducer';

export const appReducer: ActionReducerMap<AppState> = {
      map: mapReducer,
      heatmapUpload: heatmapUploadReducer,
      groupUpload: groupUploadReducer,
      visualizations: visualizationsReducer,
};