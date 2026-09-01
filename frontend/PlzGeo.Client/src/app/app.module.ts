import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { MapPageModule } from './features/map-page/map-page.module';
import { AuthModule } from './features/auth/auth.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AppRoutingModule } from './app-routing.module';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { appReducer } from './core/store/app.reducer';
import { AppEffects } from './core/store/effects/app.effects';
import { AuthEffects } from './core/store/effects/auth.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    StoreModule.forRoot(appReducer),
    EffectsModule.forRoot([AppEffects, AuthEffects]),
    MapPageModule,
    AuthModule,
    MatSnackBarModule
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}