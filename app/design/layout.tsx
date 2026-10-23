import Script from "next/script";
import "../wd.css";

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
    </>
  );
}
