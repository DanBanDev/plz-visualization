import { Component, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../core/store/app-state';
import { HeatmapUploadState } from '../../../core/store/heatmap-upload/heatmap-upload-state';
import { uploadHeatmapVisualization } from '../../../core/store/actions/upload-heatmap-visualization.action';

import { VisualizationValue } from '../../../models/visualization-value.model';
import { HeatmapLegendItem } from '../../../models/heatmap-legend-item.model';
import { CreateHeatmapVisualization } from '../../../models/create-heatmap-visualization.model';

import { parseHeatmapCsv } from '../../../functions/parse-heatmap-csv.function';
import { generateHeatmapLegend } from '../../../functions/generate-heatmap-legend.function';


@Component({
  selector: 'app-heatmap-upload-dialog',
  standalone: false,
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Upload Heatmap</h2>
      <button mat-icon-button class="close-button" mat-dialog-close>X</button>
    </div>

    <mat-dialog-content class="dialog-content">

      <!-- CSV Auswahl -->
      <div class="row">
        <button
          mat-raised-button
          color="primary"
          (click)="selectCsvFile()">
          Select CSV File
        </button>

        <input
          #fileInput
          type="file"
          accept=".csv,.txt"
          hidden
          (change)="onFileSelected($event)">

        <span class="file-path">
          {{ selectedFilePath || 'Keine Datei ausgewählt' }}
        </span>
      </div>

      <div class="row" *ngIf="parsedValues.length > 0">
        <span><strong>{{ parsedValues.length }}</strong> postcode values were read in.</span>
      </div>

      <ng-container *ngIf="parsedValues.length > 0">
        <!-- Farbauswahl -->
        <div class="row color-picker-row">

          <div class="color-container">
            <label>Start Color</label>
            <input
              type="color"
              [(ngModel)]="startColor"
              (input)="updateGradient()">
          </div>

          <div class="color-container">
            <label>End Color</label>
            <input
              type="color"
              [(ngModel)]="endColor"
              (input)="updateGradient()">
          </div>

        </div>

        <!-- Farbverlauf -->
        <div
          class="gradient-preview"
          [style.background]="gradientStyle">
        </div>
      </ng-container>

      <!-- Dynamische Legende -->
      <div class="legend-container">

        <div
          class="legend-row"
          *ngFor="let item of legendItems">

          <div
            class="legend-color"
            [style.background]="item.color">
          </div>

          <span>
            Von <strong>{{ item.fromValue }}</strong> bis <strong>{{ item.toValue }}</strong>
          </span>

        </div>

      </div>

      <div class="row" *ngIf="(uploadState$ | async)?.status === 'error'">
        <span class="error-text">{{ (uploadState$ | async)?.error }}</span>
      </div>

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="(uploadState$ | async)?.status === 'loading'">
        Cancel
      </button>

      <mat-spinner
        *ngIf="(uploadState$ | async)?.status === 'loading'"
        diameter="24">
      </mat-spinner>

      <button
        mat-raised-button
        color="primary"
        [disabled]="parsedValues.length === 0 || (uploadState$ | async)?.status === 'loading'"
        (click)="upload()">
        Upload
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 395px;
    }

    .close-button {
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .file-path {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .color-picker-row {
      justify-content: space-between;
    }

    .color-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .color-container input[type="color"] {
      width: 80px;
      height: 40px;
      border: none;
      cursor: pointer;
      background: transparent;
    }

    .gradient-preview {
      height: 40px;
      border-radius: 4px;
      border: 1px solid rgba(0,0,0,0.12);
    }

    .legend-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .legend-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .legend-color {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid rgba(0,0,0,0.2);
    }

    .error-text {
      color: #d32f2f;
    }
  `]
})
export class HeatmapUploadDialogComponent {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFilePath = '';
  visualizationName = '';

  startColor = '#00ff00';
  endColor = '#ff0000';

  gradientStyle = '';

  parsedValues: VisualizationValue[] = [];
  legendItems: HeatmapLegendItem[] = [];

  uploadState$: Observable<HeatmapUploadState>;

  constructor(
    private readonly store: Store<AppState>
  ) {
    this.uploadState$ = this.store.select(state => state.heatmapUpload);
    this.updateGradient();
  }

  selectCsvFile(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.selectedFilePath = file.name;
    this.visualizationName = file.name.replace(/\.(csv|txt)$/i, '');

    file.text().then(csvText => {
      this.parsedValues = parseHeatmapCsv(csvText);
      this.updateGradient();
    });
  }

  updateGradient(): void {
    this.gradientStyle =
      `linear-gradient(to right, ${this.startColor}, ${this.endColor})`;

    if (this.parsedValues.length > 0) {
      this.legendItems = generateHeatmapLegend(
        this.parsedValues.map(value => value.value),
        this.startColor,
        this.endColor
      );
    }
  }

  upload(): void {
    const model: CreateHeatmapVisualization = {
      name: this.visualizationName,
      values: this.parsedValues,
      legend: this.legendItems
    };

    this.store.dispatch(uploadHeatmapVisualization({ model }));
  }

}