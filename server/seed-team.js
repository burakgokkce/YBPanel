const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/yb-digital-panel', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedTeam = async () => {
  try {
    console.log('👥 YB Digital ekibi ekleniyor...');

    // Ekip üyeleri
    const teamMembers = [
      // Yönetim
      {
        firstName: 'Burak',
        lastName: 'Gökçe',
        email: 'burak@ybdigital.com',
        password: await bcrypt.hash('yb150924', 10),
        phone: '+90 555 000 0001',
        address: 'İstanbul, Türkiye',
        department: 'Yönetim',
        position: 'Founder / CEO',
        role: 'admin',
        isActive: true,
        joinDate: new Date('2020-01-01'),
      },
      {
        firstName: 'Erenalp',
        lastName: 'Yılmaz',
        email: 'erenalp@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+90 555 000 0002',
        address: 'İstanbul, Türkiye',
        department: 'Proje Yönetimi',
        position: 'COO / Project Manager',
        role: 'admin',
        isActive: true,
        joinDate: new Date('2020-02-01'),
      },

      // Backend Ekibi
      {
        firstName: 'Merve',
        lastName: 'Arslan',
        email: 'merve.arslan@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+90 555 000 0003',
        address: 'Ankara, Türkiye',
        department: 'Backend',
        position: 'Backend Developer',
        role: 'member',
        isActive: true,
        joinDate: new Date('2021-03-15'),
      },

      // Frontend Web Ekibi
      {
        firstName: 'Mustafa',
        lastName: 'Nalbant',
        email: 'mustafa.nalbant@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+90 555 000 0004',
        address: 'İzmir, Türkiye',
        department: 'Web',
        position: 'Frontend Developer (Web)',
        role: 'member',
        isActive: true,
        joinDate: new Date('2021-06-01'),
      },
      {
        firstName: 'Sinan',
        lastName: 'Kaya',
        email: 'sinan@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+90 555 000 0005',
        address: 'Bursa, Türkiye',
        department: 'Web',
        position: 'Frontend Developer (Web)',
        role: 'member',
        isActive: true,
        joinDate: new Date('2022-01-10'),
      },
      {
        firstName: 'Ebru',
        lastName: 'Demir',
        email: 'ebru@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+90 555 000 0006',
        address: 'Antalya, Türkiye',
        department: 'Web',
        position: 'Web Developer (Stajyer)',
        role: 'member',
        isActive: true,
        joinDate: new Date('2024-09-01'),
      },

      // iOS Ekibi
      {
        firstName: 'Bayram',
        lastName: 'Yeleç',
        email: 'bayram.yelec@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+90 555 000 0007',
        address: 'İstanbul, Türkiye',
        department: 'iOS',
        position: 'iOS Developer',
        role: 'member',
        isActive: true,
        joinDate: new Date('2021-08-15'),
      },
      {
        firstName: 'Oğuzhan',
        lastName: 'Katlanoğlu',
        email: 'oguzhan.katlanoglu@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+90 555 000 0008',
        address: 'Ankara, Türkiye',
        department: 'iOS',
        position: 'iOS Developer',
        role: 'member',
        isActive: true,
        joinDate: new Date('2022-03-01'),
      },

      // Tasarım Ekibi
      {
        firstName: 'Merve Sude',
        lastName: 'Üder',
        email: 'merve.sude@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+90 555 000 0009',
        address: 'İstanbul, Türkiye',
        department: 'Tasarım',
        position: 'UI/UX Designer',
        role: 'member',
        isActive: true,
        joinDate: new Date('2021-11-01'),
      },

      // Test Ekibi
      {
        firstName: 'Fatmanur',
        lastName: 'Akçabet',
        email: 'fatmanur.akcabet@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+90 555 000 0010',
        address: 'İzmir, Türkiye',
        department: 'Test',
        position: 'Tester (Stajyer)',
        role: 'member',
        isActive: true,
        joinDate: new Date('2024-07-01'),
      }
    ];

    // Mevcut kullanıcıları sil (admin hariç)
    await User.deleteMany({ email: { $ne: 'admin@ybdigital.com' } });
    console.log('🗑️  Mevcut kullanıcılar temizlendi');

    // Yeni ekip üyelerini ekle
    for (const member of teamMembers) {
      const user = new User(member);
      await user.save();
      console.log(`✅ ${member.firstName} ${member.lastName} eklendi - ${member.department}`);
    }

    console.log('\n🎉 YB Digital ekibi başarıyla eklendi!');
    console.log('\n👥 Eklenen Ekip Üyeleri:');
    console.log(`   • ${teamMembers.length} kişi`);
    console.log('\n🏢 Departmanlar:');
    console.log('   • Yönetim: 2 kişi');
    console.log('   • Backend: 1 kişi');
    console.log('   • Web: 3 kişi');
    console.log('   • iOS: 2 kişi');
    console.log('   • Tasarım: 1 kişi');
    console.log('   • Test: 1 kişi');
    console.log('\n🔑 Giriş Bilgileri:');
    console.log('   Admin: burak@ybdigital.com / yb150924');
    console.log('   Admin: erenalp@ybdigital.com / password123');
    console.log('   Üyeler: [email] / password123');
    console.log('\n🌐 Uygulama: http://localhost:3001');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedTeam();
