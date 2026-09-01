import { createAction, props } from '@ngrx/store';

export const setLayerVisibility = createAction(
  '[Map] Set Layer Visibility',
  props<{ showOsmLayer: boolean; showPlzLayer: boolean }>()
);
