import Feature from 'ol/Feature';
import type Geometry from 'ol/geom/Geometry';

export function getPostalCodeFromFeature(feature: Feature<Geometry>): string | null {
  const postalCode = feature.get('plz') ?? feature.get('postalCode') ?? feature.get('PLZ');

  if (postalCode === null || postalCode === undefined) {
    return null;
  }

  return String(postalCode);
}
