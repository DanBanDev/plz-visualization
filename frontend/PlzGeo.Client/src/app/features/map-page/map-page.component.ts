import { Component } from '@angular/core';


@Component({
  selector: 'app-map-page',
  standalone: false,
  template: `
      <app-header></app-header>
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
  constructor() {
    console.log('MapPageComponent erstellt');
  }
}
