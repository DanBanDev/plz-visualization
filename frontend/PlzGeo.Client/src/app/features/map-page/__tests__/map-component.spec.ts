import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { MapComponent } from '../map.component';
import { GeographicDataApiClient } from '../../../api-clients/apis/geographic-data.api-client';
import { MapPdfExportService } from '../services/map-pdf-export.service';
import { selectSelectedVisualization, selectIsLoadingSelectedVisualization } from '../../../core/store/visualizations/visualizations.selectors';
import { testPostalCodeGeoJson } from '../../../constants/test-constants/test-postal-code-geojson.constant';
import { testFederalStateBoundariesGeoJson } from '../../../constants/test-constants/test-federal-state-boundaries-geojson.constant';
import { testGroupVisualization } from '../../../constants/test-constants/test-group-visualization.constant';

describe('MapComponent', () => {
  let fixture: ComponentFixture<MapComponent>;
  let component: MapComponent;
  let store: MockStore;
  let geographicDataApiClientSpy: jasmine.SpyObj<GeographicDataApiClient>;
  let mapPdfExportServiceSpy: jasmine.SpyObj<MapPdfExportService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    geographicDataApiClientSpy = jasmine.createSpyObj<GeographicDataApiClient>('GeographicDataApiClient', [
      'getPostalCodeGeoJson',
      'getFederalStateBoundariesGeoJson'
    ]);
    geographicDataApiClientSpy.getPostalCodeGeoJson.and.returnValue(of(testPostalCodeGeoJson));
    geographicDataApiClientSpy.getFederalStateBoundariesGeoJson.and.returnValue(of(testFederalStateBoundariesGeoJson));

    mapPdfExportServiceSpy = jasmine.createSpyObj<MapPdfExportService>('MapPdfExportService', ['export']);
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['openFromComponent']);
    snackBarSpy.openFromComponent.and.returnValue({ dismiss: jasmine.createSpy('dismiss') } as any);

    await TestBed.configureTestingModule({
      declarations: [MapComponent],
      imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, MatTooltipModule],
      providers: [
        provideMockStore({
          initialState: {
            map: {
              showOsmLayer: true,
              showPlzLayer: true,
              showFederalStateBoundariesLayer: true
            },
            visualizations: {
              items: [],
              selectedVisualization: null,
              selectedVisualizationError: null,
              isLoadingSelectedVisualization: false
            }
          }
        }),
        { provide: GeographicDataApiClient, useValue: geographicDataApiClientSpy },
        { provide: MapPdfExportService, useValue: mapPdfExportServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // overrideSelector mutates the shared, memoized selector functions, so it must be undone between tests.
    store.resetSelectors();
    fixture.destroy();
  });

  it('should render a sized map container', () => {
    const mapContainer = fixture.nativeElement.querySelector('div.map-container');

    expect(mapContainer).toBeTruthy();
  });

  it('should load the postal code and federal state boundaries GeoJSON on init', () => {
    expect(geographicDataApiClientSpy.getPostalCodeGeoJson).toHaveBeenCalled();
    expect(geographicDataApiClientSpy.getFederalStateBoundariesGeoJson).toHaveBeenCalled();
  });

  it('should apply the selected visualization from the store', () => {
    store.overrideSelector(selectSelectedVisualization, testGroupVisualization);
    store.refreshState();

    expect(component.selectedVisualization).toEqual(testGroupVisualization);
    expect(component.mappedPostalCodeCount).toBe(2);
    expect(component.legendRows.length).toBe(2);
  });

  it('should reflect the loading state of the selected visualization', () => {
    store.overrideSelector(selectIsLoadingSelectedVisualization, true);
    store.refreshState();

    expect(component.isLoadingVisualization).toBeTrue();
  });

  it('should highlight the postal codes belonging to a legend row', () => {
    store.overrideSelector(selectSelectedVisualization, testGroupVisualization);
    store.refreshState();

    component.highlightLegendRow(0);

    expect(component.selectedLegendRowIndex).toBe(0);
  });

  it('should clear the legend selection and dismiss the snackbar when deselecting', () => {
    store.overrideSelector(selectSelectedVisualization, testGroupVisualization);
    store.refreshState();
    component.highlightLegendRow(0);

    component.deselectHighlightedPostalCodes();

    expect(component.selectedLegendRowIndex).toBeNull();
  });

  it('should delegate PDF export to the MapPdfExportService', () => {
    const options = { pageFormat: 'a4', orientation: 'portrait', dpi: 150 } as const;

    component.exportToPdf(options as any);

    expect(mapPdfExportServiceSpy.export).toHaveBeenCalledTimes(1);
    expect(mapPdfExportServiceSpy.export).toHaveBeenCalledWith(options, jasmine.objectContaining({
      visualizationName: null,
      mappedPostalCodeCount: 0
    }));
  });

  it('should not throw when searching for an unknown postal code', () => {
    expect(() => component.searchPostalCode('00000')).not.toThrow();
  });
});
