import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadCurrentUser } from './core/store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [`
    
    `]
})
export class AppComponent implements OnInit {
  title = 'PlzGeo.Client';

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(loadCurrentUser());
  }
}
