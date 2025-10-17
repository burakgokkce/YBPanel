#!/bin/bash

echo "🚀 YB Digital Panel - Hızlı Başlangıç"
echo "=================================="

# Check if MongoDB is running
echo "📊 MongoDB kontrol ediliyor..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB çalışmıyor. Başlatılıyor..."
    # Try to start MongoDB with different methods
    if command -v brew &> /dev/null; then
        brew services start mongodb-community
    else
        mongod --dbpath /usr/local/var/mongodb &
    fi
    sleep 3
else
    echo "✅ MongoDB çalışıyor"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Bağımlılıklar yükleniyor..."
    npm install
fi

# Seed database
echo "🌱 Veritabanı hazırlanıyor..."
npm run seed

echo ""
echo "🎉 Kurulum tamamlandı!"
echo ""
echo "📋 Giriş Bilgileri:"
echo "   👑 Admin: yb150924"
echo "   👤 Üye: john.doe@ybdigital.com / password123"
echo ""
echo "🚀 Sunucuları başlatmak için:"
echo "   Terminal 1: npm run dev:server"
echo "   Terminal 2: npm run dev"
echo ""
echo "🌐 Uygulama: http://localhost:3000"
