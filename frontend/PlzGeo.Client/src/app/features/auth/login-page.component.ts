import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { login } from '../../core/store/auth/auth.actions';
import { selectAuthError, selectAuthLoading, selectIsAuthenticated } from '../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-login-page',
  standalone: false,
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <img src="zip-app-logo.png" alt="ZIP App Logo" class="header-logo">
          <mat-card-title>PLZ Visualisierung</mat-card-title>
          <mat-card-subtitle>Anmelden</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-Mail</mat-label>
              <input matInput type="email" formControlName="email" placeholder="name@beispiel.de">
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                E-Mail ist erforderlich
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Ungültige E-Mail-Adresse
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Passwort</mat-label>
              <input matInput type="password" formControlName="password">
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Passwort ist erforderlich
              </mat-error>
            </mat-form-field>

            <div class="error-message" *ngIf="error$ | async as error">
              {{ error }}
            </div>

            <div class="actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="loginForm.invalid || (loading$ | async)">
                Anmelden
              </button>

              <mat-spinner *ngIf="loading$ | async" diameter="28"></mat-spinner>
            </div>
          </form>
        </mat-card-content>

        <mat-card-footer class="auth-footer">
          <span>Noch kein Konto?</span>
          <a routerLink="/register">Hier registrieren</a>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    mat-card-header {
      margin-bottom: 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }



    .header-logo {
      width: 80px;
      height: auto;
      margin-bottom: 16px;
      order: -1;
    }

    .full-width {
      width: 100%;
      margin-bottom: 12px;
    }

    .error-message {
      color: #d32f2f;
      font-size: 14px;
      margin-bottom: 16px;
      text-align: center;
    }

    .actions {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-top: 12px;
    }

    .auth-footer {
      display: flex;
      gap: 8px;
      justify-content: center;
      padding: 16px;
      font-size: 14px;
    }

    .auth-footer a {
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginPageComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  loginForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    this.store.select(selectIsAuthenticated)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.router.navigate(['/map']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.store.dispatch(login({ request: this.loginForm.value }));
    }
  }
}
