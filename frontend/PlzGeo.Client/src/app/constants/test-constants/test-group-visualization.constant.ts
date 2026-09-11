import { GroupVisualization } from '../../models/group-visualization.model';
import { VisualizationType } from '../../models/visualization-type.enum';

// References the postal codes defined in test-postal-code-geojson.constant.ts.
export const testGroupVisualization: GroupVisualization = {
  id: 'test-visualization-1',
  name: 'Test Group Visualization',
  type: VisualizationType.Group,
  values: [
    { postalCode: '10115', value: 1 },
    { postalCode: '10117', value: 2 }
  ],
  legend: [
    { value: 1, name: 'Group A', color: '#ff0000' },
    { value: 2, name: 'Group B', color: '#00ff00' }
  ]
};
