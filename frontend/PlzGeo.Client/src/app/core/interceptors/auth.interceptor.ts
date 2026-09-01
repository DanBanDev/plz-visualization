import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { logoutSuccess } from '../store/auth/auth.actions';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const router = inject(Router);

  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!req.url.includes('/api/auth/me') && !req.url.includes('/api/auth/login') && !req.url.includes('/api/auth/register')) {
          store.dispatch(logoutSuccess());
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
