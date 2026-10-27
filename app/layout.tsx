import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./wd.css";
import "./dark.css";

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

// 첫 화면이 그려지기 전에 저장된 테마를 붙여서 새로고침해도 다크가 깜빡이지 않게
const THEME_SCRIPT = `try{var t=(JSON.parse(localStorage.getItem("native-inhouse-settings"))||{}).theme;var d=t==="다크"||(t!=="라이트"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
