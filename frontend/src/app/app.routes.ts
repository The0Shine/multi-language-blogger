import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

import { HomeComponent } from './home/home.component';
import { AuthGuard } from './modules/auth/auth.guard';
// Import các component standalone
import { AdminUserListComponent } from './modules/admin/components/user/list/list.component';
import { AdminRoleListComponent } from './modules/admin/components/role/list/list.component';
import { AdminLanguageListComponent } from './modules/admin/components/language/list/list.component';
import { AdminCategorieListComponent } from './modules/admin/components/categories/list/list.component';
import { AdminPostListComponent } from './modules/admin/components/post/list/list.component';
// import { AdminPostCreateComponent } from './modules/admin/components/post/create/create.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';

import { ProfileComponent } from './profile/profile.component';
import { ForgotPasswordComponent } from './modules/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';

export const routes: Routes = [
  // Route login
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Route admin
  {
    path: 'admin',
    component: LayoutComponent,
     canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'user/list', component: AdminUserListComponent },
      { path: 'role/list', component: AdminRoleListComponent },
      { path: 'language/list', component: AdminLanguageListComponent },
      { path: 'category/list', component: AdminCategorieListComponent },
      { path: 'post/list', component: AdminPostListComponent },
      // { path: 'post/create', component: AdminPostCreateComponent },
          { path: 'profile', component: ProfileComponent }, // ✅ thêm dòng này
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },


  // Mặc định vào login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Nếu không khớp route nào thì về login
  { path: '**', redirectTo: 'login' }
];
