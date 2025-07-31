import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

import { HomeComponent } from './home/home.component';

// Import các component standalone
import { AdminUserListComponent } from './modules/admin/components/user/list/list.component';
import { AdminRoleListComponent } from './modules/admin/components/role/list/list.component';
import { AdminLanguageListComponent } from './modules/admin/components/language/list/list.component';
import { AdminCategorieListComponent } from './modules/admin/components/categories/list/list.component';
import { AdminPostListComponent } from './modules/admin/components/post/list/list.component';
import { AdminPostCreateComponent } from './modules/admin/components/post/create/create.component';


export const routes: Routes = [
  {
    path: 'admin',
    component: LayoutComponent,

    children: [
      { path: 'home', component: HomeComponent },
      { path: 'user/list', component: AdminUserListComponent },
      { path: 'role/list', component: AdminRoleListComponent },
      { path: 'language/list', component: AdminLanguageListComponent },
      { path: 'category/list', component: AdminCategorieListComponent },
      { path: 'post/list', component: AdminPostListComponent },
    { path: 'post/create', component: AdminPostCreateComponent },

      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'admin/home', pathMatch: 'full' } // khi truy cập localhost:4200 → admin/home
];
