import { Component , AfterViewInit, ElementRef, ViewChild} from "@angular/core";
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { GeographicDataApiClient } from "../../api-clients/apis/geographic-data.api-client";
import { createGeoJsonVectorLayer } from "../../functions/create-geojson-vector-layer.function";

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
      const vectorLayer = createGeoJsonVectorLayer(geojsonObject);
      this.map?.addLayer(vectorLayer);
      });

  }
}


