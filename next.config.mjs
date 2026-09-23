/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3000" },
      { protocol: "https", hostname: "learn.smktelkom-mlg.sch.id" },
    ],
  },
  // Matikan Turbopack — pakai webpack biasa yang lebih stabil
  // untuk menghindari RSC fetch error di Next.js 16
};

export default nextConfig;
