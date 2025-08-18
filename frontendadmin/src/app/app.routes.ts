import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

import { HomeComponent } from './home/home.component';
import { AuthGuard } from './modules/auth/auth.guard';
// ✅ BƯỚC 1: Import PermissionGuard
import { PermissionGuard } from './permission.guard';

// Import các component standalone
import { AdminUserListComponent } from './modules/admin/components/user/list/list.component';
import { AdminRoleListComponent } from './modules/admin/components/role/list/list.component';
import { AdminLanguageListComponent } from './modules/admin/components/language/list/list.component';
import { AdminCategorieListComponent } from './modules/admin/components/categories/list/list.component';
import { AdminPostListComponent } from './modules/admin/components/post/list/list.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { ForgotPasswordComponent } from './modules/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

 {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [AuthGuard], // AuthGuard kiểm tra đăng nhập cho toàn bộ khu vực admin
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },

      // ✅ ÁP DỤNG PERMISSION GUARD CHO CÁC ROUTE CON
      {
        path: 'user/list',
        component: AdminUserListComponent,
        canActivate: [PermissionGuard],       // <-- BẢO VỆ BẰNG PERMISSION GUARD
        data: { permission: 'manage_users' } // <-- ĐỊNH NGHĨA QUYỀN YÊU CẦU
      },
      {
        path: 'role/list',
        component: AdminRoleListComponent,

      },
      {
        path: 'language/list',
        component: AdminLanguageListComponent,

      },
      {
        path: 'category/list',
        component: AdminCategorieListComponent,

      },
      {
        path: 'post/list',
        component: AdminPostListComponent,

      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
