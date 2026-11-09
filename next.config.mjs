/** @type {import('next').NextConfig} */
// 서버 주소는 TEAMSPACE_API_URL 로 바꿀 수 있고, 브라우저는 /api 로만 부른다
const API_URL = (process.env.TEAMSPACE_API_URL || "https://native-teamspace.https.gsmsv.site").replace(/\/$/, "");

const nextConfig = {
  // 값이 없어도 빈 문자열로 고정해야 일반 빌드에서 가짜 서버 코드가 통째로 빠진다
  env: { NEXT_PUBLIC_DEMO: process.env.NEXT_PUBLIC_DEMO ?? "" },
  images: { unoptimized: true },
  devIndicators: false,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
