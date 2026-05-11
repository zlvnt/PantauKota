import { Resend } from 'resend';

// Mencegah crash jika API key belum ada (misal di local)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function kirimEmailNotifikasi(
  emailTujuan: string,
  namaUser: string,
  judulLaporan: string,
  statusBaru: string,
  laporanId: string
) {
  if (!resend) {
    console.warn("[Email Warning] RESEND_API_KEY belum diset. Mengabaikan pengiriman email ke:", emailTujuan);
    return;
  }

  // Menggunakan NEXTAUTH_URL sebagai base URL (fallback ke localhost jika tidak ada)
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const urlLaporan = `${baseUrl}/laporan/${laporanId}`;

  // OVERRIDE UNTUK TESTING:
  // Akun Resend gratis (tanpa domain terverifikasi) hanya bisa mengirim ke email pendaftar.
  // Jika di tahap development, kita paksa kirim ke emailmu. Nanti hapus ini jika sudah punya domain.
  const emailPenerima = process.env.NODE_ENV === 'production' 
    ? emailTujuan 
    : 'zikrihilmi15@gmail.com';

  try {
    const { data, error } = await resend.emails.send({
      from: 'PantauKota <onboarding@resend.dev>', // Ubah dengan domain terverifikasi saat ke production
      to: emailPenerima,
      subject: 'Pembaruan Status Laporan Anda di PantauKota',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background-color: #f7f9fb; border-radius: 24px;">
          <h2 style="color: #2A3439; font-family: 'Manrope', sans-serif; font-size: 24px; margin-top: 0;">Halo ${namaUser},</h2>
          <p style="color: #2A3439; line-height: 1.6; font-size: 16px;">Status untuk laporan Anda yang berjudul <strong>"${judulLaporan}"</strong> telah diperbarui oleh Admin.</p>
          
          <div style="background-color: #ffffff; padding: 24px; margin: 24px 0; border-radius: 16px; box-shadow: 0 8px 30px rgba(42, 52, 57, 0.12);">
            <p style="margin: 0; color: #2A3439; font-size: 16px;">Status saat ini: <strong style="color: #426464; font-size: 18px; display: block; margin-top: 8px; letter-spacing: 0.02em;">${statusBaru}</strong></p>
          </div>
          
          <p style="color: #2A3439; line-height: 1.6; font-size: 16px;">Silakan cek aplikasi PantauKota untuk melihat detail selengkapnya dan perkembangan laporan Anda.</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${urlLaporan}" style="background-color: #426464; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 16px; display: inline-block;">
              Lihat Detail Laporan
            </a>
          </div>

          <div style="margin-top: 40px;">
            <p style="color: #6B9A9A; font-size: 14px; margin: 0; line-height: 1.6;">Terima kasih,<br/><strong>Tim PantauKota</strong></p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error("[Email Error] Gagal mengirim email:", error);
    } else {
      console.log("[Email Success] Email terkirim ke:", emailTujuan, "ID:", data?.id);
    }
  } catch (err) {
    console.error("[Email Exception] Kesalahan sistem saat pengiriman email:", err);
  }
}
