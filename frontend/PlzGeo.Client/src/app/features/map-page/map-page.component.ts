import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { VisualizationInfo } from '../../models/visualization-info.model';
import { selectVisualizations } from '../../core/store/visualizations/visualizations.selectors';


@Component({
  selector: 'app-map-page',
  standalone: false,
  template: `
      <app-header [visualizations]="visualizations$ | async"></app-header>
      <app-map></app-map>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    app-header {
      flex: 0 0 64px;
    }

    app-map {
      flex: 1;
    }
    `]
})
export class MapPageComponent {
  readonly visualizations$: Observable<VisualizationInfo[]>;

  constructor(
    private readonly store: Store
  ) {
    this.visualizations$ = this.store.select(selectVisualizations);
    console.log('MapPageComponent erstellt');
  }
}
