import {
  Activity,
  FileText,
  LucideIcon,
  MapPin,
  ShieldCheck,
  UserPlus,
  Wrench,
} from "lucide-react";

export type LandingCard = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const FEATURES: LandingCard[] = [
  {
    icon: Activity,
    title: "Progres Real-time",
    description:
      "Pantau status laporan Anda mulai dari Menunggu, Diproses, hingga Selesai dengan transparan.",
  },
  {
    icon: ShieldCheck,
    title: "Tervalidasi & Aman",
    description:
      "Setiap laporan masuk ke admin terkait dan ditindak lanjuti secara resmi dengan privasi terjaga.",
  },
  {
    icon: MapPin,
    title: "Berbasis Lokasi",
    description:
      "Gunakan peta interaktif untuk menandai lokasi kejadian dengan akurasi GPS tinggi.",
  },
];

export const USAGE_STEPS: LandingCard[] = [
  {
    icon: UserPlus,
    title: "1. Daftar & Masuk",
    description:
      "Buat akun warga secara gratis untuk mulai menggunakan platform dan melacak laporan Anda.",
  },
  {
    icon: FileText,
    title: "2. Tulis Laporan",
    description:
      "Sertakan foto, pilih kategori, dan tandai lokasi secara akurat melalui peta interaktif.",
  },
  {
    icon: Wrench,
    title: "3. Pantau Perbaikan",
    description:
      "Laporan Anda akan diproses oleh dinas terkait. Dapatkan notifikasi untuk setiap pembaruan status.",
  },
];
