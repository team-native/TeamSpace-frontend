"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import MyShell, { MyTitle, ProjectCards } from "@/components/inhouse/MyShell";
import { Av } from "@/components/inhouse/ui";
import { fetchBox, type Approval } from "@/lib/approvals";
import { relTime } from "@/lib/board";
import { fetchActivity, fetchSummary, type Activity, type Summary } from "@/lib/projects";

export default function MySpacePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [received, setReceived] = useState<Approval[] | null>(null);
  const [activity, setActivity] = useState<Activity[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const req = useRef(0);

  const load = useCallback(async () => {
    const id = ++req.current;
    setError("");
    try {
      const [s, r, a] = await Promise.all([fetchSummary(), fetchBox("received", 20), fetchActivity()]);
      if (id !== req.current) return;
      setSummary(s);
      // 지금 내 차례인 결재만
      setReceived(r.filter((x) => x.status === "결재 대기" || x.status === "검토 중"));
      setActivity(a.items);
      setCursor(a.nextCursor);
    } catch (e) {
      if (id === req.current) setError(e instanceof Error ? e.message : "내 공간을 불러오지 못했어요.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    if (!cursor || more) return;
    setMore(true);
    try {
      const page = await fetchActivity(cursor);
      setActivity((prev) => [...(prev ?? []), ...page.items]);
      setCursor(page.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "활동을 더 불러오지 못했어요.");
    } finally {
      setMore(false);
    }
  };

  const stats: [string, number | undefined, string][] = [
    ["안 읽은 알림", summary?.unreadNotifications, "/inhouse/notifications"],
    ["제출한 결재", summary?.submittedApprovals, "/inhouse/requests#box"],
    ["내 게시글", summary?.myPosts, "/inhouse/community?mine=1"],
    ["내 문의", summary?.myInquiries, "/inhouse/community/inquiry?tab=mine"],
  ];

  return (
    <MyShell>
      <MyTitle eyebrow="MY SPACE" title="내 공간" sub="나에게 온 결재와 내 활동을 모아봤어요." />
      {error && (
        <div className="wd-banner danger" style={{ marginBottom: 18 }}>
          <span className="ico">!</span>
          <div>
            <b>{error}</b>
          </div>
          <button type="button" className="wd-btn sm" onClick={load}>
            다시 시도
          </button>
        </div>
      )}
      <div className="wd-grid g4" style={{ marginBottom: 18 }} aria-busy={!summary}>
        {stats.map(([k, v, href]) => (
          <Link key={k} href={href} className="wd-card wd-stat">
            <small>{k}</small>
            <strong>{v ?? "–"}</strong>
          </Link>
        ))}
      </div>
      <div className="wd-grid g2" style={{ marginBottom: 18 }}>
        <section className="wd-card" style={{ borderColor: "var(--t-blue-line)" }}>
          <div className="wd-card-head">
            <h3>나에게 온 결재</h3>
            <Link className="wd-link" href="/inhouse/requests?tab=received#box">
              결재함 →
            </Link>
          </div>
          {!received && !error && <p className="wd-t10 wd-faint" aria-busy="true">불러오는 중이에요…</p>}
          {received && received.length === 0 && (
            <p className="wd-t10 wd-faint" style={{ margin: 0 }}>지금 검토할 결재가 없어요.</p>
          )}
          {received?.slice(0, 5).map((a) => (
            <div key={a.id} className="wd-li" style={{ padding: "12px 0" }}>
              <Av name={a.author} />
              <div>
                <b>{a.title}</b>
                <p>
                  {a.author} · {a.status}
                </p>
              </div>
              <Link className="wd-btn blue sm" href={`/inhouse/requests/${a.id}`}>
                검토{a.amount ? ` · ${a.amount}` : ""}
              </Link>
            </div>
          ))}
        </section>
        <section className="wd-card" id="activity">
          <div className="wd-card-head">
            <h3>내 활동</h3>
          </div>
          {!activity && !error && <p className="wd-t10 wd-faint" aria-busy="true">불러오는 중이에요…</p>}
          {activity && activity.length === 0 && (
            <p className="wd-t10 wd-faint" style={{ margin: 0 }}>아직 활동 기록이 없어요.</p>
          )}
          {activity?.map((a) => {
            const row = (
              <>
                <span className={`wd-badge ${a.tone}`} style={{ width: 44, justifyContent: "center", flex: "none" }}>
                  {a.label}
                </span>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</span>
                <span className="wd-t9 wd-faint" style={{ flex: "none" }}>{relTime(a.at)}</span>
              </>
            );
            return a.href ? (
              <Link key={a.id} href={a.href} className="wd-row wd-t11" style={{ padding: "9px 0", gap: 10 }}>
                {row}
              </Link>
            ) : (
              <div key={a.id} className="wd-row wd-t11" style={{ padding: "9px 0", gap: 10 }}>
                {row}
              </div>
            );
          })}
          {cursor && (
            <button type="button" className="wd-btn ghost sm full" style={{ marginTop: 8 }} onClick={loadMore} disabled={more} aria-busy={more}>
              {more ? "불러오는 중…" : "더 보기"}
            </button>
          )}
        </section>
      </div>
      <div className="wd-sec-title">
        <h2 style={{ fontSize: 18 }}>참여 프로젝트</h2>
        <Link className="wd-link" href="/inhouse/my/projects">
          전체 →
        </Link>
      </div>
      <ProjectCards limit={3} />
    </MyShell>
  );
}
