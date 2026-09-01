import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { AppState } from '../../../core/store/app-state';
import { setLayerVisibility } from '../../../core/store/actions/set-layer-visibility.action';
import { selectShowOsmLayer, selectShowPlzLayer } from '../../../core/store/map/map.selectors';

@Component({
  selector: 'app-layers-dialog',
  standalone: false,
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Layers</h2>
      <button mat-icon-button class="close-button" mat-dialog-close>X</button>
    </div>

    <mat-dialog-content class="dialog-content">
      <div class="checkbox-group">
        <mat-checkbox [(ngModel)]="showOsmLayer">
          Hintergrundkarte (OpenStreetMap)
        </mat-checkbox>
        <mat-checkbox [(ngModel)]="showPlzLayer">
          PLZ-Layer
        </mat-checkbox>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Abbrechen</button>
      <button mat-raised-button color="primary" (click)="onOk()">Ok</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
    }
    .close-button {
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    }
    .dialog-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
    }
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `]
})
export class LayersDialogComponent implements OnInit {
  showOsmLayer = true;
  showPlzLayer = true;

  constructor(
    private readonly store: Store<AppState>,
    private readonly dialogRef: MatDialogRef<LayersDialogComponent>
  ) {}

  ngOnInit(): void {
    this.store.select(selectShowOsmLayer).pipe(take(1)).subscribe(show => {
      this.showOsmLayer = show;
    });
    this.store.select(selectShowPlzLayer).pipe(take(1)).subscribe(show => {
      this.showPlzLayer = show;
    });
  }

  onOk(): void {
    this.store.dispatch(setLayerVisibility({
      showOsmLayer: this.showOsmLayer,
      showPlzLayer: this.showPlzLayer
    }));
    this.dialogRef.close();
  }
}
