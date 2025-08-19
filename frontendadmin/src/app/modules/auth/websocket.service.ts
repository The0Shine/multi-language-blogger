// src/app/services/websocket.service.ts
import { Injectable, Injector } from '@angular/core'; // <<< THAY ĐỔI: Import Injector
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: Socket;

  // <<< THAY ĐỔI: Inject Injector thay vì AuthService trực tiếp >>>
  constructor(private injector: Injector) {}

  connect(): void {
    // <<< THAY ĐỔI: Lấy AuthService từ Injector khi hàm được gọi >>>
    const authService = this.injector.get(AuthService);

    const currentUser = authService.getUser();
    if (!currentUser || !currentUser.userid) {
      return;
    }

    this.socket = io('http://localhost:4000');

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected! Sending registration...');
      this.socket.emit('register', currentUser.userid);
    });

    this.socket.on('permissions_changed', (data: any) => {
      console.log('❗️ Permissions changed event received:', data.message);
      // <<< THAY ĐỔI: Dùng biến authService cục bộ >>>
      authService.logoutAndRedirect(data.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('WebSocket disconnected.');
    }
  }
}
