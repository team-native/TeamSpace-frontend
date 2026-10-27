"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { InhouseData } from "@/lib/inhouse";
import { ME } from "@/lib/demo";
import PortalHeader from "./PortalHeader";

type Props = {
  data: InhouseData | null;
  error: string;
  active?: string;
  children: ReactNode;
};

export default function PortalShell({ data, error, active, children }: Props) {
  const member = data?.member ?? {
    name: ME.name,
    email: ME.email,
  };

  return (
    <main className={`pf-shell ${active ? `pf-${active}` : ""}`}>
      <PortalHeader member={member} />

      {error ? (
        <section
          className="wd-scope"
          style={{
            minHeight: "calc(100vh - 76px)",
            display: "grid",
            placeItems: "center",
            padding: "40px 20px",
          }}
        >
          <div style={{ width: "min(380px, 100%)", textAlign: "center" }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 72,
                height: 72,
                margin: "0 auto 22px",
                borderRadius: 24,
                background: "#fff0f1",
                color: "#f04452",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              !
            </span>

            <h1 style={{ margin: 0, fontSize: 24, letterSpacing: "-.04em", fontWeight: 650 }}>
              잠시 문제가 생겼어요
            </h1>

            <p
              className="wd-t11 wd-muted"
              style={{ margin: "10px 0 26px", lineHeight: 1.7 }}
            >
              데이터를 불러오지 못했어요. 잠시 후 다시 시도하거나,
              <br />
              계속되면 NativeOps에 알려주세요.
            </p>

            <div className="wd-row" style={{ justifyContent: "center" }}>
              <Link className="wd-btn ghost" href="/inhouse/community/inquiry">
                문의하기
              </Link>
              <button
                type="button"
                className="wd-btn"
                onClick={() => location.reload()}
              >
                다시 불러오기
              </button>
            </div>

            <p className="wd-t9 wd-faint" style={{ marginTop: 22 }}>
              오류 코드 · 503
            </p>
          </div>
        </section>
      ) : !data ? (
        <section
          className="wd-scope"
          style={{
            minHeight: "calc(100vh - 76px)",
            display: "grid",
            placeItems: "center",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div>
            <div className="wd-row" style={{ justifyContent: "center", gap: 6 }}>
              {[1, 0.6, 0.3].map((opacity) => (
                <span
                  key={opacity}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#3182f6",
                    opacity,
                  }}
                />
              ))}
            </div>
            <p className="wd-t10 wd-muted" style={{ margin: "14px 0 0" }}>
              Native 인하우스를 준비하고 있어요
            </p>
          </div>
        </section>
      ) : (
        children
      )}
    </main>
  );
}