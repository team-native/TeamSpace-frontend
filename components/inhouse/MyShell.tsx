"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { fetchMyProjects, type Project } from "@/lib/projects";
import { useMe } from "@/lib/session";
import EmptyState from "./EmptyState";
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
  const { me } = useMe();
  return (
    <WdPage>
      <div className="wd-wrap wd-pb pf-my-shell">
        <aside>
          <div className="wd-row" style={{ gap: 10, padding: "0 12px 20px" }}>
            <Av name={me?.name ?? ""} tone="dark" />
            <div>
              <b className="wd-t12">{me?.name}</b>
              <span className="wd-t9 wd-faint" style={{ display: "block" }}>
                {[me?.dept, me?.major].filter(Boolean).join(" · ") || "소속 미등록"}
              </span>
            </div>
          </div>
          <nav className="wd-toc" aria-label="내 공간 메뉴">
            {NAV.map(([label, href]) => {
              const on = href === "/inhouse/my" ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={on ? "page" : undefined} style={{ padding: "9px 12px", borderRadius: 9, fontSize: 10, fontWeight: 600, color: on ? "var(--t-ink)" : "var(--t-faint)", background: on ? "var(--t-soft)" : undefined }}>
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

// GET /me/projects — 내가 멤버이거나 등록한 프로젝트
export function ProjectCards({ limit }: { limit?: number }) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  const req = useRef(0);

  const load = useCallback(async () => {
    const id = ++req.current;
    setError("");
    try {
      const list = await fetchMyProjects();
      if (id === req.current) setProjects(list);
    } catch (e) {
      if (id === req.current) setError(e instanceof Error ? e.message : "프로젝트를 불러오지 못했어요.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="wd-banner danger">
        <span className="ico">!</span>
        <div>
          <b>{error}</b>
        </div>
        <button type="button" className="wd-btn sm" onClick={load}>
          다시 시도
        </button>
      </div>
    );
  }
  if (!projects) {
    return (
      <p className="wd-t11 wd-faint" aria-busy="true">
        프로젝트를 불러오는 중이에요…
      </p>
    );
  }
  if (projects.length === 0) {
    return <EmptyState icon="◎" title="아직 참여 중인 프로젝트가 없어요" description="프로젝트에 합류하면 여기에 모여요." />;
  }

  return (
    <div className="wd-grid g3">
      {(limit ? projects.slice(0, limit) : projects).map((p) => (
        <Link key={p.id} href={`/inhouse/my/projects/${encodeURIComponent(p.id)}`} className="wd-card">
          <div className="wd-between">
            <span className={`wd-av ${p.tone}`}>{p.name.slice(0, 1)}</span>
            <span className="wd-badge">{p.status}</span>
          </div>
          <b style={{ display: "block", margin: "14px 0 3px", fontSize: 14 }}>{p.name}</b>
          <span className="wd-t9 wd-faint">{[p.role, p.due].filter(Boolean).join(" · ") || p.desc}</span>
          <div className="wd-bar" style={{ marginTop: 14 }}>
            <i style={{ width: `${p.progress}%` }} />
          </div>
          <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 6 }}>진행률 {p.progress}%</span>
        </Link>
      ))}
    </div>
  );
}
