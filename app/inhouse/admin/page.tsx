"use client";

import Link from "next/link";
import AdminShell from "@/components/inhouse/AdminShell";
import { Av, useToast } from "@/components/inhouse/ui";
import { REPORTS, mustReadNotices, pendingIncome, unconfirmedPeople, waitingInquiries } from "@/lib/admin";
import type { Tone } from "@/lib/demo";

export default function AdminHome() {
  const toast = useToast();
  const inquiries = waitingInquiries();
  const income = pendingIncome();
  const notices = mustReadNotices();
  const unconfirmed = unconfirmedPeople();

  const stats: [string, string, string, Tone][] = [
    ["답변 대기 문의", `${inquiries.length}`, inquiries[0] ? `가장 오래된 건 ${inquiries.map((q) => q.date).sort()[0]}` : "모두 답변했어요", "orange"],
    ["신고 접수", `${REPORTS.length}`, `게시글 ${REPORTS.filter((r) => r.target === "게시글").length} · 댓글 ${REPORTS.filter((r) => r.target === "댓글").length}`, "red"],
    ["입금 확인 필요", `${income.length}`, income[0] ? `${income[0].client} ${income[0].amount.toLocaleString("ko-KR")}원` : "없어요", "blue"],
    ["필독 미확인", `${unconfirmed.length}명`, notices[0]?.title.split(" — ")[0] ?? "", ""],
  ];

  const todo: [string, Tone, string, string, string, string][] = [
    ...inquiries.map((q): [string, Tone, string, string, string, string] => [q.type, "orange", q.title, `${q.dept} · ${q.anonymous ? "익명" : "실명"} · ${q.date}`, "답변하기", `/inhouse/admin/inquiries?id=${q.id}`]),
    ...REPORTS.map((r): [string, Tone, string, string, string, string] => ["신고", "red", r.title, `${r.reason} · ${r.when}`, "확인", "/inhouse/admin/reports"]),
    ...income.map((r): [string, Tone, string, string, string, string] => ["입금", "blue", `${r.project} · ${r.amount.toLocaleString("ko-KR")}원`, `${r.client} · ${r.date}`, "입금 등록", "/inhouse/admin/income"]),
  ];

  return (
    <AdminShell title="오늘 처리할 것" sub="운영진이 응답해야 하는 일을 모았어요.">
      <div className="wd-grid g4" style={{ marginBottom: 18 }}>
        {stats.map(([k, v, s, t]) => (
          <div key={k} className="wd-card wd-stat">
            <small>{k}</small>
            <strong style={{ color: t === "red" ? "#f04452" : undefined }}>{v}</strong>
            <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 5 }}>{s}</span>
          </div>
        ))}
      </div>
      <div className="wd-grid g2" style={{ alignItems: "start" }}>
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>바로 처리</h3>
            <span className="wd-t9 wd-faint">{todo.length}건</span>
          </div>
          {todo.map(([k, t, x, m, cta, href]) => (
            <div key={x} className="wd-li">
              <span className={`wd-badge ${t}`}>{k}</span>
              <div>
                <b>{x}</b>
                <p>{m}</p>
              </div>
              <Link className="wd-btn line sm" href={href}>
                {cta}
              </Link>
            </div>
          ))}
        </section>
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>필독 확인 현황</h3>
            <button type="button" className="wd-link" style={{ border: 0, background: "none", cursor: "pointer" }} onClick={() => toast.show(`미확인 ${unconfirmed.length}명에게 리마인드를 보냈어요`)}>
              리마인드 보내기
            </button>
          </div>
          {notices.map((n) => (
            <Link key={n.id} href={`/inhouse/community/notices/${n.id}`} style={{ display: "block", padding: "12px 0", color: "inherit", textDecoration: "none" }}>
              <div className="wd-between wd-t11" style={{ marginBottom: 8 }}>
                <b style={{ fontWeight: 620 }}>{n.title.split(" — ")[0]}</b>
                <span className="wd-faint">
                  {n.confirmed} / {n.total}명
                </span>
              </div>
              <div className="wd-bar">
                <i style={{ width: `${(n.confirmed / n.total) * 100}%` }} />
              </div>
            </Link>
          ))}
          <div className="wd-avs" style={{ marginTop: 12 }}>
            {unconfirmed.map((p) => (
              <Av key={p.id} name={p.name} tone={p.tone} size="sm" />
            ))}
            <span className="wd-t9 wd-faint" style={{ marginLeft: 10, alignSelf: "center" }}>
              미확인 {unconfirmed.length}명
            </span>
          </div>
        </section>
      </div>
      {toast.node}
    </AdminShell>
  );
}
