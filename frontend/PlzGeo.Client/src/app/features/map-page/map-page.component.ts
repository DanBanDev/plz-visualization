import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { VisualizationInfo } from '../../models/visualization-info.model';
import { selectVisualizations } from '../../core/store/visualizations/visualizations.selectors';
import { MapComponent } from './map.component';
import { PdfExportOptions } from '../../models/pdf-export-options.model';


@Component({
  selector: 'app-map-page',
  standalone: false,
  template: `
      <app-header
        [visualizations]="visualizations$ | async"
        (postalCodeSearch)="onPostalCodeSearch($event)"
        (pdfExport)="onPdfExport($event)"
        (clearMap)="onClearMap()">
      </app-header>
      <app-map #map></app-map>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    app-header {
      flex: 0 0 64px;
    }

    app-map {
      flex: 1;
    }
    `]
})
export class MapPageComponent {
  @ViewChild('map') private mapComponent?: MapComponent;

  readonly visualizations$: Observable<VisualizationInfo[]>;

  constructor(
    private readonly store: Store
  ) {
    this.visualizations$ = this.store.select(selectVisualizations);
  }

  onPostalCodeSearch(postalCode: string): void {
    this.mapComponent?.searchPostalCode(postalCode);
  }

  onPdfExport(options: PdfExportOptions): void {
    this.mapComponent?.exportToPdf(options);
  }

  onClearMap(): void {
    this.mapComponent?.deselectHighlightedPostalCodes();
  }
}
