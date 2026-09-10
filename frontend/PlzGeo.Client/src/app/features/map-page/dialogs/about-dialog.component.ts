import { Component } from '@angular/core';

@Component({
  selector: 'app-about-dialog',
  standalone: false,
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>About</h2>
      <button mat-icon-button mat-dialog-close matTooltip="Close">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <h4>PLZ Visualisierung</h4>
      <p>Interactive visualization of German postal code areas.</p>
      <p>Version 0.8.0.</p>

      <section>
        <h4>Source Code</h4>
        <a href="https://github.com/DanBanDev/plz-visualization" target="_blank" rel="noopener noreferrer">
          github.com/DanBanDev/plz-visualization
        </a>
      </section>

      <section>
        <h4>Developed by</h4>
        <p>Daniel Urban</p>
      </section>

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
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
      gap: 16px;
      min-width: 300px;
      padding: 16px;
    }

    h3, h4, p {
      margin: 0;
    }

    h3 {
      font-size: 20px;
    }

    h4 {
      margin-bottom: 4px;
      font-size: 14px;
    }

    a {
      color: #11788b;
    }
  `]
})
export class AboutDialogComponent {}