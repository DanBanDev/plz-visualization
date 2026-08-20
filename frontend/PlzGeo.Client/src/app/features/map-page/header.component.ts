import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { openHeatmapUploadDialog } from "../../core/store/actions/open-heatmap-dialog.action";

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
      <button mat-raised-button>Group Visualization</button>
      <div class="user-menu" [matMenuTriggerFor]="menu">
        <mat-label>MyUserName&#64;company.com</mat-label>
        <mat-icon class="menu-icon">account_circle</mat-icon>
      </div>
        <mat-menu #menu="matMenu">
          <button mat-menu-item>My Visualizations</button>
          <button mat-menu-item>Log Out</button>
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
    `]
})
export class HeaderComponent {
    constructor(
    private readonly store: Store
  ) {
  }

  openHeatmapDialog(): void {
    this.store.dispatch(
      openHeatmapUploadDialog()
    );
  }
}
