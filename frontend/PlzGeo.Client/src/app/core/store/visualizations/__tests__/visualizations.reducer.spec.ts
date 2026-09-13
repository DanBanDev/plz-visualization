import { visualizationsReducer, initialState } from '../visualizations.reducer';
import { uploadHeatmapVisualizationSuccess } from '../../actions/upload-heatmap-visualization.action';
import { uploadGroupVisualizationSuccess } from '../../actions/upload-group-visualization.action';
import { VisualizationType } from '../../../../models/visualization-type.enum';
import { VisualizationInfo } from '../../../../models/visualization-info.model';

describe('visualizationsReducer', () => {
  const heatmapInfo: VisualizationInfo = {
    id: 'h1',
    name: 'Heatmap Test',
    type: VisualizationType.Heatmap
  };

  const groupInfo: VisualizationInfo = {
    id: 'g1',
    name: 'Group Test',
    type: VisualizationType.Group
  };

  it('should add uploaded heatmap visualization to items list', () => {
    const state = visualizationsReducer(initialState, uploadHeatmapVisualizationSuccess({ visualization: heatmapInfo }));

    expect(state.items).toEqual([heatmapInfo]);
  });

  it('should add uploaded group visualization to items list without duplicating', () => {
    const intermediateState = visualizationsReducer(initialState, uploadHeatmapVisualizationSuccess({ visualization: heatmapInfo }));
    const finalState = visualizationsReducer(intermediateState, uploadGroupVisualizationSuccess({ visualization: groupInfo }));

    expect(finalState.items).toEqual([heatmapInfo, groupInfo]);

    // Updating existing id should replace instead of duplicate
    const updatedHeatmap: VisualizationInfo = { ...heatmapInfo, name: 'Heatmap Updated' };
    const stateAfterUpdate = visualizationsReducer(finalState, uploadHeatmapVisualizationSuccess({ visualization: updatedHeatmap }));
    expect(stateAfterUpdate.items).toEqual([groupInfo, updatedHeatmap]);
  });
});
