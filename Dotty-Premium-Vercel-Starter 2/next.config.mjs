/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://kiwify.com.br https://*.kiwify.com.br" },
        ],
      },
    ];
  },
};
export default nextConfig;
