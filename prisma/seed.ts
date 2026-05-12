import 'dotenv/config';
import { PrismaClient, Role, Status } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL atau DIRECT_URL belum diset.');
}

const pool = new Pool({ connectionString: databaseUrl, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

async function resetDummyData() {
  await prisma.$transaction([
    prisma.vote.deleteMany(),
    prisma.komentar.deleteMany(),
    prisma.notifikasi.deleteMany(),
    prisma.laporan.deleteMany(),
  ]);
}

async function ensureSupabaseAuthUser(
  supabase: SupabaseClient | null,
  {
    email,
    password,
    name,
    role,
  }: {
    email: string;
    password: string;
    name: string;
    role: Role;
  }
) {
  if (!supabase) return;

  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    throw listError;
  }

  const existing = listData.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (error) throw error;
    return;
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });

  if (error) throw error;
}

async function syncSupabaseAuthUsers() {
  if (!supabaseAdmin) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY belum diset. Akun Supabase Auth tidak dibuat otomatis.');
    return false;
  }

  if (supabaseServiceRoleKey?.startsWith('sb_publishable_')) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY berisi publishable key. Gunakan service_role/secret key, bukan publishable key.');
    return false;
  }

  try {
    await Promise.all([
      ensureSupabaseAuthUser(supabaseAdmin, {
        email: 'admin@pantaukota.id',
        password: 'password123',
        name: 'Admin PantauKota',
        role: Role.ADMIN,
      }),
      ensureSupabaseAuthUser(supabaseAdmin, {
        email: 'budi@warga.id',
        password: 'password123',
        name: 'Budi Santoso',
        role: Role.WARGA,
      }),
      ensureSupabaseAuthUser(supabaseAdmin, {
        email: 'siti@warga.id',
        password: 'password123',
        name: 'Siti Rahayu',
        role: Role.WARGA,
      }),
      ensureSupabaseAuthUser(supabaseAdmin, {
        email: 'dewi@warga.id',
        password: 'password123',
        name: 'Dewi Anggraini',
        role: Role.WARGA,
      }),
    ]);

    console.log('4 akun Supabase Auth siap digunakan');
    return true;
  } catch (error) {
    console.warn('Sinkronisasi Supabase Auth dilewati karena service role key tidak valid atau tidak punya akses admin.');
    console.warn('Gunakan SUPABASE_SERVICE_ROLE_KEY dari Supabase Dashboard, bukan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
    return false;
  }
}

