#!/bin/bash

echo "🚀 Bắt đầu deploy NodeJS-Core lên Vercel..."

# Kiểm tra Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI chưa được cài đặt. Đang cài đặt..."
    npm install -g vercel
fi

echo "📦 Deploy Backend..."
cd backend
vercel --prod
BACKEND_URL=$(vercel --prod 2>&1 | grep -o 'https://[^[:space:]]*')
echo "✅ Backend deployed: $BACKEND_URL"
cd ..

echo "🔧 Cập nhật API URL trong Frontend..."
# Cập nhật environment.prod.ts cho frontend user
sed -i "s|https://your-backend-url.vercel.app/api|$BACKEND_URL/api|g" fontend/src/environments/environment.prod.ts

# Cập nhật environment.ts cho frontend admin
sed -i "s|https://your-backend-url.vercel.app/api|$BACKEND_URL/api|g" frontendadmin/src/environments/environments.ts

echo "🌐 Deploy Frontend User..."
cd fontend
vercel --prod
FRONTEND_URL=$(vercel --prod 2>&1 | grep -o 'https://[^[:space:]]*')
echo "✅ Frontend User deployed: $FRONTEND_URL"
cd ..

echo "👨‍💼 Deploy Frontend Admin..."
cd frontendadmin
vercel --prod
ADMIN_URL=$(vercel --prod 2>&1 | grep -o 'https://[^[:space:]]*')
echo "✅ Frontend Admin deployed: $ADMIN_URL"
cd ..

echo "🎉 Deploy hoàn thành!"
echo "📋 Thông tin deploy:"
echo "   Backend API: $BACKEND_URL"
echo "   Frontend User: $FRONTEND_URL"
echo "   Frontend Admin: $ADMIN_URL"
echo ""
echo "⚠️  Lưu ý: Hãy cập nhật CORS trong backend để cho phép các domain mới!"
