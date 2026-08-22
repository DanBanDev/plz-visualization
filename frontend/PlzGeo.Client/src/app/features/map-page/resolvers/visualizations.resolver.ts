import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { VisualizationApiClient } from '../../../api-clients/apis/visualization.api-client';
import { VisualizationInfo } from '../../../models/visualization-info.model';
import { loadVisualizationsSuccess } from '../../../core/store/actions/load-visualizations.action';

export const visualizationsResolver: ResolveFn<VisualizationInfo[]> = () => {
  const apiClient = inject(VisualizationApiClient);
  const store = inject(Store);

  return apiClient.getVisualizations().pipe(
    tap(visualizations => store.dispatch(loadVisualizationsSuccess({ visualizations })))
  );
};
