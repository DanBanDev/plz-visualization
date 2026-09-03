import { createReducer, on } from '@ngrx/store';
import { MapState } from './map-state';
import { setLayerVisibility } from '../actions/set-layer-visibility.action';

export const initialState: MapState = {
  selectedPostalCode: null,
  showOsmLayer: true,
  showPlzLayer: true,
  showFederalStateBoundariesLayer: true
};

export const mapReducer = createReducer(
  initialState,
  on(setLayerVisibility, (state, { showOsmLayer, showPlzLayer, showFederalStateBoundariesLayer }) => ({
    ...state,
    showOsmLayer,
    showPlzLayer,
    showFederalStateBoundariesLayer
  }))
);