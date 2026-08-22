import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapPageComponent } from './features/map-page/map-page.component';
import { visualizationsResolver } from './features/map-page/resolvers/visualizations.resolver';

const routes: Routes = [
  {
    path: '',
    component: MapPageComponent,
    resolve: { visualizations: visualizationsResolver }
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}