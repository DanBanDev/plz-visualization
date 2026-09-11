import { FeatureCollection } from 'geojson';

// Two small adjacent squares used to fake the '/simplify-plz-grass-7.geojson' response in tests.
export const testPostalCodeGeoJson: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { plz: '10115' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[13.0, 52.0], [13.01, 52.0], [13.01, 52.01], [13.0, 52.01], [13.0, 52.0]]]
      }
    },
    {
      type: 'Feature',
      properties: { plz: '10117' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[13.01, 52.0], [13.02, 52.0], [13.02, 52.01], [13.01, 52.01], [13.01, 52.0]]]
      }
    }
  ]
};
