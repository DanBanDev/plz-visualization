import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import OLMap from 'ol/Map';
import type MapBrowserEvent from 'ol/MapBrowserEvent';
import Feature, { type FeatureLike } from 'ol/Feature';
import type Geometry from 'ol/geom/Geometry';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import type { StyleFunction } from 'ol/style/Style';
import { getCenter } from 'ol/extent';
import { Subject, takeUntil } from "rxjs";
import { GeographicDataApiClient } from "../../api-clients/apis/geographic-data.api-client";
import { createGeoJsonVectorLayer } from "../../functions/create-geojson-vector-layer.function";
import { Visualization } from "../../models/visualization.model";
import { VisualizationType } from "../../models/visualization-type.enum";
import { AppState } from "../../core/store/app-state";
import { selectIsLoadingSelectedVisualization, selectSelectedVisualization } from "../../core/store/visualizations/visualizations.selectors";
import { selectShowFederalStateBoundariesLayer, selectShowOsmLayer, selectShowPlzLayer } from "../../core/store/map/map.selectors";
import { defaultStylePostalLayer } from "../../constants/default-style-postal-layer.constant";
import { federalBoundariesLayerStyle } from "../../constants/federal-boundaries-layer-style.constant";
import { defaultOlMapView } from "../../constants/default-ol-map-view.constant";
import { postalCodeHighlightLayerStyle } from "../../constants/postal-code-highlight-layer-style.constant";
import { PdfExportOptions } from '../../models/pdf-export-options.model';
import { MapPdfExportService } from './services/map-pdf-export.service';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { PostalCodeSnackbarComponent } from './postal-code-snackbar.component';
import { getColorForValue } from '../../functions/get-color-for-value.function';
import { getPostalCodeFromFeature } from '../../functions/get-postal-code-from-feature.function';
import { buildLegendRows, LegendRow } from '../../functions/build-legend-rows.function';

