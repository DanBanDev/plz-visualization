import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { register } from '../../core/store/auth/auth.actions';
import { selectAuthError, selectAuthLoading, selectIsAuthenticated } from '../../core/store/auth/auth.selectors';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register-page',
  standalone: false,
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <img src="zip-app-logo.png" alt="ZIP App Logo" class="header-logo">
          <mat-card-title>PLZ Visualisierung</mat-card-title>
          <mat-card-subtitle>Registrieren</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-Mail</mat-label>
              <input matInput type="email" formControlName="email" placeholder="name@beispiel.de">
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                E-Mail ist erforderlich
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Ungültige E-Mail-Adresse
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Passwort</mat-label>
              <input matInput type="password" formControlName="password">
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Passwort ist erforderlich
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Passwort muss mindestens 6 Zeichen lang sein
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Passwort wiederholen</mat-label>
              <input matInput type="password" formControlName="confirmPassword">
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                Passwort-Bestätigung ist erforderlich
              </mat-error>
              <mat-error *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
                Passwörter stimmen nicht überein
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
                [disabled]="registerForm.invalid || (loading$ | async)">
                Registrieren
              </button>

              <mat-spinner *ngIf="loading$ | async" diameter="28"></mat-spinner>
            </div>
          </form>
        </mat-card-content>

        <mat-card-footer class="auth-footer">
          <span>Bereits ein Konto?</span>
          <a routerLink="/login">Hier anmelden</a>
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
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
    }

    .actions button {
      width: 100%;
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
export class RegisterPageComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  registerForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });

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
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      this.store.dispatch(register({ request: { email, password } }));
    }
  }
}
