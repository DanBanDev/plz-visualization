import { Component } from "@angular/core";

@Component({
  selector: 'app-header',
  standalone: false,
  template: `
      
      <p>Header</p>
  `,
  styles: [`
        :host {
      display: flex;
      align-items: center;
      padding-left: 1rem;
      box-sizing: border-box;
      border-bottom: 1px solid lightgray;
    }
    `]
})
export class HeaderComponent {
}
