import { Component, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import { MatDialog } from "@angular/material/dialog";
import { MatMenuTrigger } from "@angular/material/menu";
import { Observable } from "rxjs";
import { openHeatmapUploadDialog } from "../../core/store/actions/open-heatmap-dialog.action";
import { openGroupUploadDialog } from "../../core/store/actions/open-group-dialog.action";
import { clearSelectedVisualization, selectVisualization } from "../../core/store/actions/select-visualization.action";
import { deleteVisualization } from "../../core/store/actions/delete-visualization.action";
import { logout } from "../../core/store/auth/auth.actions";
import { selectCurrentUser } from "../../core/store/auth/auth.selectors";
import { User } from "../../models/user.model";
import { VisualizationInfo } from "../../models/visualization-info.model";
import { VisualizationType } from "../../models/visualization-type.enum";
import { ConfirmDeleteDialogComponent } from "./dialogs/confirm-delete-dialog.component";
import { GuidanceDialogComponent } from "./dialogs/guidance-dialog.component";
import { LayersDialogComponent } from "./dialogs/layers-dialog.component";
import { ExportPdfDialogComponent } from "./dialogs/export-pdf-dialog.component";
import { PdfExportOptions } from "../../models/pdf-export-options.model";

@Component({
  selector: 'app-header',
  standalone: false,
  template: `
      
      <img src="zip-app-logo.png" alt="ZIP App Logo" class="header-logo">
      <button mat-icon-button matTooltip="Clear visualization" (click)="clearVisualization()">
        <mat-icon>deselect</mat-icon>
      </button>
      <div class="search-container">
        <mat-form-field class="example-full-width">
          <mat-label>Postal Code</mat-label>
          <input matInput [(ngModel)]="postalCode" (keyup.enter)="searchPostalCode()">
        </mat-form-field>
        <button mat-raised-button (click)="searchPostalCode()">Search</button>
      </div>

      <button mat-raised-button (click)="openHeatmapDialog()">Heatmap Visualization</button>
      <button mat-raised-button (click)="openGroupDialog()">Group Visualization</button>
      <button mat-raised-button (click)="openLayersDialog()">Layers</button>
      <div
        class="user-menu"
        [matMenuTriggerFor]="menu"
        (mouseenter)="openUserMenu()"
        #userMenuTrigger="matMenuTrigger">
        <span *ngIf="user$ | async as user">{{ user.email }}</span>
        <mat-icon class="menu-icon">account_circle</mat-icon>
      </div>
        <mat-menu #menu="matMenu" xPosition="before" class="user-menu-panel">
          <button mat-menu-item class="reverse-arrow" [matMenuTriggerFor]="visualizationsMenu">My Visualizations</button>
          <button mat-menu-item (click)="openExportDialog()">Export</button>
          <button mat-menu-item (click)="openGuidanceDialog()">Guidance</button>
          <button mat-menu-item (click)="onLogout()">Log Out</button>
        </mat-menu>
        <mat-menu #visualizationsMenu="matMenu" xPosition="before" class="visualizations-menu-panel">
          <div class="visualizations-list">
            <div
              class="visualization-item"
              *ngFor="let visualization of visualizations"
              (click)="onVisualizationClick(visualization)"
            >
              <div class="visualization-labels">
                <span class="visualization-type">{{ visualization.type === visualizationType.Heatmap ? 'Heatmap' : 'Group' }}</span>
                <span class="visualization-name">{{ visualization.name }}</span>
              </div>
              <button
                mat-icon-button
                class="delete-button"
                [matTooltip]="'Delete'"
                (click)="onDeleteClick($event, visualization)">
                <mat-icon>close</mat-icon>
              </button>
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
    .header-logo {
      height: 50px;
      margin-left: 10px;
    }
    .user-menu {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      margin-right: 10px;
      cursor: pointer;
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
    .mat-mdc-menu-item {
      text-align: center !important;
    }
    .reverse-arrow {
      flex-direction: row-reverse;
      justify-content: flex-end;
    }
    .reverse-arrow ::ng-deep .mat-mdc-menu-submenu-icon {
      transform: rotate(180deg);
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
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      cursor: pointer;
    }
    .visualization-item:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    .visualization-labels {
      display: flex;
      flex-direction: column;
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
    .delete-button {
      width: 24px;
      height: 24px;
      margin-top: 15px;
      padding: 0;
      line-height: 24px;
      flex-shrink: 0;
    }
    .delete-button .mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .visualization-empty {
      padding: 8px 16px;
      color: grey;
    }
    `]
})
export class HeaderComponent {
  @Input() visualizations: VisualizationInfo[] | null = [];
  @Output() postalCodeSearch = new EventEmitter<string>();
  @Output() pdfExport = new EventEmitter<PdfExportOptions>();

  @ViewChild(MatMenuTrigger) private userMenuTrigger?: MatMenuTrigger;

  readonly visualizationType = VisualizationType;
  readonly user$: Observable<User | null>;
  postalCode = '';
  private userMenuOpen = false;
 

  constructor(
    private readonly store: Store,
    private readonly dialog: MatDialog
  ) {
    this.user$ = this.store.select(selectCurrentUser);
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

  openLayersDialog(): void {
    this.dialog.open(LayersDialogComponent, {
      width: '320px'
    });
  }

  openGuidanceDialog(): void {
    this.dialog.open(GuidanceDialogComponent, {
      width: '600px',
      maxWidth: '90vw'
    });
  }

  openExportDialog(): void {
    this.dialog.open(ExportPdfDialogComponent, {
      width: '360px',
      maxWidth: '90vw'
    }).afterClosed().subscribe((options: PdfExportOptions | undefined) => {
      if (options) {
        this.pdfExport.emit(options);
      }
    });
  }

  searchPostalCode(): void {
    const postalCode = this.postalCode.trim();

    if (postalCode) {
      this.postalCodeSearch.emit(postalCode);
    }
  }

  clearVisualization(): void {
    this.store.dispatch(clearSelectedVisualization());
  }

  openUserMenu(): void {
    this.userMenuTrigger?.openMenu();
  }

  onVisualizationClick(visualization: VisualizationInfo): void {
    this.store.dispatch(
      selectVisualization({ id: visualization.id })
    );
  }

  onDeleteClick(event: MouseEvent, visualization: VisualizationInfo): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '350px',
      data: { name: visualization.name }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(
          deleteVisualization({ id: visualization.id, name: visualization.name })
        );
      }
    });
  }

  onLogout(): void {
    this.store.dispatch(logout());
  }
}
