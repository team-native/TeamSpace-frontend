"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { hasSession } from "@/lib/api";
import { loadMe, useMe } from "@/lib/session";
import Splash from "./Splash";

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

  const waiting = !isPublic && (!checked || (!me && loading) || (!me && !error));
  // 스플래시가 화면 상태와 상관없이 같은 자리에 남아 있어야 다시 뜨지 않는다
  return (
    <>
      <Splash ready={!waiting} />
      <Body isPublic={isPublic} waiting={waiting} failed={!me} error={error}>
        {children}
      </Body>
    </>
  );
}

function Body({ isPublic, waiting, failed, error, children }: { isPublic: boolean; waiting: boolean; failed: boolean; error: string | null | undefined; children: ReactNode }) {
  if (isPublic) return <>{children}</>;
  if (waiting) return <div className="pf-gate" aria-busy="true" style={{ minHeight: "100vh" }} />;
  if (failed) {
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