async function main() {
  console.log('Memulai seeding database PantauKota...');

  const kategoriData = [
    { nama: 'Jalan Rusak', icon: 'AlertTriangle', warna: '#e67e22' },
    { nama: 'Sampah Menumpuk', icon: 'Trash2', warna: '#e74c3c' },
    { nama: 'Lampu Jalan Mati', icon: 'Lightbulb', warna: '#f39c12' },
    { nama: 'Saluran Air Tersumbat', icon: 'Droplets', warna: '#3498db' },
    { nama: 'Fasilitas Umum Rusak', icon: 'Building2', warna: '#9b59b6' },
    { nama: 'Pohon Tumbang', icon: 'TreePine', warna: '#27ae60' },
  ];

  const kategoriList = await Promise.all(
    kategoriData.map((kategori) =>
      prisma.kategori.upsert({
        where: { nama: kategori.nama },
        update: {
          icon: kategori.icon,
          warna: kategori.warna,
          isActive: true,
        },
        create: {
          ...kategori,
          isActive: true,
        },
      })
    )
  );
  console.log(`${kategoriList.length} kategori siap digunakan`);

  const authSynced = await syncSupabaseAuthUsers();

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pantaukota.id' },
    update: {
      name: 'Admin PantauKota',
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      name: 'Admin PantauKota',
      email: 'admin@pantaukota.id',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const warga1 = await prisma.user.upsert({
    where: { email: 'budi@warga.id' },
    update: {
      name: 'Budi Santoso',
      role: Role.WARGA,
      isActive: true,
    },
    create: {
      name: 'Budi Santoso',
      email: 'budi@warga.id',
      role: Role.WARGA,
      isActive: true,
    },
  });

  const warga2 = await prisma.user.upsert({
    where: { email: 'siti@warga.id' },
    update: {
      name: 'Siti Rahayu',
      role: Role.WARGA,
      isActive: true,
    },
    create: {
      name: 'Siti Rahayu',
      email: 'siti@warga.id',
      role: Role.WARGA,
      isActive: true,
    },
  });

  const warga3 = await prisma.user.upsert({
    where: { email: 'dewi@warga.id' },
    update: {
      name: 'Dewi Anggraini',
      role: Role.WARGA,
      isActive: true,
    },
    create: {
      name: 'Dewi Anggraini',
      email: 'dewi@warga.id',
      role: Role.WARGA,
      isActive: true,
    },
  });

  await prisma.user.deleteMany({
    where: { email: 'andi@warga.id' },
  });

  console.log('1 Admin dan 3 Warga siap digunakan');

  await resetDummyData();

  const now = new Date();
  const selesaiAt = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  const laporanData = [
    {
      judul: 'Jalan berlubang besar di depan Pasar Kosambi',
      deskripsi:
        'Terdapat lubang besar di tengah jalan yang sangat berbahaya bagi pengendara, terutama saat malam hari. Sudah beberapa motor yang hampir jatuh dan satu kejadian jatuh ringan.',
      kategoriId: kategoriList[0].id,
      userId: warga1.id,
      latitude: -6.9218,
      longitude: 107.6166,
      alamat: 'Jl. Dewi Sartika, Pasar Kosambi, Kota Bandung',
      status: Status.MENUNGGU,
      voteCount: 0,
      prioritas: true,
      foto: [
        'https://images.unsplash.com/photo-1617726284999-d37c830b9756?w=800',
        'https://images.unsplash.com/photo-1528297506728-9533d2ac3fa4?w=800',
      ],
    },
    {
      judul: 'Tumpukan sampah seminggu tidak diangkut di Braga',
      deskripsi:
        'Sampah menumpuk di TPS sepanjang 10 meter di kawasan wisata Braga. Bau sangat menyengat dan mulai mengganggu wisatawan dan warga sekitar.',
      kategoriId: kategoriList[1].id,
      userId: warga2.id,
      latitude: -6.9147,
      longitude: 107.6082,
      alamat: 'Jl. Braga No. 45, Kota Bandung',
      status: Status.DIPROSES,
      voteCount: 0,
      foto: [
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
      ],
    },
    {
      judul: 'Selokan tersumbat menyebabkan banjir di Cihampelas',
      deskripsi:
        'Saluran air di depan pusat perbelanjaan Cihampelas Walk tersumbat sampah dan tanah. Setiap hujan deras air meluap ke jalan dan mengganggu lalu lintas.',
      kategoriId: kategoriList[3].id,
      userId: warga1.id,
      latitude: -6.9002,
      longitude: 107.5977,
      alamat: 'Jl. Cihampelas No. 160, Kota Bandung',
      status: Status.MENUNGGU,
      voteCount: 0,
      foto: ['https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800'],
    },
    {
      judul: 'Bangku taman roboh di Taman Balai Kota',
      deskripsi:
        'Bangku taman di Taman Balai Kota Bandung sudah lapuk dan roboh. Berbahaya terutama untuk anak-anak dan lansia yang sering beristirahat di sini.',
      kategoriId: kategoriList[4].id,
      userId: warga2.id,
      latitude: -6.9175,
      longitude: 107.6191,
      alamat: 'Taman Balai Kota, Jl. Merdeka, Kota Bandung',
      status: Status.SELESAI,
      voteCount: 0,
      selesaiAt,
      catatanAdmin: 'Perbaikan bangku taman telah selesai dilakukan oleh petugas.',
      fotoPenyelesaian: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800',
      foto: ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800'],
    },
    {
      judul: 'Aspal jalan mengelupas di Jl. Soekarno-Hatta pasca hujan',
      deskripsi:
        'Lapisan aspal di Jl. Soekarno-Hatta mengelupas parah setelah hujan deras. Terdapat retakan besar sepanjang sekitar 30 meter yang berbahaya bagi pengendara sepeda motor.',
      kategoriId: kategoriList[0].id,
      userId: warga1.id,
      latitude: -6.9482,
      longitude: 107.6531,
      alamat: 'Jl. Soekarno-Hatta, Kota Bandung',
      status: Status.MENUNGGU,
      voteCount: 0,
      foto: ['https://images.unsplash.com/photo-1612143332782-04e50f99f849?w=800'],
    },
    {
      judul: 'Tempat sampah di depan Alun-alun Bandung rusak',
      deskripsi:
        'Tempat sampah di depan Alun-alun Bandung sudah patah tutupnya. Sampah bertebaran kena angin dan mengganggu wisatawan serta warga yang melintas di Jl. Asia Afrika.',
      kategoriId: kategoriList[1].id,
      userId: warga2.id,
      latitude: -6.9214,
      longitude: 107.6096,
      alamat: 'Jl. Asia Afrika, depan Alun-alun, Kota Bandung',
      status: Status.MENUNGGU,
      voteCount: 0,
      foto: ['https://images.unsplash.com/photo-1558618047-f4e60d90e429?w=800'],
    },
  ];

  const laporanList = await Promise.all(
    laporanData.map((laporan) => prisma.laporan.create({ data: laporan }))
  );
  console.log(`${laporanList.length} laporan dummy dibuat`);

  const voteData = [
    { userId: warga2.id, laporanId: laporanList[0].id },
    { userId: warga3.id, laporanId: laporanList[0].id },
    { userId: admin.id, laporanId: laporanList[0].id },
    { userId: warga1.id, laporanId: laporanList[1].id },
    { userId: warga3.id, laporanId: laporanList[1].id },
    { userId: warga2.id, laporanId: laporanList[2].id },
    { userId: warga1.id, laporanId: laporanList[3].id },
    { userId: warga3.id, laporanId: laporanList[4].id },
  ];

  await prisma.vote.createMany({ data: voteData, skipDuplicates: true });

  const voteCounts = await prisma.vote.groupBy({
    by: ['laporanId'],
    _count: { laporanId: true },
  });

  await Promise.all(
    voteCounts.map((item) =>
      prisma.laporan.update({
        where: { id: item.laporanId },
        data: { voteCount: item._count.laporanId },
      })
    )
  );
  console.log(`${voteData.length} vote dummy dibuat`);

  await prisma.komentar.createMany({
    data: [
      {
        userId: warga2.id,
        laporanId: laporanList[0].id,
        isi: 'Saya juga sering lewat sini, lubangnya memang berbahaya.',
      },
      {
        userId: admin.id,
        laporanId: laporanList[1].id,
        isi: 'Laporan sudah diteruskan ke petugas lapangan.',
      },
      {
        userId: warga1.id,
        laporanId: laporanList[3].id,
        isi: 'Terima kasih, fasilitas sudah bisa digunakan kembali.',
      },
    ],
  });
  console.log('3 komentar dummy dibuat');

  await prisma.notifikasi.createMany({
    data: [
      {
        userId: warga2.id,
        judul: 'Status laporan diperbarui',
        pesan: 'Laporan "Tumpukan sampah seminggu tidak diangkut di Braga" kini berstatus: Diproses.',
        laporanId: laporanList[1].id,
      },
      {
        userId: warga2.id,
        judul: 'Laporan selesai',
        pesan: 'Laporan "Bangku taman roboh di Taman Balai Kota" telah diselesaikan.',
        laporanId: laporanList[3].id,
      },
    ],
  });
  console.log('2 notifikasi dummy dibuat');

  console.log('');
  console.log('Seeding selesai.');
  console.log('Akun testing:');
  console.log('  Admin: admin@pantaukota.id / password123');
  console.log('  Warga: budi@warga.id / password123');
  console.log('  Warga: siti@warga.id / password123');
  console.log('  Warga: dewi@warga.id / password123');
  if (!authSynced) {
    console.log('');
    console.log('Catatan: akun di tabel User sudah dibuat, tetapi akun Supabase Auth belum tersinkron.');
    console.log('Perbaiki SUPABASE_SERVICE_ROLE_KEY lalu jalankan npm run seed lagi, atau buat akun Auth manual di Supabase Dashboard.');
  }
}

main()
  .catch((error) => {
    console.error('Seeding gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
