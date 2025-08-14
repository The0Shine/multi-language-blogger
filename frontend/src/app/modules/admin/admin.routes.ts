import { Routes } from '@angular/router';
import { AdminCategorieListComponent } from './components/categories/list/list.component';
import { AdminUserListComponent } from './components/user/list/list.component';
import { AdminRoleListComponent } from './components/role/list/list.component';
import { AdminPostListComponent } from './components/post/list/list.component';
import { AdminLanguageListComponent } from './components/language/list/list.component';

import { HomeComponent } from '../../home/home.component';
// import { AdminPostCreateComponent } from './components/post/create/create.component';


export const adminRoutes: Routes = [
  { path: 'home', component: HomeComponent }, // Dashboard
  { path: 'user/list', component: AdminUserListComponent },
  { path: 'category/list', component: AdminCategorieListComponent },
  { path: 'role/list', component: AdminRoleListComponent },
  { path: 'post/list', component: AdminPostListComponent},
  // { path: 'post/create', component: AdminPostCreateComponent},

  { path: 'language/list', component: AdminLanguageListComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
