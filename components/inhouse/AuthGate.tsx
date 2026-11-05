"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { hasSession } from "@/lib/api";
import { loadMe, useMe } from "@/lib/session";

// 로그인 없이 열리는 화면
const PUBLIC = ["/inhouse/login", "/inhouse/reset-password"];

// 인하우스 화면은 로그인해야 열린다. 토큰이 없거나 만료되면 로그인으로 보내고 돌아올 주소를 붙인다
export default function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const { me, error, loading } = useMe();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isPublic) return;
    if (!hasSession()) {
      const next = window.location.pathname + window.location.search;
      router.replace(`/inhouse/login?next=${encodeURIComponent(next)}`);
      return;
    }
    setChecked(true);
  }, [isPublic, pathname, router, me, error]);

  if (isPublic) return <>{children}</>;
  if (!checked || (!me && loading) || (!me && !error)) {
    return <div className="pf-gate" aria-busy="true" style={{ minHeight: "100vh" }} />;
  }
  if (!me) {
    return (
      <main className="wd-scope" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <h1 style={{ fontSize: 22, margin: 0 }}>내 정보를 불러오지 못했어요</h1>
          <p className="wd-t11 wd-muted" style={{ margin: "10px 0 22px", lineHeight: 1.7 }}>
            {error}
          </p>
          <button type="button" className="wd-btn" onClick={() => void loadMe(true)}>
            다시 시도
          </button>
        </div>
      </main>
    );
  }
  return <>{children}</>;
}
