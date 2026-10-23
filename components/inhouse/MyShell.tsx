"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ME, PROJECTS } from "@/lib/demo";
import { Av, Eyebrow } from "./ui";
import WdPage from "./WdPage";

const NAV: [string, string][] = [
  ["내 공간 홈", "/inhouse/my"],
  ["프로필", "/inhouse/my/profile"],
  ["일정", "/inhouse/my/calendar"],
  ["참여 프로젝트", "/inhouse/my/projects"],
  ["설정", "/inhouse/my/settings"],
];

export default function MyShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <WdPage>
      <div className="wd-wrap wd-pb pf-my-shell">
        <aside>
          <div className="wd-row" style={{ gap: 10, padding: "0 12px 20px" }}>
            <Av name={ME.name} tone="dark" />
            <div>
              <b className="wd-t12">{ME.name}</b>
              <span className="wd-t9 wd-faint" style={{ display: "block" }}>
                {ME.dept} · iOS
              </span>
            </div>
          </div>
          <nav className="wd-toc" aria-label="내 공간 메뉴">
            {NAV.map(([label, href]) => {
              const on = href === "/inhouse/my" ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={on ? "page" : undefined} style={{ padding: "9px 12px", borderRadius: 9, fontSize: 10, fontWeight: 600, color: on ? "#191f28" : "#6b7684", background: on ? "#f2f4f6" : undefined }}>
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </WdPage>
  );
}

export function MyTitle({ eyebrow, title, sub, right }: { eyebrow: string; title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="wd-between" style={{ alignItems: "flex-end", marginBottom: 26, flexWrap: "wrap" }}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 style={{ margin: "14px 0 8px", fontSize: 30, letterSpacing: "-.06em", fontWeight: 620 }}>{title}</h1>
        {sub && <p className="wd-t11 wd-muted" style={{ margin: 0 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function ProjectCards() {
  return (
    <div className="wd-grid g3">
      {PROJECTS.map((p) => (
        <Link key={p.id} href={`/inhouse/my/projects/${p.id}`} className="wd-card">
          <div className="wd-between">
            <span className={`wd-av ${p.tone}`}>{p.name.slice(0, 1)}</span>
            <span className="wd-badge">{p.status}</span>
          </div>
          <b style={{ display: "block", margin: "14px 0 3px", fontSize: 14 }}>{p.name}</b>
          <span className="wd-t9 wd-faint">
            {p.role} · {p.due}
          </span>
          <div className="wd-bar" style={{ marginTop: 14 }}>
            <i style={{ width: `${p.progress}%` }} />
          </div>
          <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 6 }}>진행률 {p.progress}%</span>
        </Link>
      ))}
    </div>
  );
}
