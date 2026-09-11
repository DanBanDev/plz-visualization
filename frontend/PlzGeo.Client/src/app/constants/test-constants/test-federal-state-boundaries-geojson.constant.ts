import { FeatureCollection } from 'geojson';

// Single polygon used to fake the '/federal-layer-bounderies-de.geojson' response in tests.
export const testFederalStateBoundariesGeoJson: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Berlin' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[13.0, 52.0], [13.02, 52.0], [13.02, 52.01], [13.0, 52.01], [13.0, 52.0]]]
      }
    }
  ]
};
