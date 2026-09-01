import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { AuthApiClient } from '../../../api-clients/apis/auth-api.api-client';
import {
  login,
  loginSuccess,
  loginFailure,
  register,
  registerSuccess,
  registerFailure,
  logout,
  logoutSuccess,
  loadCurrentUser,
  loadCurrentUserSuccess,
  loadCurrentUserFailure
} from '../auth/auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authApiClient = inject(AuthApiClient);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      mergeMap(({ request }) =>
        this.authApiClient.login(request).pipe(
          map(user => loginSuccess({ user })),
          catchError(error =>
            of(loginFailure({
              error: error?.error?.message ?? (typeof error?.error === 'string' ? error.error : null) ?? error?.message ?? 'Login fehlgeschlagen'
            }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(() => this.router.navigate(['/map']))
      ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(register),
      mergeMap(({ request }) =>
        this.authApiClient.register(request).pipe(
          map(user => registerSuccess({ user })),
          catchError(error =>
            of(registerFailure({
              error: error?.error?.message ?? (typeof error?.error === 'string' ? error.error : null) ?? error?.message ?? 'Registrierung fehlgeschlagen'
            }))
          )
        )
      )
    )
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(registerSuccess),
        tap(() => this.router.navigate(['/map']))
      ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      mergeMap(() =>
        this.authApiClient.logout().pipe(
          map(() => logoutSuccess()),
          catchError(() => of(logoutSuccess()))
        )
      )
    )
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logoutSuccess),
        tap(() => this.router.navigate(['/login']))
      ),
    { dispatch: false }
  );

  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCurrentUser),
      mergeMap(() =>
        this.authApiClient.getCurrentUser().pipe(
          map(user => loadCurrentUserSuccess({ user })),
          catchError(() => of(loadCurrentUserFailure()))
        )
      )
    )
  );
}
