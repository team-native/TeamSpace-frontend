/** @type {import('next').NextConfig} */
// 서버 주소는 TEAMSPACE_API_URL 로 바꿀 수 있고, 브라우저는 /api 로만 부른다
const API_URL = (process.env.TEAMSPACE_API_URL || "https://native-teamspace.https.gsmsv.site").replace(/\/$/, "");

const nextConfig = {
  images: { unoptimized: true },
  devIndicators: false,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
