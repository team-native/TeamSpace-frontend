"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/inhouse/AdminShell";
import { Av } from "@/components/inhouse/ui";
import {
  fetchMustReadNotices,
  fetchPendingIncome,
  fetchReports,
  fetchUnconfirmed,
  fetchWaitingInquiries,
  groupReports,
  orForbidden,
  type ReportGroup,
  type Unconfirmed,
} from "@/lib/admin-api";
import { relTime } from "@/lib/board";
import type { Tone } from "@/lib/shared";
import type { ReceiptRow } from "@/lib/finance";
import type { Inquiry } from "@/lib/inquiries";
import type { Notice } from "@/lib/notices";

// 각 칸: undefined = 불러오는 중, null = 권한 없음
type Slot<T> = T | null | undefined;

export default function AdminHome() {
  const [inquiries, setInquiries] = useState<Slot<Inquiry[]>>(undefined);
  const [reports, setReports] = useState<Slot<ReportGroup[]>>(undefined);
  const [income, setIncome] = useState<Slot<ReceiptRow[]>>(undefined);
  const [notices, setNotices] = useState<Notice[] | undefined>(undefined);
  const [unconfirmed, setUnconfirmed] = useState<Slot<Unconfirmed[]>>(undefined);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const fail = (e: unknown) => setError(e instanceof Error ? e.message : "운영 정보를 불러오지 못했어요.");
    orForbidden(fetchWaitingInquiries()).then(setInquiries).catch(fail);
    orForbidden(fetchReports("PENDING")).then((r) => setReports(r ? groupReports(r) : null)).catch(fail);
    orForbidden(fetchPendingIncome()).then(setIncome).catch(fail);
    fetchMustReadNotices()
      .then(async (list) => {
        setNotices(list);
        // 미확인자는 가장 최근 필독 공지 기준
        setUnconfirmed(list[0] ? await orForbidden(fetchUnconfirmed(list[0].id)) : []);
      })
      .catch(fail);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const count = (v: Slot<unknown[]>, unit = "") => (v === undefined ? "–" : v === null ? "권한 없음" : `${v.length}${unit}`);
  const oldest = inquiries?.map((q) => q.date).filter(Boolean).sort()[0];

  const stats: [string, string, string, Tone][] = [
    ["답변 대기 문의", count(inquiries), inquiries?.length ? `가장 오래된 건 ${oldest ?? "-"}` : inquiries ? "모두 답변했어요" : "", "orange"],
    ["신고 접수", count(reports), reports ? `신고 ${reports.reduce((n, g) => n + g.reports.length, 0)}건` : "", "red"],
    ["입금 확인 필요", count(income), income?.[0] ? `${income[0].client} ${income[0].amount.toLocaleString("ko-KR")}원` : income ? "없어요" : "", "blue"],
    ["필독 미확인", count(unconfirmed, "명"), notices?.[0]?.title ?? (notices ? "필독 공지가 없어요" : ""), ""],
  ];

  const todo: { key: string; tag: string; tone: Tone; title: string; meta: string; cta: string; href: string }[] = [
    ...(inquiries ?? []).map((q) => ({
      key: `q${q.id}`,
      tag: q.type,
      tone: "orange" as Tone,
      title: q.title,
      meta: [q.dept, q.anonymous ? "익명" : "실명", q.date].filter(Boolean).join(" · "),
      cta: "답변하기",
      href: `/inhouse/admin/inquiries?id=${q.id}`,
    })),
    ...(reports ?? []).map((g) => ({
      key: `r${g.postId}`,
      tag: "신고",
      tone: "red" as Tone,
      title: `게시글 #${g.postId} · 신고 ${g.reports.length}회`,
      meta: [g.reasons.join(", "), relTime(g.reports[0]?.createdAt)].filter(Boolean).join(" · "),
      cta: "확인",
      href: "/inhouse/admin/reports",
    })),
    ...(income ?? []).map((r) => ({
      key: `i${r.id}`,
      tag: "입금",
      tone: "blue" as Tone,
      title: `${r.project || r.client} · ${r.amount.toLocaleString("ko-KR")}원`,
      meta: [r.client, r.status, r.date].filter(Boolean).join(" · "),
      cta: "입금 등록",
      href: "/inhouse/admin/income",
    })),
  ];
  const loading = inquiries === undefined || reports === undefined || income === undefined;

  return (
    <AdminShell title="오늘 처리할 것" sub="운영진이 응답해야 하는 일을 모았어요.">
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
      <div className="wd-grid g4" style={{ marginBottom: 18 }}>
        {stats.map(([k, v, s, t]) => (
          <div key={k} className="wd-card wd-stat">
            <small>{k}</small>
            <strong style={{ color: t === "red" && v !== "0" && v !== "권한 없음" ? "var(--t-red)" : undefined }}>{v}</strong>
            <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 5 }}>{s}</span>
          </div>
        ))}
      </div>
      <div className="wd-grid g2" style={{ alignItems: "start" }}>
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>바로 처리</h3>
            <span className="wd-t9 wd-faint">{loading ? "불러오는 중…" : `${todo.length}건`}</span>
          </div>
          {!loading && todo.length === 0 && <p className="wd-t10 wd-faint" style={{ margin: 0 }}>지금 처리할 일이 없어요.</p>}
          {todo.map((t) => (
            <div key={t.key} className="wd-li">
              <span className={`wd-badge ${t.tone}`}>{t.tag}</span>
              <div>
                <b>{t.title}</b>
                <p>{t.meta}</p>
              </div>
              <Link className="wd-btn line sm" href={t.href}>
                {t.cta}
              </Link>
            </div>
          ))}
        </section>
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>필독 확인 현황</h3>
          </div>
          {notices === undefined && <p className="wd-t10 wd-faint" aria-busy="true">불러오는 중이에요…</p>}
          {notices?.length === 0 && <p className="wd-t10 wd-faint" style={{ margin: 0 }}>확인이 필요한 필독 공지가 없어요.</p>}
          {notices?.slice(0, 4).map((n) => (
            <Link key={n.id} href={`/inhouse/community/notices/${n.id}`} style={{ display: "block", padding: "12px 0", color: "inherit", textDecoration: "none" }}>
              <div className="wd-between wd-t11" style={{ marginBottom: 8 }}>
                <b style={{ fontWeight: 620 }}>{n.title}</b>
                <span className="wd-faint">
                  {n.confirmed} / {n.total}명
                </span>
              </div>
              <div className="wd-bar">
                <i style={{ width: `${n.total ? (n.confirmed / n.total) * 100 : 0}%` }} />
              </div>
            </Link>
          ))}
          {unconfirmed && unconfirmed.length > 0 && (
            <div className="wd-avs" style={{ marginTop: 12 }}>
              {unconfirmed.slice(0, 8).map((p) => (
                <Av key={p.id} name={p.name} size="sm" />
              ))}
              <span className="wd-t9 wd-faint" style={{ marginLeft: 10, alignSelf: "center" }}>
                {notices?.[0]?.title ? `'${notices[0].title}' ` : ""}미확인 {unconfirmed.length}명
              </span>
            </div>
          )}
          {unconfirmed === null && (
            <p className="wd-t9 wd-faint" style={{ margin: "12px 0 0" }}>미확인자 명단은 Admin만 볼 수 있어요.</p>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
