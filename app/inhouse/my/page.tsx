"use client";

import Link from "next/link";
import MyShell, { MyTitle, ProjectCards } from "@/components/inhouse/MyShell";
import { Av } from "@/components/inhouse/ui";
import { APPROVALS, APPROVAL_TONE, INQUIRIES, INQUIRY_TONE, POSTS } from "@/lib/demo";
import { useNotifications } from "@/lib/useNotifications";

export default function MySpacePage() {
  const { unreadCount } = useNotifications();
  const received = APPROVALS.filter((a) => a.received);
  const mine = APPROVALS.filter((a) => !a.received);
  const myPosts = POSTS.filter((p) => p.mine);

  return (
    <MyShell>
      <MyTitle eyebrow="MY SPACE" title="내 공간" sub="나에게 온 결재와 내 활동을 모아봤어요." />
      <div className="wd-grid g4" style={{ marginBottom: 18 }}>
        {[
          ["안 읽은 알림", unreadCount, "/inhouse/notifications"],
          ["제출한 결재", mine.length, "/inhouse/requests#box"],
          ["내 게시글", myPosts.length, "/inhouse/community?mine=1"],
          ["내 문의", INQUIRIES.length, "/inhouse/community/inquiry?tab=mine"],
        ].map(([k, v, href]) => (
          <Link key={k as string} href={href as string} className="wd-card wd-stat">
            <small>{k}</small>
            <strong>{v}</strong>
          </Link>
        ))}
      </div>
      <div className="wd-grid g2" style={{ marginBottom: 18 }}>
        <section className="wd-card" style={{ borderColor: "#cfe0fd" }}>
          <div className="wd-card-head">
            <h3>나에게 온 결재</h3>
            <Link className="wd-link" href="/inhouse/requests?tab=received#box">
              결재함 →
            </Link>
          </div>
          {received.map((a) => (
            <div key={a.id} className="wd-li" style={{ padding: "12px 0" }}>
              <Av name={a.author} id={a.authorId} />
              <div>
                <b>{a.title}</b>
                <p>{a.author} · 결재 대기</p>
              </div>
              <Link className="wd-btn blue sm" href={`/inhouse/requests/${a.id}`}>
                검토 · {a.amount}
              </Link>
            </div>
          ))}
        </section>
        <section className="wd-card" id="activity">
          <div className="wd-card-head">
            <h3>내 활동</h3>
          </div>
          {[
            ...mine.slice(0, 2).map((a) => ["결재", APPROVAL_TONE[a.status], `${a.title} · ${a.status}`, `/inhouse/requests/${a.id}`]),
            ...myPosts.map((p) => ["게시글", "", `${p.title}`, `/inhouse/community/${p.id}`]),
            ...INQUIRIES.slice(0, 1).map((q) => ["문의", INQUIRY_TONE[q.status], `${q.title} · ${q.status}`, "/inhouse/community/inquiry?tab=mine"]),
          ].map(([k, t, x, href]) => (
            <Link key={x} href={href} className="wd-row wd-t11" style={{ padding: "9px 0", gap: 10 }}>
              <span className={`wd-badge ${t}`} style={{ width: 44, justifyContent: "center", flex: "none" }}>{k}</span>
              {x}
            </Link>
          ))}
        </section>
      </div>
      <div className="wd-sec-title">
        <h2 style={{ fontSize: 18 }}>참여 프로젝트</h2>
        <Link className="wd-link" href="/inhouse/my/projects">
          전체 →
        </Link>
      </div>
      <ProjectCards />
    </MyShell>
  );
}
