import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    fixture.detectChanges();
  });

  it('should render a sized map container', () => {
    const mapContainer = fixture.nativeElement.querySelector('div');

    expect(mapContainer).toBeTruthy();
    expect(mapContainer.classList.contains('map-container')).toBeTrue();
  });
});
