import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <router-outlet></router-outlet>
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
