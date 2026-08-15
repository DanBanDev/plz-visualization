import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <app-map-page></app-map-page>
  `,
  styles: [`
    
    `]
})
export class AppComponent {
    constructor() {
    console.log('AppComponent erstellt');
  }
  title = 'PlzGeo.Client';
}
