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

export const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'post/:id', component: PostDetailComponent },

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

  // Redirect route for authenticated users
  { path: 'dashboard', canActivate: [redirectGuard], children: [] },

  { path: '**', redirectTo: '' },
];
