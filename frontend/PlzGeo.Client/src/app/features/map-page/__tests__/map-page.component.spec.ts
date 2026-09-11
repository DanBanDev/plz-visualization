import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';
import { MapPageComponent } from '../map-page.component';
import { MapComponent } from '../map.component';
import { PdfExportOptions } from '../../../models/pdf-export-options.model';
import { VisualizationType } from '../../../models/visualization-type.enum';

describe('MapPageComponent', () => {
  let component: MapPageComponent;
  let fixture: ComponentFixture<MapPageComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapPageComponent],
      providers: [provideMockStore({
        initialState: {
          visualizations: {
            items: [
              { id: 'visualization-1', name: 'Population', type: VisualizationType.Heatmap }
            ],
            selectedVisualization: null,
            selectedVisualizationError: null,
            isLoadingSelectedVisualization: false
          }
        }
      })],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  afterEach(() => {
    store.resetSelectors();
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose visualizations from the store', async () => {
    const visualizations = await firstValueFrom(component.visualizations$);

    expect(visualizations).toEqual([
      { id: 'visualization-1', name: 'Population', type: VisualizationType.Heatmap }
    ]);
  });

  it('should forward postal code searches to the map component', () => {
    const mapComponent = jasmine.createSpyObj<MapComponent>('MapComponent', ['searchPostalCode']);
    (component as any).mapComponent = mapComponent;

    component.onPostalCodeSearch('10115');

    expect(mapComponent.searchPostalCode).toHaveBeenCalledOnceWith('10115');
  });

  it('should forward PDF exports to the map component', () => {
    const mapComponent = jasmine.createSpyObj<MapComponent>('MapComponent', ['exportToPdf']);
    const options: PdfExportOptions = {
      pageFormat: 'a4',
      orientation: 'landscape',
      dpi: 200
    };
    (component as any).mapComponent = mapComponent;

    component.onPdfExport(options);

    expect(mapComponent.exportToPdf).toHaveBeenCalledOnceWith(options);
  });

  it('should forward clear requests to the map component', () => {
    const mapComponent = jasmine.createSpyObj<MapComponent>('MapComponent', ['deselectHighlightedPostalCodes']);
    (component as any).mapComponent = mapComponent;

    component.onClearMap();

    expect(mapComponent.deselectHighlightedPostalCodes).toHaveBeenCalledOnceWith();
  });

  it('should ignore forwarded events before the map component exists', () => {
    (component as any).mapComponent = undefined;

    expect(() => component.onPostalCodeSearch('10115')).not.toThrow();
    expect(() => component.onPdfExport({
      pageFormat: 'a4',
      orientation: 'portrait',
      dpi: 150
    })).not.toThrow();
    expect(() => component.onClearMap()).not.toThrow();
  });
});
