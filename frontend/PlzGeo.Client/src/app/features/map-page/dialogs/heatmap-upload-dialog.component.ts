import { Component } from '@angular/core';


@Component({
  selector: 'app-heatmap-upload-dialog',
  standalone: false,
  template: `
    <h2 mat-dialog-title>Upload Heatmap</h2>

    <mat-dialog-content class="dialog-content">

      <!-- CSV Auswahl -->
      <div class="row">
        <button
          mat-raised-button
          color="primary"
          (click)="selectCsvFile()">
          Select CSV File
        </button>

        <span class="file-path">
          {{ selectedFilePath || 'Keine Datei ausgewählt' }}
        </span>
      </div>

      <!-- Farbauswahl -->
      <div class="row color-picker-row">

        <div class="color-container">
          <label>Start Color</label>
          <input
            type="color"
            model="startColor"
            (input)="updateGradient()">
        </div>

        <div class="color-container">
          <label>End Color</label>
          <input
            type="color"
            model="endColor"
            (input)="updateGradient()">
        </div>

      </div>

      <!-- Farbverlauf -->
      <div
        class="gradient-preview"
        [style.background]="gradientStyle">
      </div>

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
            Von {{ item.from }} bis {{ item.to }}
          </span>

        </div>

      </div>

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>
        Cancel
      </button>

      <button
        mat-raised-button
        color="primary"
        (click)="upload()">
        Upload
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 600px;
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
  `]
})
export class HeatmapUploadDialogComponent {

  selectedFilePath = '';

  startColor = '#00ff00';
  endColor = '#ff0000';

  gradientStyle = '';

  legendItems = [
    { color: '#00ff00', from: 0, to: 10 },
    { color: '#80ff00', from: 10, to: 20 },
    { color: '#ffff00', from: 20, to: 30 },
    { color: '#ff8000', from: 30, to: 40 },
    { color: '#ff0000', from: 40, to: 50 }
  ];

  constructor() {
    this.updateGradient();
  }

  selectCsvFile(): void {
    // später FilePicker öffnen
  }

  updateGradient(): void {
    this.gradientStyle =
      `linear-gradient(to right, ${this.startColor}, ${this.endColor})`;
  }

  upload(): void {
    // später Upload implementieren
  }

}