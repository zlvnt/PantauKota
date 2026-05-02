// 📁 src/components/laporan/ImageGallery.tsx
// Gallery foto dengan lightbox sederhana — menggantikan placeholder

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

export default function ImageGallery({ images, alt = 'Foto laporan' }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="h-48 rounded-xl bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Tidak ada foto</p>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const prevLightbox = () =>
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);

  const nextLightbox = () =>
    setLightboxIndex((i) => (i + 1) % images.length);

  return (
    <>
      {/* Main image */}
      <div className="space-y-2">
        <div
          className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted cursor-zoom-in group"
          onClick={() => openLightbox(activeIndex)}
        >
          <Image
            src={images[activeIndex]}
            alt={`${alt} ${activeIndex + 1}`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 700px"
            priority={activeIndex === 0}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 drop-shadow-lg" />
          </div>
          {/* Counter */}
          {images.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {activeIndex + 1} / {images.length}
            </span>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIndex
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            type="button"
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={closeLightbox}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              type="button"
              className="absolute left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`${alt} ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              className="absolute right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Counter */}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
