# 📧 Email Service Documentation - PantauKota

**Service:** Resend  
**File:** `src/lib/email.ts`  
**Status:** Production Ready ✅

---

## 🎯 Overview

Email service untuk mengirim notifikasi otomatis kepada user ketika admin mengubah status laporan mereka. Menggunakan Resend API dengan template HTML yang responsive dan sesuai design system Civic Clarity.

---

## 🔧 Setup

### 1. Daftar Resend Account

1. Kunjungi [https://resend.com](https://resend.com)
2. Sign up dengan email
3. Verifikasi email
4. Dapatkan API Key dari dashboard

### 2. Environment Variables

Tambahkan ke `.env`:

```bash
# Required
RESEND_API_KEY="re_your_api_key_here"

# Optional (Production)
RESEND_FROM_EMAIL="PantauKota <noreply@yourdomain.com>"

# Optional (Development)
RESEND_TEST_EMAIL="your-test-email@example.com"
```

### 3. Domain Verification (Production)

**Untuk production dengan domain sendiri:**

1. Login ke Resend dashboard
2. Go to **Domains** → **Add Domain**
3. Masukkan domain Anda (e.g., `pantaukota.com`)
4. Tambahkan DNS records yang diberikan:
   - SPF record
   - DKIM record
   - DMARC record (optional)
5. Verify domain
6. Update `RESEND_FROM_EMAIL`:
   ```bash
   RESEND_FROM_EMAIL="PantauKota <noreply@pantaukota.com>"
   ```

**Tanpa domain terverifikasi:**
- Hanya bisa kirim ke email yang terdaftar di Resend
- Gunakan `onboarding@resend.dev` sebagai sender
- Cocok untuk development/testing

---

## 📝 Usage

### Basic Usage

```typescript
import { kirimEmailNotifikasi } from '@/lib/email';

// Di API route atau server action
await kirimEmailNotifikasi(
  'user@example.com',      // Email tujuan
  'John Doe',              // Nama user
  'Jalan Rusak di Jl. X',  // Judul laporan
  'DIPROSES',              // Status baru
  'clxxx123456'            // ID laporan
);
```

### With Retry Logic (Recommended for Production)

```typescript
import { kirimEmailNotifikasiWithRetry } from '@/lib/email';

// Akan retry 3x jika gagal
const result = await kirimEmailNotifikasiWithRetry(
  'user@example.com',
  'John Doe',
  'Jalan Rusak di Jl. X',
  'DIPROSES',
  'clxxx123456',
  3,      // Max retries (optional, default: 3)
  1000    // Retry delay ms (optional, default: 1000)
);

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Email failed:', result.error);
}
```

### Fire-and-Forget (Current Implementation)

```typescript
// Di API route update status
// Tidak perlu await agar response cepat
kirimEmailNotifikasi(
  laporan.user.email,
  laporan.user.name,
  laporan.judul,
  newStatus,
  laporan.id
);

// Response langsung ke client tanpa tunggu email
return NextResponse.json({ success: true });
```

---

## 🎨 Email Template

Template mengikuti design system Civic Clarity:

### Features
- ✅ Responsive design (mobile & desktop)
- ✅ Civic Clarity colors (`#426464`, `#f7f9fb`)
- ✅ Rounded corners (`border-radius: 24px`)
- ✅ Ambient shadow
- ✅ XSS protection (HTML escaping)
- ✅ Direct link ke detail laporan
- ✅ Professional footer

### Preview

```
┌─────────────────────────────────┐
│        PantauKota               │
│   Pembaruan Status Laporan      │
├─────────────────────────────────┤
│                                 │
│ Halo John Doe,                  │
│                                 │
│ Status untuk laporan Anda yang  │
│ berjudul "Jalan Rusak" telah    │
│ diperbarui oleh Admin.          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Status Terbaru:             │ │
│ │ DIPROSES                    │ │
│ └─────────────────────────────┘ │
│                                 │
│   [Lihat Detail Laporan]        │
│                                 │
│ Terima kasih,                   │
│ Tim PantauKota                  │
└─────────────────────────────────┘
```

---

## 🔒 Security Features

### 1. Input Validation
- Email format validation
- Required fields check
- XSS prevention (HTML escaping)

### 2. Environment Validation
- API key check di startup
- Production mode validation
- Graceful degradation jika API key tidak ada

### 3. Error Handling
- Try-catch untuk semua operations
- Detailed error logging
- Return error status untuk monitoring

### 4. Development Safety
- Test email override di development
- Prevent accidental email ke user real
- Clear logging untuk debugging

---

## 📊 Monitoring & Logging

### Log Format

**Success:**
```
[Email] Successfully sent: {
  messageId: 'abc123',
  recipient: 'user@example.com',
  status: 'DIPROSES',
  laporanId: 'clxxx123',
  duration: '234ms'
}
```

**Error:**
```
[Email] Failed to send: {
  error: 'Invalid email address',
  recipient: 'invalid-email',
  laporanId: 'clxxx123',
  duration: '12ms'
}
```

**Retry:**
```
[Email] Retry 1/3 after 1000ms...
[Email] Succeeded on attempt 2/3
```

### Metrics to Monitor

1. **Success Rate**
   - Target: > 95%
   - Alert if < 90%

2. **Response Time**
   - Target: < 500ms
   - Alert if > 2s

3. **Retry Rate**
   - Target: < 5%
   - Alert if > 10%

4. **Error Types**
   - Invalid email
   - API key issues
   - Network timeouts
   - Rate limits

---

## 🚨 Troubleshooting

### Email Tidak Terkirim

**1. Check API Key**
```bash
# Verify API key exists
echo $RESEND_API_KEY

# Should start with "re_"
```

**2. Check Logs**
```bash
# Look for error messages
grep "\[Email\]" logs/app.log
```

**3. Check Resend Dashboard**
- Login ke [resend.com](https://resend.com)
- Go to **Logs**
- Check recent sends
- Look for errors

### Email Masuk Spam

**Solutions:**
1. Verify domain (SPF, DKIM, DMARC)
2. Warm up domain (start with low volume)
3. Avoid spam trigger words
4. Include unsubscribe link (optional)
5. Monitor bounce rate

### Rate Limiting

**Resend Limits:**
- Free: 100 emails/day
- Pro: 50,000 emails/month
- Enterprise: Custom

**If hit limit:**
1. Upgrade plan
2. Implement queue system
3. Batch notifications
4. Add rate limiting logic

---

## 🧪 Testing

### Development Testing

```typescript
// Set test email di .env
RESEND_TEST_EMAIL="your-email@example.com"

// Semua email akan dikirim ke test email
await kirimEmailNotifikasi(
  'any-user@example.com',  // Will be overridden
  'Test User',
  'Test Laporan',
  'DIPROSES',
  'test-id'
);

// Check your-email@example.com inbox
```

### Production Testing

```bash
# 1. Test dengan user real (staging)
# 2. Verify email received
# 3. Check formatting
# 4. Test link works
# 5. Monitor logs
```

### Load Testing

```typescript
// Send multiple emails
for (let i = 0; i < 10; i++) {
  await kirimEmailNotifikasi(
    `test${i}@example.com`,
    `User ${i}`,
    'Test Laporan',
    'DIPROSES',
    `test-${i}`
  );
}

// Monitor:
// - Success rate
// - Response time
// - Error rate
```

---

## 📈 Best Practices

### 1. Use Fire-and-Forget for User-Facing APIs
```typescript
// ✅ Good - Fast response
kirimEmailNotifikasi(...);  // No await
return NextResponse.json({ success: true });

// ❌ Bad - Slow response
await kirimEmailNotifikasi(...);  // Blocks response
return NextResponse.json({ success: true });
```

### 2. Use Retry for Critical Notifications
```typescript
// ✅ Good - Reliable
await kirimEmailNotifikasiWithRetry(...);

// ❌ Bad - May fail silently
await kirimEmailNotifikasi(...);
```

### 3. Log Everything
```typescript
// ✅ Good - Trackable
console.log('[Email] Sending to:', email);
const result = await kirimEmailNotifikasi(...);
console.log('[Email] Result:', result);

// ❌ Bad - No visibility
await kirimEmailNotifikasi(...);
```

### 4. Handle Errors Gracefully
```typescript
// ✅ Good - Graceful degradation
const result = await kirimEmailNotifikasi(...);
if (!result.success) {
  // Log error but don't fail the request
  console.error('[Email] Failed:', result.error);
}

// ❌ Bad - Crashes app
await kirimEmailNotifikasi(...);  // Throws on error
```

---

## 🔄 Migration Guide

### From Old Implementation

**Old:**
```typescript
await kirimEmailNotifikasi(email, name, title, status, id);
// Returns: void
```

**New:**
```typescript
const result = await kirimEmailNotifikasi(email, name, title, status, id);
// Returns: { success: boolean, messageId?: string, error?: string }

if (result.success) {
  console.log('Sent:', result.messageId);
}
```

**Breaking Changes:**
- None (backward compatible)
- Return type changed from `void` to `Promise<EmailResult>`
- Can safely ignore return value for fire-and-forget

---

## 📞 Support

**Issues:**
- Check logs first
- Verify environment variables
- Test with Resend dashboard
- Check Resend status page

**Resources:**
- [Resend Docs](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Resend Status](https://status.resend.com)

---

**Last Updated:** 12 Mei 2026  
**Version:** 2.1 (Supabase Auth / Cloudinary public id compatible)

## Maintenance Notes

- Email status notification remains fire-and-forget in report status APIs.
- Report images are not attached to email. Emails link back to the app detail page.
- If an email template later needs report images, generate display URLs with `getCloudinaryImageUrl()` instead of using raw `foto` / `fotoPenyelesaian` values.

