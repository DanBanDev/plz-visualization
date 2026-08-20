import { VisualizationInfoDto } from '../dtos/visualization-info.dto';
import { VisualizationValueDto } from '../dtos/visualization-value.dto';
import { GroupLegendItemDto } from '../dtos/group-legend-item.dto';
import { HeatmapLegendItemDto } from '../dtos/heatmap-legend-item.dto';
import { GroupVisualizationDto } from '../dtos/group-visualization.dto';
import { HeatmapVisualizationDto } from '../dtos/heatmap-visualization.dto';
import { VisualizationDto } from '../dtos/visualization.dto';
import { CreateGroupVisualizationDto } from '../dtos/create-group-visualization.dto';
import { CreateHeatmapVisualizationDto } from '../dtos/create-heatmap-visualization.dto';

import { VisualizationInfo } from '../../models/visualization-info.model';
import { VisualizationValue } from '../../models/visualization-value.model';
import { GroupLegendItem } from '../../models/group-legend-item.model';
import { HeatmapLegendItem } from '../../models/heatmap-legend-item.model';
import { GroupVisualization } from '../../models/group-visualization.model';
import { HeatmapVisualization } from '../../models/heatmap-visualization.model';
import { Visualization } from '../../models/visualization.model';
import { CreateGroupVisualization } from '../../models/create-group-visualization.model';
import { CreateHeatmapVisualization } from '../../models/create-heatmap-visualization.model';
import { VisualizationType } from '../../models/visualization-type.enum';

export function mapVisualizationInfoDtoToModel(dto: VisualizationInfoDto): VisualizationInfo {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type
  };
}

export function mapVisualizationValueDtoToModel(dto: VisualizationValueDto): VisualizationValue {
  return {
    postalCode: dto.postalCode,
    value: dto.value
  };
}

export function mapVisualizationValueModelToDto(model: VisualizationValue): VisualizationValueDto {
  return {
    postalCode: model.postalCode,
    value: model.value
  };
}

export function mapGroupLegendItemDtoToModel(dto: GroupLegendItemDto): GroupLegendItem {
  return {
    value: dto.value,
    name: dto.name,
    color: dto.color
  };
}

export function mapGroupLegendItemModelToDto(model: GroupLegendItem): GroupLegendItemDto {
  return {
    value: model.value,
    name: model.name,
    color: model.color
  };
}

export function mapHeatmapLegendItemDtoToModel(dto: HeatmapLegendItemDto): HeatmapLegendItem {
  return {
    fromValue: dto.fromValue,
    toValue: dto.toValue,
    color: dto.color
  };
}

export function mapHeatmapLegendItemModelToDto(model: HeatmapLegendItem): HeatmapLegendItemDto {
  return {
    fromValue: model.fromValue,
    toValue: model.toValue,
    color: model.color
  };
}

export function mapGroupVisualizationDtoToModel(dto: GroupVisualizationDto): GroupVisualization {
  return {
    ...mapVisualizationInfoDtoToModel(dto),
    values: dto.values.map(mapVisualizationValueDtoToModel),
    legend: dto.legend.map(mapGroupLegendItemDtoToModel)
  };
}

export function mapHeatmapVisualizationDtoToModel(dto: HeatmapVisualizationDto): HeatmapVisualization {
  return {
    ...mapVisualizationInfoDtoToModel(dto),
    values: dto.values.map(mapVisualizationValueDtoToModel),
    legend: dto.legend.map(mapHeatmapLegendItemDtoToModel)
  };
}

export function mapVisualizationDtoToModel(dto: VisualizationDto): Visualization {
  if (dto.type === VisualizationType.Group) {
    return mapGroupVisualizationDtoToModel(dto as GroupVisualizationDto);
  }

  return mapHeatmapVisualizationDtoToModel(dto as HeatmapVisualizationDto);
}

export function mapCreateGroupVisualizationModelToDto(model: CreateGroupVisualization): CreateGroupVisualizationDto {
  return {
    name: model.name,
    type: VisualizationType.Group,
    values: model.values.map(mapVisualizationValueModelToDto),
    legend: model.legend.map(mapGroupLegendItemModelToDto)
  };
}

export function mapCreateHeatmapVisualizationModelToDto(model: CreateHeatmapVisualization): CreateHeatmapVisualizationDto {
  return {
    name: model.name,
    type: VisualizationType.Heatmap,
    values: model.values.map(mapVisualizationValueModelToDto),
    legend: model.legend.map(mapHeatmapLegendItemModelToDto)
  };
}
