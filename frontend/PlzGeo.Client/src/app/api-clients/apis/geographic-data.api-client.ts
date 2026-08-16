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

  getGeoJson() {
    return this.http.get('/simplify-plz-grass-7.geojson');
  }
}