import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MapPageModule } from './features/map-page/map-page.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AppRoutingModule } from './app-routing.module';
import { provideHttpClient } from '@angular/common/http';
import { appReducer } from './core/store/app.reducer';
import { AppEffects } from './core/store/app.effects';


@NgModule({
  declarations: [AppComponent],
  imports: [
        BrowserModule,
        AppRoutingModule,
        StoreModule.forRoot(appReducer),
        EffectsModule.forRoot([AppEffects]),
        MapPageModule
    ],
      providers: [
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}