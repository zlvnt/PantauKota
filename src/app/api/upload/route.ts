import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { validateUploadFile, handleApiError } from '@/lib/api-helpers';
import { MAX_FILE_SIZE_BYTES, ALLOWED_IMAGE_MIME_TYPES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 });
    }

    // Validasi file sebelum upload
    const validation = validateUploadFile(file, MAX_FILE_SIZE_BYTES, ALLOWED_IMAGE_MIME_TYPES);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join('. ') },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload ke Cloudinary tanpa eager transformation
    // agar secure_url langsung bisa diakses.
    // Optimasi kualitas diterapkan saat delivery via URL parameter.
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'pantaukota',
            resource_type: 'image',
          },
          (error, res) => {
            if (error || !res) reject(error);
            else resolve(res);
          }
        )
        .end(buffer);
    });


    return NextResponse.json({
      publicId: result.public_id,
      url: result.secure_url,
    });
  } catch (error) {
    return handleApiError(error, 'POST /upload');
  }
}
