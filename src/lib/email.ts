import { Resend } from 'resend';

/**
 * Email Service untuk PantauKota
 * Menggunakan Resend untuk mengirim notifikasi email
 */

// ── Environment Validation ──────────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'PantauKota <onboarding@resend.dev>';

// Validate environment variables di startup
if (!RESEND_API_KEY && NODE_ENV === 'production') {
  console.error('[Email] CRITICAL: RESEND_API_KEY tidak diset di production!');
}

// Initialize Resend client
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// ── Types ───────────────────────────────────────────────────────────────────
interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ── Helper Functions ────────────────────────────────────────────────────────

/**
 * Validasi email address
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string untuk HTML (prevent XSS)
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Generate email HTML template
 */
function generateEmailTemplate(
  namaUser: string,
  judulLaporan: string,
  statusBaru: string,
  urlLaporan: string
): string {
  // Sanitize inputs
  const safeName = escapeHtml(namaUser);
  const safeTitle = escapeHtml(judulLaporan);
  const safeStatus = escapeHtml(statusBaru);

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pembaruan Status Laporan - PantauKota</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f9fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 16px;">
    <div style="background-color: #ffffff; border-radius: 24px; padding: 32px; box-shadow: 0 8px 30px rgba(42, 52, 57, 0.12);">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #426464; font-size: 28px; margin: 0; font-weight: 700;">PantauKota</h1>
        <p style="color: #677177; font-size: 14px; margin: 8px 0 0 0;">Pembaruan Status Laporan</p>
      </div>

      <!-- Greeting -->
      <h2 style="color: #2A3439; font-size: 20px; margin: 0 0 16px 0; font-weight: 600;">Halo ${safeName},</h2>
      
      <!-- Message -->
      <p style="color: #2A3439; line-height: 1.6; font-size: 16px; margin: 0 0 24px 0;">
        Status untuk laporan Anda yang berjudul <strong>"${safeTitle}"</strong> telah diperbarui oleh Admin.
      </p>
      
      <!-- Status Card -->
      <div style="background-color: #f0f4f7; padding: 20px; margin: 24px 0; border-radius: 16px; border-left: 4px solid #426464;">
        <p style="margin: 0; color: #677177; font-size: 14px; font-weight: 500;">Status Terbaru:</p>
        <p style="margin: 8px 0 0 0; color: #426464; font-size: 20px; font-weight: 700; letter-spacing: 0.02em;">${safeStatus}</p>
      </div>
      
      <!-- CTA -->
      <p style="color: #2A3439; line-height: 1.6; font-size: 16px; margin: 24px 0;">
        Silakan cek aplikasi PantauKota untuk melihat detail selengkapnya dan perkembangan laporan Anda.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${urlLaporan}" 
           style="background-color: #426464; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.2s;">
          Lihat Detail Laporan
        </a>
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e1e9ee;">
        <p style="color: #677177; font-size: 14px; margin: 0; line-height: 1.6;">
          Terima kasih telah menggunakan PantauKota.<br/>
          <strong style="color: #426464;">Tim PantauKota</strong>
        </p>
        <p style="color: #8a969c; font-size: 12px; margin: 16px 0 0 0; line-height: 1.5;">
          Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
        </p>
      </div>
    </div>
    
    <!-- Footer Text -->
    <p style="text-align: center; color: #8a969c; font-size: 12px; margin: 24px 0 0 0;">
      © ${new Date().getFullYear()} PantauKota. All rights reserved.
    </p>
  </div>
</body>
</html>
  `.trim();
}

// ── Main Email Function ─────────────────────────────────────────────────────

/**
 * Kirim email notifikasi perubahan status laporan
 * 
 * @param emailTujuan - Email penerima
 * @param namaUser - Nama user penerima
 * @param judulLaporan - Judul laporan
 * @param statusBaru - Status baru laporan
 * @param laporanId - ID laporan
 * @returns Promise<EmailResult>
 */
export async function kirimEmailNotifikasi(
  emailTujuan: string,
  namaUser: string,
  judulLaporan: string,
  statusBaru: string,
  laporanId: string
): Promise<EmailResult> {
  // ── Validation ────────────────────────────────────────────────────────────
  
  // Check if Resend is configured
  if (!resend) {
    const errorMsg = 'RESEND_API_KEY tidak diset. Email tidak dapat dikirim.';
    
    if (NODE_ENV === 'production') {
      console.error(`[Email] CRITICAL: ${errorMsg}`);
    } else {
      console.warn(`[Email] Warning: ${errorMsg} (Development mode)`);
    }
    
    return {
      success: false,
      error: errorMsg
    };
  }

  // Validate email address
  if (!isValidEmail(emailTujuan)) {
    console.error(`[Email] Invalid email address: ${emailTujuan}`);
    return {
      success: false,
      error: 'Invalid email address'
    };
  }

  // Validate required fields
  if (!namaUser || !judulLaporan || !statusBaru || !laporanId) {
    console.error('[Email] Missing required fields');
    return {
      success: false,
      error: 'Missing required fields'
    };
  }

  // ── Prepare Email Data ────────────────────────────────────────────────────
  
  const urlLaporan = `${BASE_URL}/laporan/${laporanId}`;
  
  // Development mode: Override recipient untuk testing
  // PENTING: Hapus atau comment ini di production dengan domain terverifikasi
  const emailPenerima = NODE_ENV === 'production' 
    ? emailTujuan 
    : process.env.RESEND_TEST_EMAIL || emailTujuan;

  if (NODE_ENV !== 'production' && emailPenerima !== emailTujuan) {
    console.log(`[Email] Development mode: Redirecting email from ${emailTujuan} to ${emailPenerima}`);
  }

  // ── Send Email ────────────────────────────────────────────────────────────
  
  try {
    const startTime = Date.now();
    
    // Add timeout wrapper (8 seconds - lebih cepat dari default)
    const sendEmailWithTimeout = Promise.race([
      resend.emails.send({
        from: FROM_EMAIL,
        to: emailPenerima,
        subject: `Pembaruan Status Laporan: ${statusBaru}`,
        html: generateEmailTemplate(namaUser, judulLaporan, statusBaru, urlLaporan)
        // Tags removed - dapat menyebabkan network issues
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout after 8s')), 8000)
      )
    ]);

    const { data, error } = await sendEmailWithTimeout;

    const duration = Date.now() - startTime;

    if (error) {
      console.error('[Email] Failed to send:', {
        error: error.message,
        recipient: emailTujuan,
        laporanId,
        duration: `${duration}ms`
      });
      
      return {
        success: false,
        error: error.message
      };
    }

    console.log('[Email] Successfully sent:', {
      messageId: data?.id,
      recipient: emailTujuan,
      status: statusBaru,
      laporanId,
      duration: `${duration}ms`
    });

    return {
      success: true,
      messageId: data?.id
    };

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    // Log dengan detail untuk debugging network issues
    console.error('[Email] Exception during send:', {
      error: errorMessage,
      recipient: emailTujuan,
      laporanId,
      isTimeout: errorMessage.includes('timeout'),
      isNetworkError: errorMessage.includes('fetch') || errorMessage.includes('network'),
      stack: err instanceof Error ? err.stack : undefined
    });

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Kirim email notifikasi dengan retry logic
 * Untuk production use case yang memerlukan reliability tinggi
 * 
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @param retryDelay - Delay between retries in ms (default: 1000)
 */
export async function kirimEmailNotifikasiWithRetry(
  emailTujuan: string,
  namaUser: string,
  judulLaporan: string,
  statusBaru: string,
  laporanId: string,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<EmailResult> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await kirimEmailNotifikasi(
      emailTujuan,
      namaUser,
      judulLaporan,
      statusBaru,
      laporanId
    );

    if (result.success) {
      if (attempt > 1) {
        console.log(`[Email] Succeeded on attempt ${attempt}/${maxRetries}`);
      }
      return result;
    }

    lastError = result.error;

    if (attempt < maxRetries) {
      console.log(`[Email] Retry ${attempt}/${maxRetries} after ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  console.error(`[Email] Failed after ${maxRetries} attempts`);
  return {
    success: false,
    error: lastError || 'Failed after multiple retries'
  };
}
