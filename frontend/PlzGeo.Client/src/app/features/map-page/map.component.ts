import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import OLMap from 'ol/Map';
import View from 'ol/View';
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
import { Subject, takeUntil } from "rxjs";
import { GeographicDataApiClient } from "../../api-clients/apis/geographic-data.api-client";
import { createGeoJsonVectorLayer } from "../../functions/create-geojson-vector-layer.function";
import { Visualization } from "../../models/visualization.model";
import { VisualizationType } from "../../models/visualization-type.enum";
import { GroupVisualization } from "../../models/group-visualization.model";
import { HeatmapVisualization } from "../../models/heatmap-visualization.model";
import { AppState } from "../../core/store/app-state";
import { selectSelectedVisualization } from "../../core/store/visualizations/visualizations.selectors";
import { selectShowFederalStateBoundariesLayer, selectShowOsmLayer, selectShowPlzLayer } from "../../core/store/map/map.selectors";

@Component({
  selector: 'app-map',
  standalone: false,
  template: `
    <div class="map-shell">
      <div #mapContainer class="map-container"></div>

      <div class="map-legend" *ngIf="selectedVisualization">
        <div class="legend-title">{{ selectedVisualization.name }}</div>
        <div class="legend-subtitle">{{ mappedPostalCodeCount }} PLZ</div>

        <div class="legend-container">
          <div class="legend-row" *ngFor="let row of legendRows">
            <div
              class="legend-color"
              [style.background]="row.color">
            </div>

            <span class="legend-text">{{ row.label }}</span>
          </div>
        </div>
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
    `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @ViewChild('mapContainer')
  private mapContainer!: ElementRef<HTMLDivElement>;

  private map!: OLMap;
  private osmLayer: TileLayer<OSM> | null = null;
  private vectorLayer: VectorLayer<VectorSource> | null = null;
  private federalStateBoundariesLayer: VectorLayer<VectorSource> | null = null;
  private baseStyleFunction: StyleFunction | undefined;
  private showOsmLayer = true;
  private showPlzLayer = true;
  private showFederalStateBoundariesLayer = true;

  private readonly featureMap = new Map<string, Feature<Geometry>>();
  private readonly valueMap = new Map<string, number>();
  private readonly styleCache = new Map<string, Style>();

  selectedVisualization: Visualization | null = null;
  legendRows: { color: string; label: string }[] = [];
  mappedPostalCodeCount = 0;

  private readonly defaultStyle = new Style({
    stroke: new Stroke({
      color: '#666',
      width: 1
    })
  });

  private readonly vectorStyleFunction: StyleFunction = (feature, resolution) => {
    if (!this.selectedVisualization) {
      return this.resolveBaseStyle(feature, resolution);
    }

    if (!(feature instanceof Feature)) {
      return this.resolveBaseStyle(feature, resolution);
    }

    const postalCode = this.getPostalCodeFromFeature(feature);

    if (!postalCode) {
      return this.resolveBaseStyle(feature, resolution);
    }

    const value = this.valueMap.get(postalCode);

    if (value === undefined) {
      return this.resolveBaseStyle(feature, resolution);
    }

    const color = this.getColorForValue(value, this.selectedVisualization);

    return this.getStyle(color);
  };

  constructor(
    private readonly store: Store<AppState>,
    private readonly geographicDataApiClient: GeographicDataApiClient
  ) {
  }

  ngAfterViewInit(): void {
    const mapTarget = this.mapContainer?.nativeElement;

    if (!mapTarget) {
      return;
    }

    this.osmLayer = new TileLayer({
      source: new OSM(),
      visible: this.showOsmLayer,
      zIndex: 0
    });

    this.federalStateBoundariesLayer = new VectorLayer({
      source: new VectorSource({
        url: 'federal-layer-bounderies-de.geojson',
        format: new GeoJSON()
      }),
      style: new Style({
        stroke: new Stroke({
          color: '#11788b',
          width: 2
        })
      }),
      visible: this.showFederalStateBoundariesLayer,
      zIndex: 2
    });

    this.map = new OLMap({
      target: mapTarget,
      layers: [
        this.osmLayer,
        this.federalStateBoundariesLayer
      ],
      view: new View({
        center: [1113194, 6810000],
        zoom: 10
      })
    });

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
        if (this.vectorLayer) {
          this.vectorLayer.setVisible(showPlzLayer);
        }
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

    this.geographicDataApiClient.getGeoJson().subscribe(geojsonObject => {
      const vectorLayer = createGeoJsonVectorLayer(geojsonObject);
      this.baseStyleFunction = vectorLayer.getStyleFunction() ?? undefined;
      vectorLayer.setStyle(this.vectorStyleFunction);

      const vectorSource = vectorLayer.getSource();

      if (vectorSource) {
        this.indexFeaturesByPostalCode(vectorSource);
      }

      this.vectorLayer = vectorLayer as VectorLayer<VectorSource>;
      this.vectorLayer.setVisible(this.showPlzLayer);
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

  private applyVisualization(visualization: Visualization | null): void {
    this.selectedVisualization = visualization;
    this.valueMap.clear();
    this.legendRows = [];
    this.mappedPostalCodeCount = 0;

    if (visualization) {
      for (const visualizationValue of visualization.values) {
        if (!this.featureMap.has(visualizationValue.postalCode)) {
          continue;
        }

        this.valueMap.set(visualizationValue.postalCode, visualizationValue.value);
      }

      this.mappedPostalCodeCount = this.valueMap.size;
      this.legendRows = this.buildLegendRows(visualization);
    }

    this.vectorLayer?.changed();
  }

  private buildLegendRows(visualization: Visualization): { color: string; label: string }[] {
    if (visualization.type === VisualizationType.Group) {
      const groupVisualization = visualization as GroupVisualization;
      return groupVisualization.legend.map(item => ({
        color: this.withOpacity(item.color, 0.5),
        label: `${item.name}`
      }));
    }

    const heatmapVisualization = visualization as HeatmapVisualization;
    return heatmapVisualization.legend.map(item => ({
      color: this.withOpacity(item.color, 0.5),
      label: `Von ${item.fromValue} bis ${item.toValue}`
    }));
  }

  private indexFeaturesByPostalCode(vectorSource: VectorSource): void {
    this.featureMap.clear();

    vectorSource.getFeatures().forEach(feature => {
      const postalCode = this.getPostalCodeFromFeature(feature as Feature<Geometry>);

      if (!postalCode) {
        return;
      }

      this.featureMap.set(postalCode, feature as Feature<Geometry>);
    });
  }

  private getPostalCodeFromFeature(feature: Feature<Geometry>): string | null {
    const postalCode = feature.get('plz') ?? feature.get('postalCode') ?? feature.get('PLZ');

    if (postalCode === null || postalCode === undefined) {
      return null;
    }

    return String(postalCode);
  }

  private getColorForValue(value: number, visualization: Visualization): string {
    if (visualization.type === VisualizationType.Group) {
      const groupVisualization = visualization as GroupVisualization;
      const legendItem = groupVisualization.legend.find(item => item.value === value);
      return this.withOpacity(legendItem?.color ?? '#eeeeee', 0.5);
    }

    const heatmapVisualization = visualization as HeatmapVisualization;
    const legendItem = heatmapVisualization.legend.find(item => value >= item.fromValue && value <= item.toValue);
    return this.withOpacity(legendItem?.color ?? '#eeeeee', 0.5);
  }

  private getStyle(color: string): Style {
    let style = this.styleCache.get(color);

    if (!style) {
      style = new Style({
        fill: new Fill({ color }),
        stroke: new Stroke({
          color: '#666',
          width: 1
        })
      });

      this.styleCache.set(color, style);
    }

    return style;
  }

  private withOpacity(color: string, opacity: number): string {
    if (color.startsWith('#')) {
      const hex = color.slice(1);

      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }

      if (hex.length === 6 || hex.length === 8) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
    }

    const rgbMatch = color.match(/^rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)$/i);
    if (rgbMatch) {
      return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${opacity})`;
    }

    const rgbaMatch = color.match(/^rgba\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\)$/i);
    if (rgbaMatch) {
      return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
    }

    return color;
  }

  private resolveBaseStyle(feature: FeatureLike, resolution: number): Style | Style[] {
    const baseStyle = this.baseStyleFunction?.(feature, resolution);

    if (baseStyle) {
      return baseStyle;
    }

    return this.defaultStyle;
  }
}


