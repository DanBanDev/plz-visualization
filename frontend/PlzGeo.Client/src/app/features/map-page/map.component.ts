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
import { getCenter } from 'ol/extent';
import { Subject, takeUntil } from "rxjs";
import { GeographicDataApiClient } from "../../api-clients/apis/geographic-data.api-client";
import { createGeoJsonVectorLayer } from "../../functions/create-geojson-vector-layer.function";
import { Visualization } from "../../models/visualization.model";
import { VisualizationType } from "../../models/visualization-type.enum";
import { GroupVisualization } from "../../models/group-visualization.model";
import { HeatmapVisualization } from "../../models/heatmap-visualization.model";
import { AppState } from "../../core/store/app-state";
import { selectIsLoadingSelectedVisualization, selectSelectedVisualization } from "../../core/store/visualizations/visualizations.selectors";
import { selectShowFederalStateBoundariesLayer, selectShowOsmLayer, selectShowPlzLayer } from "../../core/store/map/map.selectors";
import { defaultStylePostalLayer } from "../../constants/default-style-postal-layer.constant";
import { federalBoundariesLayerStyle } from "../../constants/federal-boundaries-layer-style.constant";
import { defaultOlMapView } from "../../constants/default-ol-map-view.constant";
import { postalCodeHighlightLayerStyle } from "../../constants/postal-code-highlight-layer-style.constant";
import { jsPDF } from 'jspdf';
import { PdfExportOptions } from './dialogs/export-pdf-dialog.component';

