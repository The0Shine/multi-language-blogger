import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';

import { HttpClientModule } from '@angular/common/http';
import { AdminUserListComponent } from './components/user/list/list.component';
import { AdminRoleListComponent } from './components/role/list/list.component';
import { AdminLanguageListComponent } from './components/language/list/list.component';
import { AdminCategorieListComponent } from './components/categories/list/list.component';

@NgModule({
    declarations: [
        AdminUserListComponent,
        AdminLanguageListComponent,
        AdminRoleListComponent,
        AdminCategorieListComponent
    ],
    imports: [
        HttpClientModule,
        CommonModule,
        AdminRoutingModule,
        FormsModule,
        ReactiveFormsModule,
    ],
})
export class AdminModule {}
