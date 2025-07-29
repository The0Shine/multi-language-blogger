import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'; // 👈 Thêm dòng này
import { AuthInterceptor } from './auth.interceptor';
import { HomeComponent } from './home/home.component';
import { LayoutComponent } from './layout/layout.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LayoutComponent,

    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule, // 👈 Và thêm dòng này trong imports
        FormsModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
          }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
