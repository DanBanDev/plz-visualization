import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { VisualizationInfoDto } from "../dtos/visualization-info.dto";
import { VisualizationDto } from "../dtos/visualization.dto";
import { VisualizationInfo } from "../../models/visualization-info.model";
import { Visualization } from "../../models/visualization.model";
import { CreateGroupVisualization } from "../../models/create-group-visualization.model";
import { CreateHeatmapVisualization } from "../../models/create-heatmap-visualization.model";

import {
  mapVisualizationInfoDtoToModel,
  mapVisualizationDtoToModel,
  mapCreateGroupVisualizationModelToDto,
  mapCreateHeatmapVisualizationModelToDto
} from "../mappers/visualization.mapper";

const baseUrl = '/api/visualizations';

@Injectable({
  providedIn: 'root'
})
export class VisualizationApiClient {

  constructor(
    private readonly http: HttpClient
  ) {
  }

  getVisualizations(): Observable<VisualizationInfo[]> {
    return this.http.get<VisualizationInfoDto[]>(baseUrl).pipe(
      map(dtos => dtos.map(mapVisualizationInfoDtoToModel))
    );
  }

  getVisualization(id: string): Observable<Visualization> {
    return this.http.get<VisualizationDto>(`${baseUrl}/${id}`).pipe(
      map(mapVisualizationDtoToModel)
    );
  }

  createHeatmapVisualization(model: CreateHeatmapVisualization): Observable<VisualizationInfo> {
    const dto = mapCreateHeatmapVisualizationModelToDto(model);

    return this.http.post<VisualizationInfoDto>(`${baseUrl}/heatmap`, dto).pipe(
      map(mapVisualizationInfoDtoToModel)
    );
  }

  createGroupVisualization(model: CreateGroupVisualization): Observable<VisualizationInfo> {
    const dto = mapCreateGroupVisualizationModelToDto(model);

    return this.http.post<VisualizationInfoDto>(`${baseUrl}/group`, dto).pipe(
      map(mapVisualizationInfoDtoToModel)
    );
  }

  deleteVisualization(id: string): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/${id}`);
  }

}