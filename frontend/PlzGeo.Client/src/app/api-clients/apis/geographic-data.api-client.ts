import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class GeographicDataApiClient {

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getPostalCodeGeoJson() {
    return this.http.get('/simplify-plz-grass-7.geojson');
  }

  getFederalStateBoundariesGeoJson() {
    return this.http.get('/federal-layer-bounderies-de.geojson');
  }
}