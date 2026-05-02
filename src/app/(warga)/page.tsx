import { redirect } from 'next/navigation';

export default function WargaRootPage() {
  // Redirect ke halaman beranda (dashboard warga)
  redirect('/beranda');
}
