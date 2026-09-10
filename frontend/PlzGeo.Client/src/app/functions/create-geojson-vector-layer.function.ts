import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import Style from 'ol/style/Style.js';
import Fill from 'ol/style/Fill';
import Stroke from "ol/style/Stroke";
import type { StyleFunction } from 'ol/style/Style';
import { stylePostalAreaLayer } from '../constants/style-postal-area-layer.constant';


export function createGeoJsonVectorLayer(geojsonObject: Object): VectorLayer
{
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
          }),
          // transparent fill so clicks inside the polygon (not just on the stroke) are hit-detected
          fill: new Fill({
            color: 'rgba(0, 0, 0, 0)'
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


      return new VectorLayer({
          source: vectorSource,
          style: styleFunction,
        });
}