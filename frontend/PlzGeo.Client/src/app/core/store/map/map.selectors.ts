import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MapState } from './map-state';

export const selectMapState = createFeatureSelector<MapState>('map');

export const selectShowOsmLayer = createSelector(
  selectMapState,
  (state: MapState) => state.showOsmLayer
);

export const selectShowPlzLayer = createSelector(
  selectMapState,
  (state: MapState) => state.showPlzLayer
);

export const selectShowFederalStateBoundariesLayer = createSelector(
  selectMapState,
  (state: MapState) => state.showFederalStateBoundariesLayer
);
