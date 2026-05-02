import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Konfigurasi Cloudinary (pastikan .env sudah diisi dengan benar)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // Auth check — hanya user yang login boleh upload
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login terlebih dahulu' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Tidak ada file yang dikirim' }, { status: 400 });
    }

    // Validasi: max 5 foto, max 5MB per foto
    if (files.length > 5) {
      return NextResponse.json({ error: 'Maksimal 5 foto' }, { status: 400 });
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipe file tidak didukung: ${file.type}. Gunakan JPG, PNG, atau WebP.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} melebihi batas 5MB` },
          { status: 400 }
        );
      }
    }

    // Upload semua foto ke Cloudinary menggunakan stream (Lebih stabil & hemat memori)
    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'pantaukota/laporan',
            resource_type: 'image',
            // Transformasi: resize max 1200px, quality auto
            transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
          },
          (error, result) => {
            if (error) {
              console.error('[Cloudinary Upload Error]:', error);
              reject(error);
            } else {
              resolve(result!.secure_url);
            }
          }
        );

        // Eksekusi stream
        uploadStream.end(buffer);
      });
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls }, { status: 200 });

  } catch (error: any) {
    // Menangkap error aslinya biar kelihatan di terminal VS Code
    console.error('[API /upload POST] Error fatal:', error);
    
    return NextResponse.json(
      { error: error?.message || 'Gagal mengupload foto ke server' }, 
      { status: 500 }
    );
  }
}