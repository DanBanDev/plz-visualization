import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import OLMap from 'ol/Map';
import View from 'ol/View';
import Feature, { type FeatureLike } from 'ol/Feature';
import type Geometry from 'ol/geom/Geometry';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
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

@Component({
  selector: 'app-map',
  standalone: false,
  template: `
    <div #mapContainer class="map-container"></div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 300px;
    }

    .map-container {
      width: 100%;
      height: 100%;
      min-height: 300px;
    }
    `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @ViewChild('mapContainer')
  private mapContainer!: ElementRef<HTMLDivElement>;

  private map!: OLMap;
  private vectorLayer: VectorLayer<VectorSource> | null = null;
  private baseStyleFunction: StyleFunction | undefined;

  private readonly featureMap = new Map<string, Feature<Geometry>>();
  private readonly valueMap = new Map<string, number>();
  private readonly styleCache = new Map<string, Style>();

  private selectedVisualization: Visualization | null = null;

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

      this.map = new OLMap({
        target: mapTarget,
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: [1113194, 6810000],
          zoom: 10
        })
      });

    this.map.updateSize();

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

    if (visualization) {
      for (const visualizationValue of visualization.values) {
        if (!this.featureMap.has(visualizationValue.postalCode)) {
          continue;
        }

        this.valueMap.set(visualizationValue.postalCode, visualizationValue.value);
      }
    }

    this.vectorLayer?.changed();
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


