import { Component, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { openHeatmapUploadDialog } from "../../core/store/actions/open-heatmap-dialog.action";
import { openGroupUploadDialog } from "../../core/store/actions/open-group-dialog.action";
import { VisualizationInfo } from "../../models/visualization-info.model";
import { VisualizationType } from "../../models/visualization-type.enum";

@Component({
  selector: 'app-header',
  standalone: false,
  template: `
      
      <mat-icon>map_search</mat-icon>
      <div class="search-container">
        <mat-form-field class="example-full-width">
          <mat-label>Postal Code</mat-label>
          <input matInput>
        </mat-form-field>
        <button mat-raised-button>Search</button>
      </div>

      <button mat-raised-button (click)="openHeatmapDialog()">Heatmap Visualization</button>
      <button mat-raised-button (click)="openGroupDialog()">Group Visualization</button>
      <div class="user-menu" [matMenuTriggerFor]="menu">
        <mat-label>MyUserName&#64;company.com</mat-label>
        <mat-icon class="menu-icon">account_circle</mat-icon>
      </div>
        <mat-menu #menu="matMenu">
          <button mat-menu-item [matMenuTriggerFor]="visualizationsMenu">My Visualizations</button>
          <button mat-menu-item>Log Out</button>
        </mat-menu>
        <mat-menu #visualizationsMenu="matMenu">
          <div class="visualizations-list">
            <div
              class="visualization-item"
              *ngFor="let visualization of visualizations"
              (click)="onVisualizationClick(visualization)"
            >
              <span class="visualization-type">{{ visualization.type === visualizationType.Heatmap ? 'Heatmap' : 'Group' }}</span>
              <span class="visualization-name">{{ visualization.name }}</span>
            </div>
            <div class="visualization-empty" *ngIf="!visualizations || visualizations.length === 0">
              No visualizations
            </div>
          </div>
        </mat-menu>
    `,
  styles: [`
    :host {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      background: #ebebeb;
      height: 60px;
    }
    .user-menu {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      margin-right: 10px;
    }
    mat-form-field {
      margin-top:20px;
      width: 200px;
      height: 70px;
      .mat-mdc-text-field-wrapper{
        border-radius: 15px;
      }
    }
    mat-menu{
      .cdk-overlay-connected-position-bounding-box{
        align-items: end !important;
      }
    }
    menu-icon {
      .mat-icon {
        font-size: xx-large;
        height: 30px;
        width: 30px;
        }
      }
    .search-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 5px;
    }
    .visualizations-list {
      max-height: 250px;
      overflow-y: auto;
      min-width: 200px;
    }
    .visualization-item {
      display: flex;
      flex-direction: column;
      padding: 8px 16px;
      cursor: pointer;
    }
    .visualization-item:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    .visualization-type {
      font-size: 10px;
      text-transform: uppercase;
      color: grey;
      opacity: 0.6;
    }
    .visualization-name {
      font-size: 14px;
    }
    .visualization-empty {
      padding: 8px 16px;
      color: grey;
    }
    `]
})
export class HeaderComponent {
  @Input() visualizations: VisualizationInfo[] | null = [];

  readonly visualizationType = VisualizationType;

  constructor(
    private readonly store: Store
  ) {
  }

  openHeatmapDialog(): void {
    this.store.dispatch(
      openHeatmapUploadDialog()
    );
  }

  openGroupDialog(): void {
    this.store.dispatch(
      openGroupUploadDialog()
    );
  }

  onVisualizationClick(visualization: VisualizationInfo): void {
    // no-op for now
  }
}
