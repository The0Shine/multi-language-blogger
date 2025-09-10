# Hướng dẫn Deploy lên Vercel

## Tổng quan
Dự án này bao gồm 3 phần cần deploy riêng biệt:
1. **Backend API** (Node.js/Express)
2. **Frontend User** (Angular - Blog người dùng)
3. **Frontend Admin** (Angular - Dashboard quản trị)

## Bước 1: Chuẩn bị Database

### 1.1 Tạo Database trên Cloud
Bạn cần một database MySQL trên cloud. Một số lựa chọn:
- **PlanetScale** (miễn phí): https://planetscale.com/
- **Railway** (miễn phí): https://railway.app/
- **Aiven** (miễn phí): https://aiven.io/

### 1.2 Chạy Migration
```bash
cd backend
npm install
# Cập nhật config/config.json với thông tin database cloud
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## Bước 2: Deploy Backend

### 2.1 Cài đặt Vercel CLI
```bash
npm install -g vercel
```

### 2.2 Deploy Backend
```bash
cd backend
vercel login
vercel
```

### 2.3 Cấu hình Environment Variables trên Vercel
Vào Vercel Dashboard > Project > Settings > Environment Variables và thêm:
```
DB_HOST=your_cloud_database_host
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_PORT=3306
JWT_SECRET=your_strong_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM="Your Name <your-email@example.com>"
```

## Bước 3: Deploy Frontend User

### 3.1 Cập nhật API URL
Sửa file `fontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.vercel.app/api'
};
```

### 3.2 Deploy
```bash
cd fontend
vercel
```

## Bước 4: Deploy Frontend Admin

### 4.1 Cập nhật API URL
Sửa file `frontendadmin/src/environments/environments.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.vercel.app/api'
};
```

### 4.2 Deploy
```bash
cd frontendadmin
vercel
```

## Bước 5: Cấu hình CORS

Cập nhật file `backend/app.js` để cho phép domain mới:
```javascript
app.use(
  cors({
    origin: [
      "https://your-frontend-url.vercel.app",
      "https://your-admin-url.vercel.app"
    ],
    credentials: true,
  })
);
```

## Lưu ý quan trọng

### 1. Giới hạn của Vercel
- **Serverless Functions**: Timeout 10s (Hobby plan)
- **Database**: Cần sử dụng database cloud
- **WebSocket**: Có thể không hoạt động ổn định trên serverless

### 2. Thay thế cho WebSocket
Nếu WebSocket không hoạt động, có thể sử dụng:
- **Server-Sent Events (SSE)**
- **Polling**
- **Pusher** hoặc **Ably** (dịch vụ real-time)

### 3. Alternative Deployment
Nếu gặp vấn đề với Vercel, có thể sử dụng:
- **Railway**: Hỗ trợ full-stack apps
- **Render**: Miễn phí cho hobby projects
- **Heroku**: Có plan miễn phí (với giới hạn)

## Kiểm tra sau khi deploy

1. **Backend**: Truy cập `https://your-backend-url.vercel.app/api`
2. **Frontend**: Kiểm tra login/register
3. **Admin**: Kiểm tra dashboard
4. **Database**: Kiểm tra kết nối và data

## Troubleshooting

### Lỗi thường gặp:
1. **Database connection**: Kiểm tra credentials và whitelist IP
2. **CORS errors**: Cập nhật origin trong backend
3. **Build errors**: Kiểm tra dependencies và TypeScript errors
4. **Environment variables**: Đảm bảo tất cả biến môi trường được set

### Debug:
- Xem logs trên Vercel Dashboard
- Kiểm tra Network tab trong browser
- Test API endpoints với Postman
