const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Announcement = require('./models/Announcement');
const Task = require('./models/Task');
const Meeting = require('./models/Meeting');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/yb-digital-panel', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const resetDatabase = async () => {
  try {
    console.log('🗑️  Veritabanı temizleniyor...');

    // Clear all data
    await User.deleteMany({});
    await Announcement.deleteMany({});
    await Task.deleteMany({});
    await Meeting.deleteMany({});

    console.log('✅ Tüm veriler silindi');

    // Create only admin user
    const adminPassword = await bcrypt.hash('yb150924', 10);
    const admin = new User({
      name: 'YB Digital Admin',
      email: 'admin@ybdigital.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      joinDate: new Date(),
    });
    await admin.save();

    console.log('👑 Admin kullanıcısı oluşturuldu');
    console.log('\n🎉 Veritabanı sıfırlandı!');
    console.log('\n🔑 Giriş Bilgileri:');
    console.log('   Admin: yb150924');
    console.log('\n🌐 Uygulama: http://localhost:3001');
    console.log('\nArtık üyeleri, görevleri ve duyuruları kendiniz ekleyebilirsiniz!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    mongoose.connection.close();
  }
};

resetDatabase();
