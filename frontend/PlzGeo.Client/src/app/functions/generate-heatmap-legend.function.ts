import { HeatmapLegendItem } from '../models/heatmap-legend-item.model';
import { interpolateColor } from './interpolate-color.function';

const MAX_INTERVALS = 6;

/** Builds up to 6 equal-width value intervals across the distinct values, colored by a start/end gradient. */
export function generateHeatmapLegend(
  values: number[],
  startColor: string,
  endColor: string
): HeatmapLegendItem[] {
  const distinctValues = Array.from(new Set(values)).sort((a, b) => a - b);

  if (distinctValues.length === 0) {
    return [];
  }

  const min = distinctValues[0];
  const max = distinctValues[distinctValues.length - 1];
  const intervalCount = Math.min(MAX_INTERVALS, distinctValues.length);

  if (min === max) {
    return [{ fromValue: min, toValue: max, color: startColor }];
  }

  const width = (max - min) / intervalCount;
  const legend: HeatmapLegendItem[] = [];

  for (let i = 0; i < intervalCount; i++) {
    const fromValue = min + i * width;
    const toValue = i === intervalCount - 1 ? max : min + (i + 1) * width;
    const t = intervalCount === 1 ? 0 : i / (intervalCount - 1);

    legend.push({
      fromValue: Math.round(fromValue * 100) / 100,
      toValue: Math.round(toValue * 100) / 100,
      color: interpolateColor(startColor, endColor, t)
    });
  }

  return legend;
}
