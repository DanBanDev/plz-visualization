import { ActionReducerMap } from '@ngrx/store';
import { AppState } from './app-state';
import { mapReducer } from './map/map.reducer';

export const appReducer: ActionReducerMap<AppState> = {
      map: mapReducer,
};