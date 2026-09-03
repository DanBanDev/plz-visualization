import { Component, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../core/store/app-state';
import { GroupUploadState } from '../../../core/store/group-upload/group-upload-state';
import { uploadGroupVisualization } from '../../../core/store/actions/upload-group-visualization.action';

import { VisualizationValue } from '../../../models/visualization-value.model';
import { GroupLegendItem } from '../../../models/group-legend-item.model';
import { CreateGroupVisualization } from '../../../models/create-group-visualization.model';

import { parseGroupCsv } from '../../../functions/parse-group-csv.function';
import { generateGroupLegend, MAX_GROUP_COUNT } from '../../../functions/generate-group-legend.function';


@Component({
  selector: 'app-group-upload-dialog',
  standalone: false,
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Upload Group Visualization</h2>
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
          accept=".csv"
          hidden
          (change)="onFileSelected($event)">

        <span class="file-path">
          {{ selectedFilePath || 'Keine Datei ausgewählt' }}
        </span>
      </div>

      <div class="row" *ngIf="parsedValues.length > 0">
        <span><strong>{{ parsedValues.length }}</strong> postcode values were read in.</span>
      </div>

      <div class="row" *ngIf="exceedsGroupLimit">
        <span class="error-text">Es wurden mehr als {{ maxGroupCount }} Gruppen erkannt. Bitte eine CSV mit weniger Gruppen wählen.</span>
      </div>

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

      <!-- Dynamische, editierbare Legende -->
      <div class="legend-container">

        <div
          class="legend-row"
          *ngFor="let item of legendItems">

          <input
            type="color"
            [(ngModel)]="item.color">

          <span class="legend-value">{{ item.value }}</span>

          <input
            class="legend-name"
            [(ngModel)]="item.name">

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
        [disabled]="parsedValues.length === 0 || exceedsGroupLimit || (uploadState$ | async)?.status === 'loading'"
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
      max-height: 240px;
      overflow-y: auto;
    }

    .legend-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .legend-row input[type="color"] {
      width: 32px;
      height: 32px;
      border: none;
      cursor: pointer;
      background: transparent;
      flex-shrink: 0;
    }

    .legend-value {
      min-width: 32px;
    }

    .legend-name {
      flex: 1;
      border: 1px solid rgba(0,0,0,0.2);
      border-radius: 4px;
      padding: 4px 8px;
    }

    .error-text {
      color: #d32f2f;
    }
  `]
})
export class GroupUploadDialogComponent {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly maxGroupCount = MAX_GROUP_COUNT;

  selectedFilePath = '';
  visualizationName = '';

  startColor = '#00ff00';
  endColor = '#ff0000';

  gradientStyle = '';

  parsedValues: VisualizationValue[] = [];
  legendItems: GroupLegendItem[] = [];
  exceedsGroupLimit = false;

  uploadState$: Observable<GroupUploadState>;

  constructor(
    private readonly store: Store<AppState>
  ) {
    this.uploadState$ = this.store.select(state => state.groupUpload);
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
    this.visualizationName = file.name.replace(/\.csv$/i, '');

    file.text().then(csvText => {
      this.parsedValues = parseGroupCsv(csvText);
      this.updateGradient();
    });
  }

  updateGradient(): void {
    this.gradientStyle =
      `linear-gradient(to right, ${this.startColor}, ${this.endColor})`;

    if (this.parsedValues.length === 0) {
      return;
    }

    const previousNames = new Map(this.legendItems.map(item => [item.value, item.name]));

    const { legend, exceedsLimit } = generateGroupLegend(
      this.parsedValues.map(value => value.value),
      this.startColor,
      this.endColor
    );

    this.exceedsGroupLimit = exceedsLimit;
    this.legendItems = legend.map(item => ({
      ...item,
      name: previousNames.get(item.value) ?? item.name
    }));
  }

  upload(): void {
    const model: CreateGroupVisualization = {
      name: this.visualizationName,
      values: this.parsedValues,
      legend: this.legendItems
    };

    this.store.dispatch(uploadGroupVisualization({ model }));
  }

}

