import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapPageComponent } from './map-page.component';
import { HeaderComponent } from './header.component';
import { MapComponent } from './map-component';


@NgModule({
  declarations: [MapPageComponent, HeaderComponent, MapComponent],
  imports: [
    CommonModule
  ],
  exports: [
    MapPageComponent
  ]
})
export class MapPageModule { }
