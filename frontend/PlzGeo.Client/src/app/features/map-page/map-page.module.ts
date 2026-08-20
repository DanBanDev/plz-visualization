import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { HeatmapUploadDialogComponent } from './dialogs/heatmap-upload-dialog.component';


@NgModule({
  declarations: [MapPageComponent, HeaderComponent, MapComponent, HeatmapUploadDialogComponent],
  imports: [
        CommonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule
  ],
  exports: [
    MapPageComponent
  ]
})
export class MapPageModule { }