@Component({
  selector: 'app-map',
  standalone: false,
  template: `
    <div class="map-shell">
      <div #mapContainer class="map-container"></div>

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

    const postalCode = this.getPostalCodeFromFeature(feature);

    if (!postalCode) {
      return this.resolveBaseStyle(feature, resolution);
    }

    const value = this.valueMap.get(postalCode);

    if (value === undefined) {
      return this.resolveBaseStyle(feature, resolution);
    }

    const color = this.getColorForValue(value, this.selectedVisualization);

    return this.getStyle(color, this.showPlzLayer);
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
      source: new OSM({ crossOrigin: 'anonymous' }),
      visible: this.showOsmLayer,
      zIndex: 0
    });

    this.federalStateBoundariesLayer = new VectorLayer({
      source: new VectorSource({
        url: 'federal-layer-bounderies-de.geojson',
        format: new GeoJSON()
      }),
      style: federalBoundariesLayerStyle,
      visible: this.showFederalStateBoundariesLayer,
      zIndex: 2
    });

    this.map = new OLMap({
      target: mapTarget,
      layers: [
        this.osmLayer,
        this.federalStateBoundariesLayer
      ],
      view: defaultOlMapView
    });

    this.postalCodeHighlightLayer = new VectorLayer({
      source: new VectorSource(),
      style: postalCodeHighlightLayerStyle,
      zIndex: 3
    });
    this.map.addLayer(this.postalCodeHighlightLayer);

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

    this.geographicDataApiClient.getGeoJson().subscribe(geojsonObject => {
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
  }

  exportToPdf(options: PdfExportOptions): void {
    if (!this.map) {
      return;
    }

    const originalSize = this.map.getSize();
    const originalExtent = this.map.getView().calculateExtent(originalSize);
    const pageSizeInches = this.getPageSizeInches(options.pageFormat, options.orientation);
    const exportSize: [number, number] = [
      Math.round(pageSizeInches.width * options.dpi),
      Math.round(pageSizeInches.height * options.dpi)
    ];

    this.map.once('rendercomplete', () => {
      try {
        const imageData = this.createMapImage(exportSize);
        const pdf = new jsPDF({
          orientation: options.orientation,
          unit: 'mm',
          format: options.pageFormat
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight);
        this.addLegendToPdf(pdf, pageWidth, pageHeight);
        pdf.save('map-export.pdf');
      } finally {
        this.map.setSize(originalSize);
        this.map.getView().fit(originalExtent, { size: originalSize, duration: 0 });
        this.map.renderSync();
      }
    });

    this.map.setSize(exportSize);
    this.map.getView().fit(originalExtent, { size: exportSize, duration: 0 });
    this.map.renderSync();
  }

  private createMapImage(size: [number, number]): string {
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    const context = mapCanvas.getContext('2d');

    if (!context) {
      throw new Error('Unable to create the map export canvas.');
    }

    this.map.getViewport().querySelectorAll<HTMLCanvasElement>('.ol-layer canvas, canvas.ol-layer').forEach(canvas => {
      if (canvas.width === 0 || canvas.height === 0) {
        return;
      }

      const parent = canvas.parentElement;
      const opacity = parent ? Number(parent.style.opacity || '1') : 1;
      const transform = canvas.style.transform.match(/^matrix\(([^)]+)\)$/);
      const matrix = transform?.[1].split(',').map(Number);

      context.globalAlpha = opacity;
      if (matrix?.length === 6) {
        context.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
      } else {
        context.setTransform(1, 0, 0, 1, 0, 0);
      }
      context.drawImage(canvas, 0, 0);
    });

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalAlpha = 1;
    return mapCanvas.toDataURL('image/png');
  }

  private addLegendToPdf(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
    if (!this.selectedVisualization || this.legendRows.length === 0) {
      return;
    }

    const margin = 8;
    const padding = 4;
    const lineHeight = 5;
    const swatchSize = 4;
    const titleLines = pdf.splitTextToSize(this.selectedVisualization.name, 62);
    const rowLabels = this.legendRows.map(row => pdf.splitTextToSize(row.label, 52));
    const rowHeights = rowLabels.map(lines => Math.max(lineHeight, lines.length * lineHeight));
    const contentHeight = titleLines.length * lineHeight + lineHeight + rowHeights.reduce((sum, height) => sum + height, 0);
    const panelWidth = Math.min(76, pageWidth - margin * 2);
    const panelHeight = Math.min(contentHeight + padding * 2, pageHeight - margin * 2);

    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(150, 150, 150);
    pdf.roundedRect(margin, margin, panelWidth, panelHeight, 1.5, 1.5, 'FD');

    let cursorY = margin + padding;
    pdf.setTextColor(20, 20, 20);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(titleLines, margin + padding, cursorY + 3);
    cursorY += titleLines.length * lineHeight;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(70, 70, 70);
    pdf.text(`${this.mappedPostalCodeCount} PLZ`, margin + padding, cursorY + 3);
    cursorY += lineHeight;

    for (let index = 0; index < this.legendRows.length; index++) {
      const row = this.legendRows[index];
      const lines = rowLabels[index];
      const rowHeight = rowHeights[index];

      if (cursorY + rowHeight > margin + panelHeight - padding) {
        break;
      }

      const color = this.getPdfColor(row.color);
      pdf.setFillColor(color.red, color.green, color.blue);
      pdf.setDrawColor(100, 100, 100);
      pdf.rect(margin + padding, cursorY + 0.5, swatchSize, swatchSize, 'FD');

      pdf.setTextColor(20, 20, 20);
      pdf.text(lines, margin + padding + swatchSize + 3, cursorY + 3.5);
      cursorY += rowHeight;
    }
  }

  private getPdfColor(color: string): { red: number; green: number; blue: number } {
    const rgbaMatch = color.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);

    if (rgbaMatch) {
      return {
        red: Number(rgbaMatch[1]),
        green: Number(rgbaMatch[2]),
        blue: Number(rgbaMatch[3])
      };
    }

    const hex = color.replace('#', '');
    if (/^[0-9a-f]{6}$/i.test(hex)) {
      return {
        red: parseInt(hex.slice(0, 2), 16),
        green: parseInt(hex.slice(2, 4), 16),
        blue: parseInt(hex.slice(4, 6), 16)
      };
    }

    return { red: 238, green: 238, blue: 238 };
  }

  private getPageSizeInches(pageFormat: PdfExportOptions['pageFormat'], orientation: PdfExportOptions['orientation']): { width: number; height: number } {
    const size = pageFormat === 'a3'
      ? { width: 11.69, height: 16.54 }
      : pageFormat === 'letter'
        ? { width: 8.5, height: 11 }
        : { width: 8.27, height: 11.69 };

    return orientation === 'landscape'
      ? { width: size.height, height: size.width }
      : size;
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
      this.legendRows = this.buildLegendRows(visualization);
    }

    this.updatePlzLayerVisibility();
    this.vectorLayer?.changed();
  }

  private buildLegendRows(visualization: Visualization): LegendRow[] {
    if (visualization.type === VisualizationType.Group) {
      const groupVisualization = visualization as GroupVisualization;
      return groupVisualization.legend.map(item => ({
        color: this.withOpacity(item.color, 0.5),
        label: `${item.name}`,
        groupValue: item.value
      }));
    }

    const heatmapVisualization = visualization as HeatmapVisualization;
    return heatmapVisualization.legend.map(item => ({
      color: this.withOpacity(item.color, 0.5),
      label: `From ${item.fromValue} to ${item.toValue}`,
      fromValue: item.fromValue,
      toValue: item.toValue
    }));
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
      return this.showPlzLayer ? baseStyle : this.withoutStroke(baseStyle);
    }

    return this.showPlzLayer ? defaultStylePostalLayer : this.withoutStroke(defaultStylePostalLayer);
  }

  private updatePlzLayerVisibility(): void {
    this.vectorLayer?.setVisible(true);
  }

  private withoutStroke(style: Style | Style[]): Style | Style[] {
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

interface LegendRow {
  color: string;
  label: string;
  groupValue?: number;
  fromValue?: number;
  toValue?: number;
}


