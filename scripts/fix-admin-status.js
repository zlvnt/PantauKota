// Script sederhana untuk memperbaiki status admin
// Jalankan dengan: node scripts/fix-admin-status.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminStatus() {
  try {
    console.log('🔍 Mencari admin user...');
    
    // Cari admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@pantaukota.id' },
    });

    if (!admin) {
      console.log('❌ Admin user tidak ditemukan dengan email admin@pantaukota.id');
      
      // Coba cari semua user
      console.log('\n📋 Semua user yang ditemukan:');
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (allUsers.length === 0) {
        console.log('❌ Tidak ada user yang ditemukan di database!');
        console.log('💡 Pastikan Anda sudah menjalankan: npm run seed');
      } else {
        allUsers.forEach(user => {
          console.log(`${user.name} (${user.email}) - Role: ${user.role} - Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
        });
        
        // Update semua user menjadi aktif
        console.log('\n🔄 Mengaktifkan semua user...');
        for (const user of allUsers) {
          if (!user.isActive) {
            await prisma.user.update({
              where: { id: user.id },
              data: { isActive: true },
            });
            console.log(`✅ ${user.name} diaktifkan`);
          }
        }
        console.log('\n✅ Semua user sekarang aktif!');
      }
      
      return;
    }

    console.log(`✅ Admin ditemukan: ${admin.name} (${admin.email})`);
    console.log(`📊 Status: ${admin.isActive ? '✅ Aktif' : '❌ Nonaktif'}`);

    // Update admin menjadi aktif jika belum aktif
    if (!admin.isActive) {
      console.log('\n🔄 Mengaktifkan admin...');
      const updatedAdmin = await prisma.user.update({
        where: { id: admin.id },
        data: { isActive: true },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });

      console.log('✅ Admin berhasil diaktifkan!');
      console.log('📋 Status terbaru:', {
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        isActive: updatedAdmin.isActive
      });
    } else {
      console.log('\n✅ Admin sudah aktif, tidak perlu perubahan.');
    }

    // Cek semua user lainnya
    console.log('\n📋 Cek status semua user:');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    allUsers.forEach(user => {
      console.log(`${user.name} (${user.email}) - Role: ${user.role} - Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
    });

  } catch (error) {
    console.error('❌ Error memperbaiki status admin:', error);
    console.log('\n💡 Tips:');
    console.log('1. Pastikan database sudah di-setup dengan benar');
    console.log('2. Jalankan: npm run seed untuk membuat data dummy');
    console.log('3. Cek file .env untuk koneksi database');
  } finally {
    await prisma.$disconnect();
    console.log('\n🏁 Selesai!');
  }
}

// Jalankan script
fixAdminStatus();