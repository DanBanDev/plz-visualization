import { Component } from "@angular/core";

@Component({
  selector: 'app-header',
  standalone: false,
  template: `
      
      <p>Header</p>
  `,
  styles: [`
    :host {
      display: block;
      background: #f5f5f5;
    }
    `]
})
export class HeaderComponent {
}
