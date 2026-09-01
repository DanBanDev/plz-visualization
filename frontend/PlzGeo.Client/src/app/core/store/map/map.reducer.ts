import { createReducer, on } from '@ngrx/store';
import { MapState } from './map-state';
import { setLayerVisibility } from '../actions/set-layer-visibility.action';
import { selectVisualization, selectVisualizationSuccess } from '../actions/select-visualization.action';

export const initialState: MapState = {
  selectedPostalCode: null,
  showOsmLayer: true,
  showPlzLayer: true
};

export const mapReducer = createReducer(
  initialState,
  on(setLayerVisibility, (state, { showOsmLayer, showPlzLayer }) => ({
    ...state,
    showOsmLayer,
    showPlzLayer
  })),
  on(selectVisualization, selectVisualizationSuccess, (state) => ({
    ...state,
    showPlzLayer: true
  }))
);