# Hướng dẫn Setup Database Miễn phí

## 1. Railway (Khuyên dùng)

### Ưu điểm:
- Miễn phí 500 giờ/tháng
- Hỗ trợ MySQL, PostgreSQL
- Dễ setup
- Có thể deploy cả backend lên Railway

### Cách setup:
1. Đăng ký tại https://railway.app/
2. Tạo project mới → "Provision MySQL"
3. Lấy connection string từ tab "Connect"

### Thông tin kết nối sẽ có dạng:
```
MYSQL_URL=mysql://username:password@host:port/database
```

## 2. Aiven (Miễn phí 1 tháng)

### Setup:
1. Đăng ký tại https://aiven.io/
2. Chọn MySQL service
3. Chọn plan "Free trial"
4. Lấy connection details

## 3. FreeSQLDatabase (Hoàn toàn miễn phí)

### Setup:
1. Truy cập https://www.freesqldatabase.com/
2. Đăng ký tài khoản
3. Tạo database mới
4. Lấy thông tin kết nối

### Giới hạn:
- 5MB storage
- Phù hợp cho demo/test

## 4. Clever Cloud (Miễn phí với giới hạn)

### Setup:
1. Đăng ký tại https://www.clever-cloud.com/
2. Tạo MySQL addon
3. Chọn plan DEV (miễn phí)

## 5. ElephantSQL (PostgreSQL - Miễn phí)

Nếu bạn có thể chuyển sang PostgreSQL:
1. Đăng ký tại https://www.elephantsql.com/
2. Tạo instance "Tiny Turtle" (miễn phí)
3. Cập nhật Sequelize config để dùng PostgreSQL

## Cách cập nhật config cho Railway:

### 1. Lấy thông tin từ Railway:
- Host: containers-us-west-xxx.railway.app
- Port: 3306
- Database: railway
- Username: root
- Password: [password từ Railway]

### 2. Cập nhật backend/config/config.json:
```json
{
  "production": {
    "username": "root",
    "password": "your_railway_password",
    "database": "railway",
    "host": "containers-us-west-xxx.railway.app",
    "port": 3306,
    "dialect": "mysql",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
```

### 3. Environment Variables cho Vercel:
```
DB_HOST=containers-us-west-xxx.railway.app
DB_NAME=railway
DB_USER=root
DB_PASSWORD=your_railway_password
DB_PORT=3306
```

## Chạy Migration:

### Local (để test):
```bash
cd backend
npm install
# Cập nhật config.json với thông tin Railway
NODE_ENV=production npx sequelize-cli db:migrate
NODE_ENV=production npx sequelize-cli db:seed:all
```

### Hoặc tạo script migration cho production:
```bash
# Tạo file migrate.js trong backend/
node migrate.js
```

## Lưu ý:
- Railway: 500 giờ/tháng (khoảng 20 ngày)
- Aiven: 1 tháng miễn phí, sau đó tính phí
- FreeSQLDatabase: Hoàn toàn miễn phí nhưng giới hạn 5MB
- Clever Cloud: Miễn phí với giới hạn nhỏ

Khuyên dùng Railway vì ổn định và có thể deploy cả backend lên đó thay vì Vercel.