@Component({
  selector: 'app-map',
  standalone: false,
  template: `
    <div class="map-shell">
      <div #mapContainer class="map-container"></div>
      <span class="copyright-label">&#64;DanBanDev {{ currentYear }}</span>

      <div class="map-loading-overlay" *ngIf="isLoadingVisualization">
        <mat-spinner diameter="44"></mat-spinner>
      </div>

      <div class="map-legend" *ngIf="selectedVisualization">
        <div class="legend-title">{{ selectedVisualization.name }}</div>
        <div class="legend-subtitle">{{ mappedPostalCodeCount }} PLZ</div>

        <div class="legend-container">
          <button
            type="button"
            class="legend-row"
            *ngFor="let row of legendRows; let index = index"
            [class.legend-row-selected]="selectedLegendRowIndex === index"
            (click)="highlightLegendRow(index)">
            <div
              class="legend-color"
              [style.background]="row.color">
            </div>

            <span class="legend-text">{{ row.label }}</span>
          </button>
        </div>

        <button
          *ngIf="selectedLegendRowIndex !== null"
          mat-button
          class="deselect-button"
          matTooltip="deselect highlighted postal codes"
          (click)="deselectHighlightedPostalCodes()">
          Deselect
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 300px;
    }

    .map-shell {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 300px;
    }

    .map-container {
      width: 100%;
      height: 100%;
      min-height: 300px;
    }

    .map-loading-overlay {
      position: absolute;
      inset: 0;
      z-index: 1001;
      display: grid;
      place-items: center;
      pointer-events: none;
    }

    .copyright-label {
      position: absolute;
      bottom: 8px;
      left: 8px;
      z-index: 1000;
      color: rgba(0, 0, 0, 0.68);
      font-size: 12px;
      pointer-events: none;
    }

    .map-legend {
      position: absolute;
      top: 16px;
      left: 16px;
      z-index: 1000;
      min-width: 260px;
      max-width: 360px;
      max-height: calc(100% - 32px);
      padding: 12px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(0, 0, 0, 0.12);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.14);
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow: hidden;
    }

    .legend-title {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.2;
    }

    .legend-subtitle {
      font-size: 12px;
      opacity: 0.8;
    }

    .legend-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
      max-height: 320px;
      padding-right: 4px;
    }

    .legend-row {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 24px;
      width: 100%;
      padding: 4px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .legend-row:hover,
    .legend-row:focus-visible {
      background: rgba(255, 255, 255, 0.45);
      outline: none;
    }

    .legend-row-selected {
      background: rgba(255, 255, 255, 0.7);
      box-shadow: inset 0 0 0 1px rgba(17, 120, 139, 0.4);
    }

    .legend-row-selected .legend-text {
      font-weight: 700;
    }

    .legend-color {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid rgba(0,0,0,0.2);
      flex-shrink: 0;
    }

    .legend-text {
      font-size: 13px;
      line-height: 1.25;
    }

    .deselect-button {
      align-self: flex-end;
      min-width: 0;
      padding: 0 8px;
      font-size: 12px;
      line-height: 28px;
    }
    `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  readonly currentYear = new Date().getFullYear();

  @ViewChild('mapContainer')
  private mapContainer!: ElementRef<HTMLDivElement>;

  private map!: OLMap;
  private osmLayer: TileLayer<OSM> | null = null;
  private vectorLayer: VectorLayer<VectorSource> | null = null;
  private postalCodeHighlightLayer: VectorLayer<VectorSource> | null = null;
  private federalStateBoundariesLayer: VectorLayer<VectorSource> | null = null;
  private baseStyleFunction: StyleFunction | undefined;
  private showOsmLayer = true;
  private showPlzLayer = true;
  private showFederalStateBoundariesLayer = true;

  private readonly featureMap = new Map<string, Feature<Geometry>>();
  private readonly valueMap = new Map<string, number>();
  private readonly styleCache = new Map<string, Style>();
  private readonly strokeHiddenStyleCache = new WeakMap<Style, Style>();
  private postalCodeSnackBarRef: MatSnackBarRef<PostalCodeSnackbarComponent> | null = null;

  selectedVisualization: Visualization | null = null;
  isLoadingVisualization = false;
  legendRows: LegendRow[] = [];
  selectedLegendRowIndex: number | null = null;
  mappedPostalCodeCount = 0;


  private readonly vectorStyleFunction: StyleFunction = (feature, resolution) => {
    if (!this.selectedVisualization) {
      return this.resolveBaseStyle(feature, resolution);
    }

    if (!(feature instanceof Feature)) {
      return this.resolveBaseStyle(feature, resolution);
    }

    const postalCode = getPostalCodeFromFeature(feature);

    if (!postalCode) {
      return this.resolveBaseStyle(feature, resolution);
    }

    const value = this.valueMap.get(postalCode);

    if (value === undefined) {
      return this.resolveBaseStyle(feature, resolution);
    }

    const color = getColorForValue(value, this.selectedVisualization);

    return this.getStyle(color, this.showPlzLayer);
  };

  constructor(
    private readonly store: Store<AppState>,
    private readonly geographicDataApiClient: GeographicDataApiClient,
    private readonly mapPdfExportService: MapPdfExportService,
    private readonly snackBar: MatSnackBar
  ) {
  }

  ngAfterViewInit(): void {
    const mapTarget = this.mapContainer?.nativeElement;

    if (!mapTarget) {
      return;
    }

    this.osmLayer = new TileLayer({
      source: new OSM({ crossOrigin: 'anonymous' }),
      visible: this.showOsmLayer,
      zIndex: 0
    });

    this.map = new OLMap({
      target: mapTarget,
      layers: [
        this.osmLayer
      ],
      view: defaultOlMapView
    });

    this.postalCodeHighlightLayer = new VectorLayer({
      source: new VectorSource(),
      style: postalCodeHighlightLayerStyle,
      zIndex: 3
    });
    this.map.addLayer(this.postalCodeHighlightLayer);

    this.map.on('singleclick', event => this.handleMapClick(event));

    this.map.updateSize();

    this.store.select(selectShowOsmLayer)
      .pipe(takeUntil(this.destroy$))
      .subscribe(showOsmLayer => {
        this.showOsmLayer = showOsmLayer;
        if (this.osmLayer) {
          this.osmLayer.setVisible(showOsmLayer);
        }
      });

    this.store.select(selectShowPlzLayer)
      .pipe(takeUntil(this.destroy$))
      .subscribe(showPlzLayer => {
        this.showPlzLayer = showPlzLayer;
        this.updatePlzLayerVisibility();
        this.vectorLayer?.changed();
      });

    this.store.select(selectShowFederalStateBoundariesLayer)
      .pipe(takeUntil(this.destroy$))
      .subscribe(showFederalStateBoundariesLayer => {
        this.showFederalStateBoundariesLayer = showFederalStateBoundariesLayer;
        if (this.federalStateBoundariesLayer) {
          this.federalStateBoundariesLayer.setVisible(showFederalStateBoundariesLayer);
        }
      });

    this.store.select(selectSelectedVisualization)
      .pipe(takeUntil(this.destroy$))
      .subscribe(visualization => {
        this.applyVisualization(visualization);
      });

    this.store.select(selectIsLoadingSelectedVisualization)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.isLoadingVisualization = isLoading;
      });

    this.geographicDataApiClient.getFederalStateBoundariesGeoJson().subscribe(geojsonObject => {
      this.federalStateBoundariesLayer = new VectorLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(geojsonObject, {
            featureProjection: 'EPSG:3857'
          })
        }),
        style: federalBoundariesLayerStyle,
        visible: this.showFederalStateBoundariesLayer,
        zIndex: 2
      });
      this.map?.addLayer(this.federalStateBoundariesLayer);
    });

    this.geographicDataApiClient.getPostalCodeGeoJson().subscribe(geojsonObject => {
      const vectorLayer = createGeoJsonVectorLayer(geojsonObject);
      this.baseStyleFunction = vectorLayer.getStyleFunction() ?? undefined;
      vectorLayer.setStyle(this.vectorStyleFunction);

      const vectorSource = vectorLayer.getSource();

      if (vectorSource) {
        this.indexFeaturesByPostalCode(vectorSource);
      }

      this.vectorLayer = vectorLayer as VectorLayer<VectorSource>;
      this.updatePlzLayerVisibility();
      this.vectorLayer.setZIndex(1);
      this.map?.addLayer(vectorLayer);

      if (this.selectedVisualization) {
        this.applyVisualization(this.selectedVisualization);
      }
      });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  searchPostalCode(postalCode: string): void {
    const feature = this.featureMap.get(postalCode);

    if (!feature || !this.map || !this.postalCodeHighlightLayer) {
      return;
    }

    const geometry = feature.getGeometry();

    if (!geometry) {
      return;
    }

    const highlightSource = this.postalCodeHighlightLayer.getSource();
    highlightSource?.clear();
    highlightSource?.addFeature(new Feature(geometry));

    this.map.getView().animate({
      center: getCenter(geometry.getExtent()),
      zoom: 12,
      duration: 750
    });
  }

  highlightLegendRow(index: number): void {
    const legendRow = this.legendRows[index];
    const highlightSource = this.postalCodeHighlightLayer?.getSource();

    if (!legendRow || !highlightSource || !this.selectedVisualization) {
      return;
    }

    highlightSource.clear();

    for (const visualizationValue of this.selectedVisualization.values) {
      if (!this.isValueInLegendRow(visualizationValue.value, index)) {
        continue;
      }

      const geometry = this.featureMap.get(visualizationValue.postalCode)?.getGeometry();

      if (geometry) {
        highlightSource.addFeature(new Feature(geometry));
      }
    }

    this.selectedLegendRowIndex = index;
  }

  deselectHighlightedPostalCodes(): void {
    this.postalCodeHighlightLayer?.getSource()?.clear();
    this.selectedLegendRowIndex = null;
    this.postalCodeSnackBarRef?.dismiss();
    this.postalCodeSnackBarRef = null;
  }

  private handleMapClick(event: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>): void {
    if (!this.map || !this.vectorLayer) {
      return;
    }

    const feature = this.map.forEachFeatureAtPixel(
      event.pixel,
      hitFeature => hitFeature,
      { layerFilter: layer => layer === this.vectorLayer }
    );

    if (!(feature instanceof Feature)) {
      return;
    }

    const postalCode = getPostalCodeFromFeature(feature as Feature<Geometry>);

    if (!postalCode) {
      return;
    }

    this.highlightPostalCodeArea(postalCode);
  }

  private highlightPostalCodeArea(postalCode: string): void {
    const feature = this.featureMap.get(postalCode);
    const highlightSource = this.postalCodeHighlightLayer?.getSource();

    if (!feature || !highlightSource) {
      return;
    }

    const geometry = feature.getGeometry();

    if (!geometry) {
      return;
    }

    highlightSource.clear();
    highlightSource.addFeature(new Feature(geometry));

    this.postalCodeSnackBarRef?.dismiss();
    this.postalCodeSnackBarRef = this.snackBar.openFromComponent(PostalCodeSnackbarComponent, {
      data: { postalCode },
      duration: 26000
    });
  }

  exportToPdf(options: PdfExportOptions): void {
    if (!this.map) {
      return;
    }

    this.mapPdfExportService.export(options, {
      map: this.map,
      visualizationName: this.selectedVisualization?.name ?? null,
      mappedPostalCodeCount: this.mappedPostalCodeCount,
      legendRows: this.legendRows
    });
  }

  private applyVisualization(visualization: Visualization | null): void {
    this.selectedVisualization = visualization;
    this.valueMap.clear();
    this.legendRows = [];
    this.deselectHighlightedPostalCodes();
    this.mappedPostalCodeCount = 0;

    if (visualization) {
      for (const visualizationValue of visualization.values) {
        if (!this.featureMap.has(visualizationValue.postalCode)) {
          continue;
        }

        this.valueMap.set(visualizationValue.postalCode, visualizationValue.value);
      }

      this.mappedPostalCodeCount = this.valueMap.size;
      this.legendRows = buildLegendRows(visualization);
    }

    this.updatePlzLayerVisibility();
    this.vectorLayer?.changed();
  }

  private isValueInLegendRow(value: number, legendRowIndex: number): boolean {
    const legendRow = this.legendRows[legendRowIndex];

    if (!legendRow) {
      return false;
    }

    if (this.selectedVisualization?.type === VisualizationType.Group) {
      return value === legendRow.groupValue;
    }

    return this.legendRows.findIndex(row =>
      row.fromValue !== undefined
      && row.toValue !== undefined
      && value >= row.fromValue
      && value <= row.toValue
    ) === legendRowIndex;
  }

  private indexFeaturesByPostalCode(vectorSource: VectorSource): void {
    this.featureMap.clear();

    vectorSource.getFeatures().forEach(feature => {
      const postalCode = getPostalCodeFromFeature(feature as Feature<Geometry>);

      if (!postalCode) {
        return;
      }

      this.featureMap.set(postalCode, feature as Feature<Geometry>);
    });
  }

  private getStyle(color: string, showStroke: boolean): Style {
    const styleCacheKey = `${color}-${showStroke}`;
    let style = this.styleCache.get(styleCacheKey);

    if (!style) {
      style = new Style({
        fill: new Fill({ color }),
        stroke: showStroke ? new Stroke({
          color: '#666',
          width: 1
        }) : undefined
      });

      this.styleCache.set(styleCacheKey, style);
    }

    return style;
  }

  private resolveBaseStyle(feature: FeatureLike, resolution: number): OneOrMany<Style> {
    const baseStyle = this.baseStyleFunction?.(feature, resolution);

    if (baseStyle) {
      return this.showPlzLayer ? baseStyle : this.withoutStroke(baseStyle);
    }

    return this.showPlzLayer ? defaultStylePostalLayer : this.withoutStroke(defaultStylePostalLayer);
  }

  private updatePlzLayerVisibility(): void {
    this.vectorLayer?.setVisible(true);
  }

  private withoutStroke(style: OneOrMany<Style>): OneOrMany<Style> {
    if (Array.isArray(style)) {
      return style.map(item => this.withoutStroke(item) as Style);
    }

    let strokeHiddenStyle = this.strokeHiddenStyleCache.get(style);

    if (!strokeHiddenStyle) {
      strokeHiddenStyle = style.clone();
      strokeHiddenStyle.setStroke(null);
      this.strokeHiddenStyleCache.set(style, strokeHiddenStyle);
    }

    return strokeHiddenStyle;
  }
}

type OneOrMany<Type> = Type | Type[];
