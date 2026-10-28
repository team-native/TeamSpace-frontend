"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { REPORTS, isAdmin, pendingIncome, waitingInquiries } from "@/lib/admin";
import { ME } from "@/lib/demo";
import EmptyState from "./EmptyState";
import { Eyebrow } from "./ui";
import WdPage from "./WdPage";
import "@/app/admin.css";

const NAV: [string, string, number?][] = [
  ["대시보드", "/inhouse/admin"],
  ["공지 관리", "/inhouse/admin/notices/new"],
  ["일정 관리", "/inhouse/admin/events/28"],
  ["문서 개정", "/inhouse/admin/documents/finance-pool"],
  ["문의 답변", "/inhouse/admin/inquiries", waitingInquiries().length],
  ["신고 처리", "/inhouse/admin/reports", REPORTS.length],
  ["재정 권한", "/inhouse/admin/finance-roles"],
  ["수주 · 입금", "/inhouse/admin/income", pendingIncome().length],
];

const section = (href: string) => href.split("/").slice(0, 4).join("/");

// 운영 관리 공통 틀: 왼쪽 메뉴 + 제목 영역. Leader · NativeOps · FA 만 들어올 수 있음
export default function AdminShell({ title, sub, right, children }: { title: string; sub?: string; right?: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (!isAdmin(ME.dept)) {
    return (
      <WdPage>
        <div className="wd-wrap wd-pb" style={{ paddingTop: 80 }}>
          <EmptyState icon="!" title="운영진만 볼 수 있어요" description="Leader · NativeOps · FA 부서에게만 열려 있어요." actionLabel="홈으로" onAction={() => router.push("/inhouse")} />
        </div>
      </WdPage>
    );
  }

  return (
    <WdPage>
      <div className="wd-admin">
        <aside>
          <div className="wd-row" style={{ gap: 8, padding: "0 12px 22px" }}>
            <span className="wd-badge dark">ADMIN</span>
            <b className="wd-t12">운영 관리</b>
          </div>
          <nav className="wd-toc" aria-label="운영 관리 메뉴">
            {NAV.map(([label, href, count]) => {
              const on = href === "/inhouse/admin" ? pathname === href : pathname.startsWith(section(href));
              return (
                <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
                  {label}
                  {!!count && <b>{count}</b>}
                </Link>
              );
            })}
          </nav>
          <p className="wd-t9 wd-faint" style={{ padding: "22px 12px 0", lineHeight: 1.6 }}>
            Leader · NativeOps · FA 권한이 있는 사람만 보여요.
          </p>
        </aside>
        <main>
          <div className="wd-between" style={{ alignItems: "flex-end", marginBottom: 26, gap: 16, flexWrap: "wrap" }}>
            <div>
              <Eyebrow>ADMIN</Eyebrow>
              <h1 style={{ margin: "14px 0 8px", fontSize: 30, letterSpacing: "-.06em", fontWeight: 620 }}>{title}</h1>
              {sub && <p className="wd-t11 wd-muted" style={{ margin: 0 }}>{sub}</p>}
            </div>
            {right}
          </div>
          {children}
        </main>
      </div>
    </WdPage>
  );
}

// 설명이 붙은 켜고 끄기 줄
export function AdminToggle({ on, label, desc, disabled, onChange }: { on: boolean; label: string; desc?: string; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="wd-between" style={{ padding: "12px 0", borderBottom: "1px solid var(--wd-line)" }}>
      <div>
        <b className="wd-t11" style={{ fontWeight: 620 }}>{label}</b>
        {desc && <p className="wd-t9 wd-faint" style={{ margin: "3px 0 0" }}>{desc}</p>}
      </div>
      <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} className={`wd-toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)} />
    </div>
  );
}
