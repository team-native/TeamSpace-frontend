import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./wd.css";

export const metadata: Metadata = {
  title: "Native Inhouse",
  description: "Native 팀의 재무, 요청과 문서를 연결하는 내부 팀스페이스",
  robots: { index: false, follow: false },
  icons: { icon: "/native-logo.png", shortcut: "/native-logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
