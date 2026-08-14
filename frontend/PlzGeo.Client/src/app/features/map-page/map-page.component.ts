import { Component } from '@angular/core';


@Component({
  selector: 'app-map-page',
  standalone: false,
  template: `
      Test map-page
      <p>map-page works!</p>
      <app-header></app-header>
      <app-map></app-map>
  `,
  styles: [`
    
    `]
})
export class MapPageComponent {
  constructor() {
    console.log('MapPageComponent erstellt');
  }
}
