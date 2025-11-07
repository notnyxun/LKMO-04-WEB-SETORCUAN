import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev, // 🔹 Nonaktifkan PWA saat development
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

// Gabungkan config Next.js dengan PWA
export default withPWAConfig(nextConfig);
