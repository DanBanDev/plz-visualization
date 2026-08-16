import { Component , AfterViewInit, ElementRef, ViewChild} from "@angular/core";

import Map from 'ol/Map';
import View from 'ol/View';
import Style from 'ol/style/Style.js';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector.js';
import OSM from 'ol/source/OSM';
import { GeographicDataApiClient } from "../../api-clients/apis/geographic-data.api-client";
import VectorSource from "ol/source/Vector";
import GeoJSON from 'ol/format/GeoJSON.js';
import Stroke from "ol/style/Stroke";
import type { StyleFunction } from 'ol/style/Style';
import { stylePostalAreaLayer } from "../../constants/style-postal-area-layer.constant";

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
export class MapComponent implements AfterViewInit {
    constructor(
    private readonly geographicDataApiClient: GeographicDataApiClient
  ) {
  }
  @ViewChild('mapContainer')
  private mapContainer!: ElementRef<HTMLDivElement>;

  private map!: Map;

  ngAfterViewInit(): void {
    const mapTarget = this.mapContainer?.nativeElement;

    if (!mapTarget) {
      return;
    }

      this.map = new Map({
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

    this.geographicDataApiClient.getGeoJson().subscribe(geojsonObject => {

        const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(
              geojsonObject,
              {
                featureProjection: 'EPSG:3857'
              }
            )
          });
        const defaultStyle = new Style({
          stroke: new Stroke({
            color: '#000000',
            width: 1
          })
        });
        const styles: Record<string, Style> = {
          ...stylePostalAreaLayer
        };
        const styleFunction:StyleFunction = (feature, resolution) => {

          const geometry = feature.getGeometry();

          if (!geometry) {
            return defaultStyle;
          }

          return styles[geometry.getType()] ?? defaultStyle;
        };


      const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: styleFunction,
        });

        this.map?.addLayer(vectorLayer);

  });

  }
}


