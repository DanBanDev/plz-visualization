import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

export const defaultStylePostalLayer = new Style({
    // transparent fill so clicks inside the polygon (not just on the stroke) are hit-detected
    fill: new Fill({ color: 'rgba(0, 0, 0, 0)' }),
    stroke: new Stroke({
      color: '#666',
      width: 1
    })
  });
  