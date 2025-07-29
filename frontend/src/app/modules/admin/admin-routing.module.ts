import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { AdminCategorieListComponent } from './components/categories/list/list.component';
import { AdminUserListComponent } from './components/user/list/list.component';
import { AdminRoleListComponent } from './components/role/list/list.component';
import { AdminPostListComponent } from './components/post/list/list.component';
import { AdminLanguageListComponent } from './components/language/list/list.component';

import { AdminCategorieCreateComponent } from './components/categories/create/create.component';

import { AdminLanguageCreateComponent } from './components/language/create/create.component';
import { AdminUserCreateComponent } from './components/user/create/create.component';
import { AdminRoleCreateComponent } from './components/role/create/create.component';
import { AdminPostCreateComponent } from './components/post/create/create.component';
import { AdminRoleUpdateComponent } from './components/role/update/update.component';
import { AdminCategoriesUpdateComponent } from './components/categories/update/update.component';
import { AdminLanguageUpdateComponent } from './components/language/update/update.component';

import { AdminUserUpdateComponent } from './components/user/update/update.component';
import { AdminPostUpdateComponent } from './components/post/update/update.component';
import { AuthGuard } from '../../modules/auth/auth.guard';
import { HomeComponent } from '../../home/home.component';


const routes: Routes = [
     { path: 'home', component: HomeComponent }, // ⬅️ Dashboard
    {path: 'user/list', component: AdminUserListComponent, canActivate: [AuthGuard]},
    {path: 'user/create', component: AdminUserCreateComponent, canActivate: [AuthGuard]},
    {path: 'user/update/:id', component: AdminUserUpdateComponent, canActivate: [AuthGuard]},

    {path: 'category/list', component: AdminCategorieListComponent, canActivate: [AuthGuard]},
    {path: 'category/update/:id', component: AdminCategoriesUpdateComponent, canActivate: [AuthGuard]},

    {path: 'role/list', component: AdminRoleListComponent, canActivate: [AuthGuard]},
    {path: 'role/create', component: AdminRoleCreateComponent, canActivate: [AuthGuard]},
    {path: 'role/update/:id', component: AdminRoleUpdateComponent, canActivate: [AuthGuard]},

    {path: 'post/list', component: AdminPostListComponent, canActivate: [AuthGuard]},
    {path: 'post/create', component: AdminPostCreateComponent, canActivate: [AuthGuard]},
    {path: 'post/update/:id', component: AdminPostUpdateComponent, canActivate: [AuthGuard]},

    {path: 'category/create', component: AdminCategorieCreateComponent, canActivate: [AuthGuard]},
    {path: 'language/list', component: AdminLanguageListComponent, canActivate: [AuthGuard]},
    {path: 'language/create', component: AdminLanguageCreateComponent, canActivate: [AuthGuard]},
    {path: 'language/update/:id', component: AdminLanguageUpdateComponent, canActivate: [AuthGuard]},

      { path: '', redirectTo: 'home', pathMatch: 'full' } // ⬅️ Admin mặc định cũng về dashboard

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AdminRoutingModule {
}
