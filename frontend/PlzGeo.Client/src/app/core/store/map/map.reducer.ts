import { createReducer } from '@ngrx/store';
import { MapState } from './map-state';

export const initialState: MapState = {
  selectedPostalCode: null
};

export const mapReducer = createReducer(
  initialState
);