import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

currentUser: any;

constructor(private router: Router) {}

ngOnInit(): void {
  const userData = localStorage.getItem('currentUser');
  if (userData) {
    this.currentUser = JSON.parse(userData);
  }
}
logout(): void {
  // localStorage.clear();
this.router.navigate(['/login']); // ✅ vì route login không nằm trong admin

}
profile(): void {

this.router.navigate(['/admin/profile']); // ✅ vì route login không nằm trong admin

}
get currentUsername() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData).username : '';
}


}
