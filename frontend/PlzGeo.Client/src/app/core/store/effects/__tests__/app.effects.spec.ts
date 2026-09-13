import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppEffects } from '../app.effects';
import { VisualizationApiClient } from '../../../../api-clients/apis/visualization.api-client';
import { uploadHeatmapVisualizationSuccess } from '../../actions/upload-heatmap-visualization.action';
import { uploadGroupVisualizationSuccess } from '../../actions/upload-group-visualization.action';
import { selectVisualization } from '../../actions/select-visualization.action';
import { VisualizationType } from '../../../../models/visualization-type.enum';
import { VisualizationInfo } from '../../../../models/visualization-info.model';

describe('AppEffects', () => {
  let actions$: Observable<Action>;
  let effects: AppEffects;
  let visualizationApiClientSpy: jasmine.SpyObj<VisualizationApiClient>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const heatmapInfo: VisualizationInfo = {
    id: 'heatmap-123',
    name: 'Test Heatmap',
    type: VisualizationType.Heatmap
  };

  const groupInfo: VisualizationInfo = {
    id: 'group-456',
    name: 'Test Group',
    type: VisualizationType.Group
  };

  beforeEach(() => {
    visualizationApiClientSpy = jasmine.createSpyObj<VisualizationApiClient>('VisualizationApiClient', [
      'createHeatmapVisualization',
      'createGroupVisualization',
      'getVisualization',
      'getVisualizations',
      'deleteVisualization'
    ]);
    dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open', 'closeAll']);
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        AppEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: VisualizationApiClient, useValue: visualizationApiClientSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });

    effects = TestBed.inject(AppEffects);
  });

  it('should dispatch selectVisualization on uploadHeatmapVisualizationSuccess', done => {
    actions$ = of(uploadHeatmapVisualizationSuccess({ visualization: heatmapInfo }));

    effects.selectVisualizationOnUploadSuccess$.subscribe(action => {
      expect(action).toEqual(selectVisualization({ id: heatmapInfo.id }));
      done();
    });
  });

  it('should dispatch selectVisualization on uploadGroupVisualizationSuccess', done => {
    actions$ = of(uploadGroupVisualizationSuccess({ visualization: groupInfo }));

    effects.selectVisualizationOnUploadSuccess$.subscribe(action => {
      expect(action).toEqual(selectVisualization({ id: groupInfo.id }));
      done();
    });
  });
});
