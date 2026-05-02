import 'dotenv/config';
import { PrismaClient, Role, Status } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log('🌱 Memulai seeding database...');

  // ─────────────────────────────────────────
  // 1. KATEGORI LAPORAN
  // ─────────────────────────────────────────
  const kategoriData = [
    { nama: 'Jalan Rusak',         icon: 'AlertTriangle',  warna: '#e67e22' },
    { nama: 'Sampah Menumpuk',     icon: 'Trash2',         warna: '#e74c3c' },
    { nama: 'Lampu Jalan Mati',    icon: 'Lightbulb',      warna: '#f39c12' },
    { nama: 'Saluran Air Tersumbat', icon: 'Droplets',     warna: '#3498db' },
    { nama: 'Fasilitas Umum Rusak', icon: 'Building2',     warna: '#9b59b6' },
    { nama: 'Pohon Tumbang',       icon: 'TreePine',       warna: '#27ae60' },
  ];

  const kategoriList = await Promise.all(
    kategoriData.map((k) =>
      prisma.kategori.upsert({
        where: { nama: k.nama },
        update: {},
        create: k,
      })
    )
  );
  console.log(`✅ ${kategoriList.length} kategori dibuat`);

  // ─────────────────────────────────────────
  // 2. USERS (1 Admin, 3 Warga)
  // ─────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pantaukota.id' },
    update: { isActive: true },
    create: {
      name: 'Admin PantauKota',
      email: 'admin@pantaukota.id',
      password: passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const warga1 = await prisma.user.upsert({
    where: { email: 'budi@warga.id' },
    update: { isActive: true },
    create: {
      name: 'Budi Santoso',
      email: 'budi@warga.id',
      password: passwordHash,
      role: Role.WARGA,
      isActive: true,
    },
  });

  const warga2 = await prisma.user.upsert({
    where: { email: 'siti@warga.id' },
    update: { isActive: true },
    create: {
      name: 'Siti Rahayu',
      email: 'siti@warga.id',
      password: passwordHash,
      role: Role.WARGA,
      isActive: true,
    },
  });

  const warga3 = await prisma.user.upsert({
    where: { email: 'andi@warga.id' },
    update: { isActive: true },
    create: {
      name: 'Andi Wijaya',
      email: 'andi@warga.id',
      password: passwordHash,
      role: Role.WARGA,
      isActive: true,
    },
  });
  console.log('✅ 1 Admin + 3 Warga dibuat');

  // ─────────────────────────────────────────
  // 3. LAPORAN (tersebar di area Jakarta/Bandung)
  // ─────────────────────────────────────────
  const laporanData = [
    // ── Kota Bandung ──────────────────────────────────────────────────────────
    {
      judul: 'Jalan berlubang besar di depan Pasar Kosambi',
      deskripsi: 'Terdapat lubang besar di tengah jalan yang sangat berbahaya bagi pengendara, terutama saat malam hari. Sudah beberapa motor yang hampir jatuh dan satu kejadian jatuh ringan.',
      kategoriId: kategoriList[0].id,
      userId: warga1.id,
      latitude: -6.9218,
      longitude: 107.6166,
      alamat: 'Jl. Dewi Sartika, Pasar Kosambi, Kota Bandung',
      status: Status.MENUNGGU,
      voteCount: 24,
      foto: [
        'https://images.unsplash.com/photo-1617726284999-d37c830b9756?w=800',
        'https://images.unsplash.com/photo-1528297506728-9533d2ac3fa4?w=800',
      ],
    },
    {
      judul: 'Tumpukan sampah seminggu tidak diangkut di Braga',
      deskripsi: 'Sampah menumpuk di TPS sepanjang 10 meter di kawasan wisata Braga. Bau sangat menyengat dan mulai mengganggu wisatawan dan warga sekitar.',
      kategoriId: kategoriList[1].id,
      userId: warga2.id,
      latitude: -6.9147,
      longitude: 107.6082,
      alamat: 'Jl. Braga No. 45, Kota Bandung',
      status: Status.DIPROSES,
      voteCount: 41,
      foto: [
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
      ],
    },
    {
      judul: 'Lampu PJU padam di sepanjang Jl. Pasteur',
      deskripsi: 'Lampu penerangan jalan umum di sepanjang Jl. Pasteur sudah padam sejak 2 minggu. Jalan sangat gelap dan rawan kejahatan saat malam hari.',
      kategoriId: kategoriList[2].id,
      userId: warga3.id,
      latitude: -6.9037,
      longitude: 107.5877,
      alamat: 'Jl. Dr. Djunjunan (Pasteur), Kota Bandung',
      status: Status.SELESAI,
      voteCount: 18,
      foto: [
        'https://images.unsplash.com/photo-1565793893533-d36e9ca9e8b1?w=800',
      ],
      catatanAdmin: 'Perbaikan lampu PJU telah dilaksanakan oleh Dinas PU Kota Bandung pada tanggal 20 April 2026.',
      fotoPenyelesaian: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      selesaiAt: new Date('2026-04-20'),
    },
    {
      judul: 'Selokan tersumbat menyebabkan banjir di Cihampelas',
      deskripsi: 'Saluran air di depan pusat perbelanjaan Cihampelas Walk tersumbat sampah dan tanah. Setiap hujan deras air meluap ke jalan dan mengganggu lalu lintas.',
      kategoriId: kategoriList[3].id,
      userId: warga1.id,
      latitude: -6.9002,
      longitude: 107.5977,
      alamat: 'Jl. Cihampelas No. 160, Kota Bandung',
      status: Status.MENUNGGU,
      voteCount: 32,
      foto: [
        'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
      ],
    },
    // ── Kota Bandung (lanjutan) ───────────────────────────────────────────────
    {
      judul: 'Bangku taman roboh di Taman Balai Kota',
      deskripsi: 'Bangku taman di Taman Balai Kota Bandung sudah lapuk dan roboh. Berbahaya terutama untuk anak-anak dan lansia yang sering beristirahat di sini.',
      kategoriId: kategoriList[4].id,
      userId: warga2.id,
      latitude: -6.9175,
      longitude: 107.6191,
      alamat: 'Taman Balai Kota, Jl. Merdeka, Kota Bandung',
      status: Status.DIPROSES,
      voteCount: 15,
      foto: [
        'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800',
      ],
    },
    {
      judul: 'Pohon besar tumbang menutup Jl. RE Martadinata',
      deskripsi: 'Pohon trembesi besar tumbang akibat angin kencang. Menutup setengah badan jalan RE Martadinata dan mengganggu arus lalu lintas menuju pusat kota.',
      kategoriId: kategoriList[5].id,
      userId: warga3.id,
      latitude: -6.9065,
      longitude: 107.6138,
      alamat: 'Jl. RE Martadinata, Kota Bandung',
      status: Status.SELESAI,
      voteCount: 56,
      foto: [
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
        'https://images.unsplash.com/photo-1631811405378-0a2ecefe95d2?w=800',
      ],
      catatanAdmin: 'Pohon telah dipotong dan dibersihkan oleh tim Dinas Pertamanan Kota Bandung.',
      selesaiAt: new Date('2026-04-25'),
    },
    {
      judul: 'Aspal jalan mengelupas di Jl. Soekarno-Hatta pasca hujan',
      deskripsi: 'Lapisan aspal di Jl. Soekarno-Hatta mengelupas parah setelah hujan deras. Terdapat retakan besar sepanjang ±30 meter yang berbahaya bagi pengendara sepeda motor.',
      kategoriId: kategoriList[0].id,
      userId: warga1.id,
      latitude: -6.9482,
      longitude: 107.6531,
      alamat: 'Jl. Soekarno-Hatta, Kota Bandung',
      status: Status.MENUNGGU,
      voteCount: 9,
      foto: [
        'https://images.unsplash.com/photo-1612143332782-04e50f99f849?w=800',
      ],
    },
    {
      judul: 'Tempat sampah di depan Alun-alun Bandung rusak',
      deskripsi: 'Tempat sampah di depan Alun-alun Bandung sudah patah tutupnya. Sampah bertebaran kena angin dan mengganggu wisatawan serta warga yang melintas di Jl. Asia Afrika.',
      kategoriId: kategoriList[1].id,
      userId: warga2.id,
      latitude: -6.9214,
      longitude: 107.6096,
      alamat: 'Jl. Asia Afrika (depan Alun-alun), Kota Bandung',
      status: Status.MENUNGGU,
      voteCount: 7,
      foto: [
        'https://images.unsplash.com/photo-1558618047-f4e60d90e429?w=800',
      ],
    },
  ];

  // Hapus data lama (berurutan dari anak ke induk untuk menghindari foreign key error)
  await prisma.vote.deleteMany();
  await prisma.komentar.deleteMany();
  await prisma.laporan.deleteMany();

  const laporanList = await Promise.all(
    laporanData.map((l) =>
      prisma.laporan.create({ data: l })
    )
  );
  console.log(`✅ ${laporanList.length} laporan dummy dibuat`);

  // ─────────────────────────────────────────
  // 4. VOTE (beberapa warga vote laporan orang lain)
  // ─────────────────────────────────────────
  const voteData = [
    { userId: warga1.id, laporanId: laporanList[1].id },
    { userId: warga1.id, laporanId: laporanList[4].id },
    { userId: warga2.id, laporanId: laporanList[0].id },
    { userId: warga2.id, laporanId: laporanList[3].id },
    { userId: warga3.id, laporanId: laporanList[0].id },
    { userId: warga3.id, laporanId: laporanList[1].id },
    { userId: admin.id,  laporanId: laporanList[0].id },
  ];

  await prisma.vote.deleteMany();
  await Promise.all(
    voteData.map((v) =>
      prisma.vote.upsert({
        where: { userId_laporanId: v },
        update: {},
        create: v,
      })
    )
  );
  console.log(`✅ ${voteData.length} vote dummy dibuat`);

  console.log('\n🎉 Seeding selesai!');
  console.log('─────────────────────────────────────');
  console.log('Akun untuk testing:');
  console.log('  Admin  → admin@pantaukota.id / password123');
  console.log('  Warga  → budi@warga.id       / password123');
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seeding gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
