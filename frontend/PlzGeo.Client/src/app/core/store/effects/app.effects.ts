import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { openHeatmapUploadDialog } from '../actions/open-heatmap-dialog.action';
import { HeatmapUploadDialogComponent } from '../../../features/map-page/dialogs/heatmap-upload-dialog.component';


@Injectable()
export class AppEffects {
  private readonly actions$ = inject(Actions);
  private readonly dialog = inject(MatDialog);

  openHeatmapUploadDialog$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(openHeatmapUploadDialog),
        tap(() => {
          this.dialog.open(HeatmapUploadDialogComponent, {
            width: '700px',
            maxWidth: '90vw',
            disableClose: true
          });
        })
      ),
    { dispatch: false }
  );

}