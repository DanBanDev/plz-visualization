import { FeatureCollection, Feature, Polygon, MultiPolygon } from 'geojson';

export interface MapState {
  geoJson: FeatureCollection | null;
  selectedPostalCode: string | null;
}