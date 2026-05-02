'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { AlertCircle, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Impor dinamis untuk menghindari error 'window is not defined' pada Leaflet
const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker'),
  { ssr: false, loading: () => <div className="h-[320px] bg-surface-container-low rounded-[0.375rem] animate-pulse flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div> }
);

const formSchema = z.object({
  judul: z.string().min(5, 'Judul minimal 5 karakter'),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  kategoriId: z.string().min(1, 'Kategori harus dipilih'),
  lokasi: z.object({
    latitude: z.number(),
    longitude: z.number(),
    alamat: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Kategori {
  id: string;
  nama: string;
  icon: string | null;
  warna: string | null;
}

export default function BuatLaporanPage() {
  const router = useRouter();
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [loadingKategori, setLoadingKategori] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    async function fetchKategori() {
      try {
        const res = await fetch('/api/kategori');
        if (res.ok) {
          const data = await res.json();
          setKategoriList(data);
        }
      } catch (error) {
        console.error('Gagal mengambil kategori', error);
      } finally {
        setLoadingKategori(false);
      }
    }
    fetchKategori();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        judul: data.judul,
        deskripsi: data.deskripsi,
        kategoriId: data.kategoriId,
        latitude: data.lokasi.latitude,
        longitude: data.lokasi.longitude,
        alamat: data.lokasi.alamat,
        foto: [], // Belum diimplementasikan Cloudinary
      };

      const res = await fetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal membuat laporan');
      }

      // Berhasil
      router.push('/beranda');
      router.refresh(); // Memastikan data baru ter-fetch di beranda
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 pt-6">
      <div className="space-y-2">
        <h1 className="text-display-md font-bold font-manrope">Buat Laporan</h1>
        <p className="text-muted-foreground text-sm">
          Laporkan masalah lingkungan di sekitar Anda agar segera ditindaklanjuti.
        </p>
      </div>

      {submitError && (
        <div className="bg-error/10 border border-error/20 rounded-[0.375rem] p-4 flex items-start gap-3 text-error text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.5} />
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Judul Laporan */}
        <div className="space-y-2">
          <label htmlFor="judul" className="text-label-sm tracking-widest uppercase text-muted-foreground font-semibold">
            Judul Laporan
          </label>
          <input
            id="judul"
            type="text"
            placeholder="Contoh: Pohon Tumbang di Jl. Sudirman"
            className={`w-full px-4 py-3 bg-surface-container-low rounded-[0.375rem] border ${
              errors.judul ? 'border-error' : 'border-outline-variant/15 focus:border-primary'
            } outline-none transition-colors duration-200 text-on-surface`}
            {...register('judul')}
          />
          {errors.judul && (
            <p className="text-xs text-error">{errors.judul.message}</p>
          )}
        </div>

        {/* Kategori */}
        <div className="space-y-2">
          <label htmlFor="kategoriId" className="text-label-sm tracking-widest uppercase text-muted-foreground font-semibold">
            Kategori
          </label>
          <div className="relative">
            <select
              id="kategoriId"
              className={`w-full px-4 py-3 bg-surface-container-low rounded-[0.375rem] border ${
                errors.kategoriId ? 'border-error' : 'border-outline-variant/15 focus:border-primary'
              } outline-none transition-colors duration-200 text-on-surface appearance-none`}
              {...register('kategoriId')}
              disabled={loadingKategori}
            >
              <option value="">Pilih Kategori</option>
              {kategoriList.map((kat) => (
                <option key={kat.id} value={kat.id}>
                  {kat.icon} {kat.nama}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              {loadingKategori ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              )}
            </div>
          </div>
          {errors.kategoriId && (
            <p className="text-xs text-error">{errors.kategoriId.message}</p>
          )}
        </div>

        {/* Deskripsi */}
        <div className="space-y-2">
          <label htmlFor="deskripsi" className="text-label-sm tracking-widest uppercase text-muted-foreground font-semibold">
            Deskripsi Laporan
          </label>
          <textarea
            id="deskripsi"
            rows={5}
            placeholder="Jelaskan detail masalah, kondisi, dan dampaknya bagi lingkungan..."
            className={`w-full px-4 py-3 bg-surface-container-low rounded-[0.375rem] border ${
              errors.deskripsi ? 'border-error' : 'border-outline-variant/15 focus:border-primary'
            } outline-none transition-colors duration-200 text-on-surface resize-y leading-[1.6]`}
            {...register('deskripsi')}
          />
          {errors.deskripsi && (
            <p className="text-xs text-error">{errors.deskripsi.message}</p>
          )}
        </div>

        {/* Lokasi (Peta) */}
        <div className="space-y-2">
          <label className="text-label-sm tracking-widest uppercase text-muted-foreground font-semibold">
            Lokasi Kejadian
          </label>
          <Controller
            control={control}
            name="lokasi"
            render={({ field }) => (
              <LocationPicker
                value={field.value || null}
                onChange={field.onChange}
              />
            )}
          />
          {errors.lokasi && (
            <p className="text-xs text-error">{errors.lokasi.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-surface-container-low">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                Menyimpan Laporan...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" strokeWidth={2} />
                Kirim Laporan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
