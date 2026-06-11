import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-build-manifest\.js$/,
    /middleware-manifest\.json$/,
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Terapkan ke semua halaman
        source: "/(.*)",
        headers: [
          {
            // Izinkan browser memuat resource dari Cloudinary tanpa blokir tracking prevention
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.tile.openstreetmap.org https://unpkg.com",
              "media-src 'self' blob:",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com https://res.cloudinary.com https://*.tile.openstreetmap.org https://nominatim.openstreetmap.org https://unpkg.com https://images.unsplash.com https://fonts.googleapis.com https://fonts.gstatic.com",
              "worker-src 'self'",
              "frame-src 'none'",
            ].join("; "),
          },
          {
            // Informasikan browser bahwa ini bukan tracker
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
