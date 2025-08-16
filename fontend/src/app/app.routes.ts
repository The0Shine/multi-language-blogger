import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { WriteComponent } from './pages/write/write.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MyStoryComponent } from './pages/my-story/my-story.component';
import { PostDetailComponent } from './pages/post-detail/post-detail.component';
import { adminGuard, adminOrUserGuard } from './guards/role.guard';
import { redirectGuard } from './guards/redirect.guard';

// Admin imports
import { AdminLayoutComponent } from './admin/layout/layout.component';
import { AdminHomeComponent } from './admin/home/home.component';
import { AdminUserListComponent } from './admin/modules/admin/components/user/list/list.component';
import { AdminRoleListComponent } from './admin/modules/admin/components/role/list/list.component';
import { AdminLanguageListComponent } from './admin/modules/admin/components/language/list/list.component';
import { AdminCategorieListComponent } from './admin/modules/admin/components/categories/list/list.component';
import { AdminPostListComponent } from './admin/modules/admin/components/post/list/list.component';
import { ForgotPasswordComponent } from './admin/modules/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './admin/modules/auth/reset-password/reset-password.component';
import { RoleTestComponent } from './components/role-test/role-test.component';

export const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'post/:id', component: PostDetailComponent },
  { path: 'role-test', component: RoleTestComponent },

  // User routes (accessible by both admin and user)
  { path: 'write', component: WriteComponent, canActivate: [adminOrUserGuard] },
  {
    path: 'write/:id',
    component: WriteComponent,
    canActivate: [adminOrUserGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [adminOrUserGuard],
  },
  {
    path: 'my-story',
    component: MyStoryComponent,
    canActivate: [adminOrUserGuard],
  },

  // Admin routes (require admin role)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'home', component: AdminHomeComponent },
      { path: 'user/list', component: AdminUserListComponent },
      { path: 'role/list', component: AdminRoleListComponent },
      { path: 'language/list', component: AdminLanguageListComponent },
      { path: 'category/list', component: AdminCategorieListComponent },
      { path: 'post/list', component: AdminPostListComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  // Redirect route for authenticated users
  { path: 'dashboard', canActivate: [redirectGuard], children: [] },

  { path: '**', redirectTo: '' },
];
