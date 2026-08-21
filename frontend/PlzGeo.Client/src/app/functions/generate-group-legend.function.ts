import { GroupLegendItem } from '../models/group-legend-item.model';
import { interpolateColor } from './interpolate-color.function';

export const MAX_GROUP_COUNT = 100;

export interface GenerateGroupLegendResult {
  legend: GroupLegendItem[];
  exceedsLimit: boolean;
}

/** Builds one legend row per distinct group value, colored by a start/end gradient; blocks when more than 100 groups exist. */
export function generateGroupLegend(
  values: number[],
  startColor: string,
  endColor: string
): GenerateGroupLegendResult {
  const distinctValues = Array.from(new Set(values)).sort((a, b) => a - b);

  if (distinctValues.length > MAX_GROUP_COUNT) {
    return { legend: [], exceedsLimit: true };
  }

  const legend = distinctValues.map((value, index) => ({
    value,
    name: `Group ${value}`,
    color: distinctValues.length === 1
      ? startColor
      : interpolateColor(startColor, endColor, index / (distinctValues.length - 1))
  }));

  return { legend, exceedsLimit: false };
}
