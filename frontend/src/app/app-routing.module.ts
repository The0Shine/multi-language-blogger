import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './modules/auth/auth.guard';

const routes: Routes = [
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./modules/admin/admin.module').then(m => m.AdminModule)
  },
  { path: '', redirectTo: 'admin/home', pathMatch: 'full' } // ⬅️ Mặc định vào dashboard
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
