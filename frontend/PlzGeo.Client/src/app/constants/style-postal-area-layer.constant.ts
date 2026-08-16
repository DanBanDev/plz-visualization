import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

export const stylePostalAreaLayer =  {
        'Point': new Style({
            image: new CircleStyle({
              radius: 5,
              fill: new Fill({
                  color: 'rgba(255, 255, 255, 0.1)',
                }),
              stroke: new Stroke({color: 'red', width: 1}),
            }),
        }),
        'LineString': new Style({
          stroke: new Stroke({
            color: 'green',
            width: 1,
          }),
        }),
        'MultiPolygon': new Style({
          stroke: new Stroke({
            color: 'yellow',
            width: 1,
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 0, 0.1)',
          }),
        }),
        'Polygon': new Style({
          stroke: new Stroke({
            color: 'blue',
            lineDash: [],
            width: 0.5,
          })
        }),
        }