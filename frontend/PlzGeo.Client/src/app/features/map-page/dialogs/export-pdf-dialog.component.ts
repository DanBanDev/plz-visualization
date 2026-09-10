import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PdfExportOptions } from '../../../models/pdf-export-options.model';

@Component({
  selector: 'app-export-pdf-dialog',
  standalone: false,
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Export PDF</h2>
      <button mat-icon-button mat-dialog-close matTooltip="Close">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <mat-form-field>
        <mat-label>Page format</mat-label>
        <mat-select [(ngModel)]="options.pageFormat">
          <mat-option value="a4">A4</mat-option>
          <mat-option value="a3">A3</mat-option>
          <mat-option value="letter">Letter</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Orientation</mat-label>
        <mat-select [(ngModel)]="options.orientation">
          <mat-option value="landscape">Landscape</mat-option>
          <mat-option value="portrait">Portrait</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Resolution</mat-label>
        <mat-select [(ngModel)]="options.dpi">
          <mat-option [value]="150">150 DPI</mat-option>
          <mat-option [value]="200">200 DPI</mat-option>
          <mat-option [value]="300">300 DPI</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="export()">Export</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 0 16px;
    }

    .dialog-header button {
      position: absolute;
      right: 8px;
    }

    h2[mat-dialog-title] {
      margin: 0;
      padding: 0;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 280px;
      padding: 16px;
    }
  `]
})
export class ExportPdfDialogComponent {
  options: PdfExportOptions = {
    pageFormat: 'a4',
    orientation: 'landscape',
    dpi: 200
  };

  constructor(private readonly dialogRef: MatDialogRef<ExportPdfDialogComponent>) {}

  export(): void {
    this.dialogRef.close(this.options);
  }
}