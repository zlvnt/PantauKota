// 📁 src/components/laporan/LaporanForm.tsx
// Form buat laporan — menggantikan placeholder yang ada sekarang
// Menggunakan: react-hook-form + zod + LocationPicker + FotoUploader

'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2, SendHorizonal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import FotoUploader from '@/components/laporan/FotoUploader';
import { cn } from '@/lib/utils';

// Dynamic import LocationPicker untuk hindari SSR error (leaflet butuh window)
const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 rounded-xl bg-muted animate-pulse flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

// ─── Schema Validasi ──────────────────────────────────────────────────────────
const LaporanSchema = z.object({
  judul: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(100, 'Judul maksimal 100 karakter'),
  deskripsi: z
    .string()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(2000, 'Deskripsi maksimal 2000 karakter'),
  kategoriId: z.string().min(1, 'Pilih kategori laporan'),
  foto: z
    .array(z.string().url())
    .min(1, 'Upload minimal 1 foto')
    .max(5, 'Maksimal 5 foto'),
  latitude: z.number({ error: 'Pilih lokasi di peta' }),
  longitude: z.number({ error: 'Pilih lokasi di peta' }),
  alamat: z.string().optional(),
});

type LaporanFormValues = z.infer<typeof LaporanSchema>;

// ─── Tipe kategori ────────────────────────────────────────────────────────────
interface Kategori {
  id: string;
  nama: string;
  icon: string | null;
}

// ─── Helper: Label + Error Field ─────────────────────────────────────────────
function FieldWrapper({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function LaporanForm() {
  const router = useRouter();
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LaporanFormValues>({
    resolver: zodResolver(LaporanSchema),
    defaultValues: {
      judul: '',
      deskripsi: '',
      kategoriId: '',
      foto: [],
      alamat: '',
    },
  });

  // Fetch kategori dari API
  useEffect(() => {
    fetch('/api/kategori')
      .then((r) => r.json())
      .then((data) => setKategoriList(data))
      .catch(() => console.error('Gagal fetch kategori'));
  }, []);

  const onSubmit = async (values: LaporanFormValues) => {
    setSubmitError(null);
    try {
      const res = await fetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Gagal membuat laporan');
      }

      // Redirect ke halaman detail setelah berhasil
      router.push(`/laporan/${data.id}`);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Judul */}
      <FieldWrapper label="Judul Laporan" error={errors.judul?.message} required>
        <input
          {...register('judul')}
          placeholder="Contoh: Jalan berlubang di depan SDN 01"
          className={cn(
            'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'transition-colors',
            errors.judul && 'border-destructive focus:ring-destructive/30'
          )}
        />
      </FieldWrapper>

      {/* Kategori */}
      <FieldWrapper label="Kategori" error={errors.kategoriId?.message} required>
        <select
          {...register('kategoriId')}
          className={cn(
            'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'transition-colors',
            errors.kategoriId && 'border-destructive focus:ring-destructive/30'
          )}
        >
          <option value="">-- Pilih kategori --</option>
          {kategoriList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.icon ? `${k.icon} ` : ''}{k.nama}
            </option>
          ))}
        </select>
      </FieldWrapper>

      {/* Deskripsi */}
      <FieldWrapper label="Deskripsi" error={errors.deskripsi?.message} required>
        <textarea
          {...register('deskripsi')}
          rows={4}
          placeholder="Jelaskan masalah secara detail: lokasi persisnya, dampak yang ditimbulkan, sudah berapa lama, dll."
          className={cn(
            'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'transition-colors resize-none',
            errors.deskripsi && 'border-destructive focus:ring-destructive/30'
          )}
        />
      </FieldWrapper>

      {/* Upload Foto */}
      <FieldWrapper label="Foto Bukti" error={errors.foto?.message} required>
        <Controller
          name="foto"
          control={control}
          render={({ field }) => (
            <FotoUploader
              value={field.value}
              onChange={field.onChange}
              maxFiles={5}
            />
          )}
        />
      </FieldWrapper>

      {/* Lokasi */}
      <FieldWrapper
        label="Lokasi Kejadian"
        error={errors.latitude?.message ?? errors.longitude?.message}
        required
      >
        <p className="text-xs text-muted-foreground mb-2">
          Klik peta untuk memilih lokasi, atau tekan &quot;Lokasi Saya&quot; untuk deteksi otomatis.
        </p>
        <LocationPicker
          value={
            watch('latitude') != null && watch('longitude') != null
              ? { latitude: watch('latitude'), longitude: watch('longitude') }
              : null
          }
          onChange={({ latitude, longitude, alamat }) => {
            setValue('latitude', latitude, { shouldValidate: true });
            setValue('longitude', longitude, { shouldValidate: true });
            if (alamat) setValue('alamat', alamat);
          }}
        />
        {/* Tampilkan alamat hasil reverse geocode */}
        {watch('alamat') && (
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            📍 {watch('alamat')}
          </p>
        )}
      </FieldWrapper>

      {/* Submit error */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {submitError}
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Mengirim Laporan...
          </>
        ) : (
          <>
            <SendHorizonal className="w-4 h-4" />
            Kirim Laporan
          </>
        )}
      </Button>
    </form>
  );
}
