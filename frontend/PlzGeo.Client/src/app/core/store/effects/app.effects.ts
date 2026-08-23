import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { openHeatmapUploadDialog } from '../actions/open-heatmap-dialog.action';
import { openGroupUploadDialog } from '../actions/open-group-dialog.action';
import {
  uploadHeatmapVisualization,
  uploadHeatmapVisualizationSuccess,
  uploadHeatmapVisualizationFailure,
  resetHeatmapUploadState
} from '../actions/upload-heatmap-visualization.action';
import {
  uploadGroupVisualization,
  uploadGroupVisualizationSuccess,
  uploadGroupVisualizationFailure,
  resetGroupUploadState
} from '../actions/upload-group-visualization.action';
import {
  selectVisualization,
  selectVisualizationFailure,
  selectVisualizationSuccess
} from '../actions/select-visualization.action';
import { HeatmapUploadDialogComponent } from '../../../features/map-page/dialogs/heatmap-upload-dialog.component';
import { GroupUploadDialogComponent } from '../../../features/map-page/dialogs/group-upload-dialog.component';
import { VisualizationApiClient } from '../../../api-clients/apis/visualization.api-client';


@Injectable()
export class AppEffects {
  private readonly actions$ = inject(Actions);
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(Store);
  private readonly visualizationApiClient = inject(VisualizationApiClient);

  openHeatmapUploadDialog$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(openHeatmapUploadDialog),
        tap(() => {
          this.store.dispatch(resetHeatmapUploadState());

          this.dialog.open(HeatmapUploadDialogComponent, {
            width: '400px',
            maxWidth: '90vw',
            disableClose: true
          });
        })
      ),
    { dispatch: false }
  );

  uploadHeatmapVisualization$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(uploadHeatmapVisualization),
        mergeMap(({ model }) =>
          this.visualizationApiClient.createHeatmapVisualization(model).pipe(
            map(visualization => uploadHeatmapVisualizationSuccess({ visualization })),
            catchError(error =>
              of(uploadHeatmapVisualizationFailure({
                error: error?.error?.message ?? error?.message ?? 'Upload fehlgeschlagen'
              }))
            )
          )
        )
      )
  );

  closeDialogOnUploadSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(uploadHeatmapVisualizationSuccess),
        tap(() => this.dialog.closeAll())
      ),
    { dispatch: false }
  );

  openGroupUploadDialog$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(openGroupUploadDialog),
        tap(() => {
          this.store.dispatch(resetGroupUploadState());

          this.dialog.open(GroupUploadDialogComponent, {
            width: '400px',
            maxWidth: '90vw',
            disableClose: true
          });
        })
      ),
    { dispatch: false }
  );

  uploadGroupVisualization$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(uploadGroupVisualization),
        mergeMap(({ model }) =>
          this.visualizationApiClient.createGroupVisualization(model).pipe(
            map(visualization => uploadGroupVisualizationSuccess({ visualization })),
            catchError(error =>
              of(uploadGroupVisualizationFailure({
                error: error?.error?.message ?? error?.message ?? 'Upload fehlgeschlagen'
              }))
            )
          )
        )
      )
  );

  closeDialogOnGroupUploadSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(uploadGroupVisualizationSuccess),
        tap(() => this.dialog.closeAll())
      ),
    { dispatch: false }
  );

  selectVisualization$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(selectVisualization),
        mergeMap(({ id }) =>
          this.visualizationApiClient.getVisualization(id).pipe(
            map(visualization => selectVisualizationSuccess({ visualization })),
            catchError(error =>
              of(selectVisualizationFailure({
                error: error?.error?.message ?? error?.message ?? 'Visualisierung konnte nicht geladen werden'
              }))
            )
          )
        )
      )
  );

}

