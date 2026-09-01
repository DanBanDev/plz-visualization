import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, take, tap } from 'rxjs/operators';
import { selectAuthState } from '../store/auth/auth.selectors';
import { loadCurrentUser } from '../store/auth/auth.actions';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthState).pipe(
    tap(state => {
      if (!state.initialized && !state.loading) {
        store.dispatch(loadCurrentUser());
      }
    }),
    filter(state => state.initialized),
    take(1),
    map(state => {
      if (state.user !== null) {
        return true;
      }
      return router.createUrlTree(['/login']);
    })
  );
};
