'use client';

import imageCompression from 'browser-image-compression';

interface UploadImageResponse {
  publicId?: string;
  url?: string;
}

export async function compressImageFile(file: File) {
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: file.type || 'image/jpeg',
  });
}

export async function uploadCompressedImage(file: File) {
  const compressedFile = await compressImageFile(file);
  const formData = new FormData();
  formData.append('file', compressedFile);

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Gagal mengunggah foto.');

  const data = (await res.json()) as UploadImageResponse;
  const value = data.publicId ?? data.url;
  if (!value) throw new Error('Response upload tidak valid.');

  return value;
}
