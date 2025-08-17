import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoginComponent, // ✅ Import standalone component thay vì declarations
    RouterModule.forChild([
      { path: 'login', component: LoginComponent }
    ])
  ]
})
export class AuthModule {}
