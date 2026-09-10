import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MapPageComponent } from './map-page.component';
import { HeaderComponent } from './header.component';
import { MapComponent } from './map.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HeatmapUploadDialogComponent } from './dialogs/heatmap-upload-dialog.component';
import { GroupUploadDialogComponent } from './dialogs/group-upload-dialog.component';
import { ConfirmDeleteDialogComponent } from './dialogs/confirm-delete-dialog.component';
import { GuidanceDialogComponent } from './dialogs/guidance-dialog.component';
import { LayersDialogComponent } from './dialogs/layers-dialog.component';
import { ExportPdfDialogComponent } from './dialogs/export-pdf-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { AboutDialogComponent } from './dialogs/about-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PostalCodeSnackbarComponent } from './postal-code-snackbar.component';


@NgModule({
  declarations: [MapPageComponent, HeaderComponent, MapComponent, HeatmapUploadDialogComponent, GroupUploadDialogComponent, ConfirmDeleteDialogComponent, GuidanceDialogComponent, LayersDialogComponent, ExportPdfDialogComponent, AboutDialogComponent, PostalCodeSnackbarComponent],
  imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatSelectModule,
        MatSnackBarModule
  ],
  exports: [
    MapPageComponent
  ]
})
export class MapPageModule { }
