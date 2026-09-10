import { Component } from '@angular/core';

@Component({
  selector: 'app-guidance-dialog',
  standalone: false,
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Guidance</h2>
      <button mat-icon-button class="close-button" mat-dialog-close aria-label="Close guidance">X</button>
    </div>

    <mat-dialog-content class="dialog-content">
      <p>The application offers two types of visualisation: A heatmap and a group visualization. Both are created from a local list of German postal codes and numeric values.</p>

      <h3>Prepare your postal code list</h3>
      <p>Create a <code>.csv</code> or <code>.txt</code> file with one postal code and one value per line. Use either a comma or semicolon to separate both fields.</p>
      <pre>10115,125
20095;87
80331,42</pre>
      <p>Postal codes must contain exactly five digits. A header row is optional and invalid rows are ignored.</p>

      <h3>Create a heatmap</h3>
      <p>Select <strong>Heatmap Visualization</strong>, choose your file, and set the start and end colors. The application groups the numeric values into color ranges automatically. Use a heatmap for examples such as infection counts, company revenue, population density, delivery volumes, or customer activity by postal code.</p>

      <h3>Create a group visualization</h3>
      <p>Select <strong>Group Visualization</strong>, choose your file, and set the start and end colors. Each distinct numeric value becomes a separate group and can be given a custom name or color in the legend. This is useful for sales territories, service regions, branch assignments, delivery zones, or responsibility areas.</p>

      <h3>Explore the result</h3>
      <p>After uploading, open your visualization from <strong>My Visualizations</strong>. Click a legend row to highlight all postal code areas belonging to that group or heatmap range on the map. The selected legend row is highlighted as well. Use the <strong>Deselect</strong> button below the legend to remove the highlighted postal codes.</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" mat-dialog-close>Close</button>
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

    .close-button {
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    }

    .dialog-content {
      max-height: 65vh;
      overflow-y: auto;
      padding: 0 24px;
      line-height: 1.5;
    }

    h3 {
      margin: 20px 0 8px;
      font-size: 16px;
    }

    p {
      margin: 0 0 12px;
    }

    pre {
      margin: 0 0 12px;
      padding: 8px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.06);
    }
  `]
})
export class GuidanceDialogComponent {
}