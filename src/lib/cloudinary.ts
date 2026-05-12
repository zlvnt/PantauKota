type CloudinaryCrop = 'limit' | 'fill';

export interface CloudinaryImageOptions {
  width?: number;
  height?: number;
  crop?: CloudinaryCrop;
  gravity?: string;
}

const CLOUDINARY_HOST = 'res.cloudinary.com';

export const CLOUDINARY_DETAIL_IMAGE_OPTIONS = {
  width: 1200,
} satisfies CloudinaryImageOptions;

export const CLOUDINARY_THUMBNAIL_IMAGE_OPTIONS = {
  width: 320,
  height: 220,
  crop: 'fill',
  gravity: 'auto',
} satisfies CloudinaryImageOptions;

function getCloudName() {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
}

function stripExtension(publicId: string) {
  return publicId.replace(/\.[a-zA-Z0-9]+$/, '');
}

function parseCloudinaryPublicId(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname !== CLOUDINARY_HOST) return null;

    const segments = url.pathname.split('/').filter(Boolean);
    const uploadIndex = segments.indexOf('upload');
    if (uploadIndex === -1) return null;

    const afterUpload = segments.slice(uploadIndex + 1);
    const versionIndex = afterUpload.findIndex((segment) => /^v\d+$/.test(segment));
    const publicIdSegments =
      versionIndex >= 0 ? afterUpload.slice(versionIndex + 1) : afterUpload.filter((segment) => !segment.includes(','));

    if (publicIdSegments.length === 0) return null;

    return stripExtension(decodeURIComponent(publicIdSegments.join('/')));
  } catch {
    return null;
  }
}

function buildTransformation({ width, height, crop = 'limit', gravity }: CloudinaryImageOptions) {
  const resize = [`c_${crop}`];
  if (width) resize.push(`w_${width}`);
  if (height) resize.push(`h_${height}`);
  if (gravity) resize.push(`g_${gravity}`);

  return `${resize.join(',')}/f_auto,q_auto`;
}

function encodePublicId(publicId: string) {
  return publicId.split('/').map(encodeURIComponent).join('/');
}

export function getCloudinaryImageUrl(value: string | null | undefined, options: CloudinaryImageOptions = {}) {
  const source = value?.trim();
  if (!source) return '';

  const isUrl = /^https?:\/\//i.test(source);
  const publicId = isUrl ? parseCloudinaryPublicId(source) : source;

  if (isUrl && !publicId) return source;

  const cloudName = getCloudName();
  if (!cloudName) return source;

  const transformation = buildTransformation(options);
  const resolvedPublicId = publicId ?? source;
  return `https://${CLOUDINARY_HOST}/${cloudName}/image/upload/${transformation}/${encodePublicId(resolvedPublicId)}`;
}
