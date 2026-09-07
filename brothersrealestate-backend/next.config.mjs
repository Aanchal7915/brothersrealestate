/** @type {import('next').NextConfig} */
const nextConfig = {
  // API-only backend — no pages/UI, so we don't need image optimization,
  // React strict-mode UI concerns, etc. Keep this minimal.
  reactStrictMode: true,
};

export default nextConfig;
