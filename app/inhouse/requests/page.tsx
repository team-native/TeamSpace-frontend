"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type CSSProperties } from "react";
import PortalShell from "@/components/inhouse/PortalShell";
import { useRevealOnScroll } from "@/components/inhouse/useRevealOnScroll";
import { Eyebrow } from "@/components/inhouse/ui";
import { APPROVAL_STATUSES, APPROVAL_TONE, fetchBox, type Approval, type ApprovalStatus } from "@/lib/approvals";
import { UserRound } from "lucide-react";
import EmptyState from "@/components/inhouse/EmptyState";

const STATUSES: ("전체" | ApprovalStatus)[] = ["전체", ...APPROVAL_STATUSES];

type RequestType = {
  id: "expense" | "project";
  eyebrow: string;
  title: string;
  copy: string;
  meta: string;
};

const REQUEST_TYPES: RequestType[] = [
  {
    id: "expense",
    eyebrow: "EXPENSE",
    title: "비용 승인 요청",
    copy: "프로젝트 비용, 물품, 도구 구독 등 Native 자금이 필요한 모든 요청을 한 경로로 올려요.",
    meta: "사용 목적 · 요청 금액 · 사용 예정일",
  },
  {
    id: "project",
    eyebrow: "STAFFING",
    title: "프로젝트 인력 지원",
    copy: "진행 중인 프로젝트에 필요한 직군과 인원 배정을 요청해요.",
    meta: "직군 · 인원 · 투입 기간",
  },
];

export default function RequestsPage() {
  return (
    <Suspense>
      <Requests />
    </Suspense>
  );
}

function Requests() {
  const params = useSearchParams();

  useRevealOnScroll(".pf-request-reveal", { threshold: 0.14, rootMargin: "0px 0px -36px" }, []);

  return (
    <PortalShell active="requests">
      <>
          <section className="pf-page-hero pf-request-hero">
            <span>
              <i /> APPROVAL · 전자결재
            </span>
            <h1>
              필요한 안건을
              <br />
              결재로 올려요.
            </h1>
            <p>
              돈이 필요한 요청은 하나의 비용 승인 경로로,
              <br />
              사람이 필요한 요청은 인력 지원으로 구분했어요.
            </p>
          </section>

          <section className="pf-request-grid">
            {REQUEST_TYPES.map((type, i) => (
            <Link
              key={type.id}
              href={`/inhouse/requests/new?type=${type.id}`}
              className="pf-request-card pf-request-reveal"
              style={{ "--delay": `${i * 90}ms` } as CSSProperties}
            >
                  <div className="pf-request-top">
                <span className="pf-request-icon" aria-hidden="true">
                  {type.id === "expense" ? (
                    "₩"
                  ) : (
                    <UserRound size={22} strokeWidth={1.8} />
                  )}
                </span>
                <span className="pf-request-approval-time">
                  평균 승인 1.5일
                </span>
              </div>
              <small>{type.eyebrow}</small>
              <h2>{type.title}</h2>
              <p>{type.copy}</p>
              <span className="pf-request-meta">
                {type.meta}
              </span>
              <b>→</b>
            </Link>
))}
          </section>

          <ApprovalBox initialTab={params.get("tab") === "received" ? "received" : "mine"} />
      </>
    </PortalShell>
  );
}

// 결재함: 내가 올린 결재(상태 필터) + 받은 결재 + 내가 처리한 결재 · GET /approvals?box=
function ApprovalBox({ initialTab }: { initialTab: "mine" | "received" }) {
  const [tab, setTab] = useState(initialTab);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("전체");
  const [query, setQuery] = useState("");
  const [mine, setMine] = useState<Approval[] | null>(null);
  const [received, setReceived] = useState<Approval[] | null>(null);
  const [handled, setHandled] = useState<Approval[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [m, r, h] = await Promise.all([fetchBox("mine"), fetchBox("received"), fetchBox("handled", 5)]);
      setMine(m);
      setReceived(r);
      setHandled(h.slice(0, 5));
    } catch (e) {
      setError(e instanceof Error ? e.message : "결재함을 불러오지 못했어요.");
      setMine((x) => x ?? []);
      setReceived((x) => x ?? []);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const mineList = mine ?? [];
  const receivedList = received ?? [];
  const list = (tab === "mine" ? mineList : receivedList).filter(
    (a) => (tab === "received" || status === "전체" || a.status === status) && a.title.includes(query.trim()),
  );
  const loading = mine === null || received === null;
  const filtered = !!query.trim() || status !== "전체";

  return (
    <section className="wd-scope pf-request-box" id="box">
      <div className="wd-wrap wd-pb">
        <div className="wd-sec-title">
          <div>
            <Eyebrow>MY APPROVALS</Eyebrow>
            <h2>결재함</h2>
          </div>
          <Link className="wd-btn" href="/inhouse/requests/new?type=expense">
            + 새 결재 작성
          </Link>
        </div>
        {error && (
          <div className="wd-banner danger" role="alert" style={{ marginBottom: 14, padding: "12px 14px" }}>
            <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>!</span>
            <p style={{ margin: 0, flex: 1 }}>{error}</p>
            <button type="button" className="wd-btn ghost sm" onClick={() => void load()}>
              다시 시도
            </button>
          </div>
        )}
        <div className="wd-side">
          <div>
            <div className="wd-between" style={{ marginBottom: 14, flexWrap: "wrap" }}>
              <div className="wd-tabs">
                <button type="button" className={tab === "mine" ? "on" : ""} onClick={() => setTab("mine")}>
                  내가 올린 결재<small>{mine ? mineList.length : "…"}</small>
                </button>
                <button type="button" className={tab === "received" ? "on" : ""} onClick={() => setTab("received")}>
                  받은 결재<small>{received ? receivedList.length : "…"}</small>
                </button>
              </div>
              <label className="wd-search" style={{ width: 240, height: 40 }}>
                <i>⌕</i>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="제목 검색" />
              </label>
            </div>
            {tab === "mine" && (
              <div className="wd-chips" style={{ marginBottom: 14 }}>
                {STATUSES.map((s) => (
                  <button type="button" key={s} className={`wd-chip ${status === s ? "on" : ""}`} onClick={() => setStatus(s)}>
                    {s} <small style={{ opacity: 0.6 }}>{s === "전체" ? mineList.length : mineList.filter((a) => a.status === s).length}</small>
                  </button>
                ))}
              </div>
            )}
            {loading ? (
              <div className="wd-muted wd-t11" aria-busy="true" style={{ padding: 40, textAlign: "center" }}>
                결재함을 불러오는 중…
              </div>
            ) : list.length === 0 ? (
              filtered ? (
                <EmptyState
                  icon="⌕"
                  title="검색 결과가 없어요"
                  description="다른 단어로 찾아보거나 필터를 풀어보세요."
                  actionLabel="필터 초기화"
                  onAction={() => {
                    setQuery("");
                    setStatus("전체");
                  }}
                />
              ) : (
                <EmptyState
                  icon="✓"
                  title={tab === "mine" ? "아직 올린 결재가 없어요" : "검토할 결재가 없어요"}
                  description={tab === "mine" ? "필요한 비용이나 인력을 결재로 올려보세요." : "결재 요청이 오면 알림으로 알려드려요."}
                />
              )
            ) : (
              <div className="wd-card" style={{ padding: "4px 20px" }}>
                <div className="wd-list">
                  {list.map((a) => (
                    <Link
                      key={a.id}
                      href={a.status === "작성 중" ? `/inhouse/requests/new?type=${a.kind === "인력 지원" ? "project" : "expense"}&draft=${a.id}` : `/inhouse/requests/${a.id}`}
                      className="wd-li link"
                      style={{ gridTemplateColumns: "72px 1fr auto auto" }}
                    >
                      <span className={`wd-badge ${APPROVAL_TONE[a.status]}`} style={{ justifySelf: "start" }}>
                        {tab === "received" ? "내 차례" : a.status}
                      </span>
                      <div>
                        <b>{a.title}</b>
                        <p>
                          {tab === "received" ? `${a.author} · ` : ""}
                          {[a.kind, a.type, a.date].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <span className="wd-t9 wd-faint">
                        {a.status === "반려"
                          ? "사유 확인"
                          : a.status === "취소" || a.status === "작성 중"
                            ? ""
                            : a.line.filter((l) => l.state !== "done").map((l) => l.who).join(" → ") || "완료"}
                      </span>
                      <span className="r">
                        <strong>{a.amount}</strong>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="wd-stack">
            <section className="wd-card" style={{ borderColor: "#cfe0fd" }}>
              <div className="wd-card-head">
                <h3>받은 결재</h3>
                <span className="wd-badge blue">대기 {receivedList.length}</span>
              </div>
              {received && receivedList.length === 0 && <p className="wd-t10 wd-faint" style={{ margin: "6px 0" }}>지금 검토할 결재가 없어요.</p>}
              {receivedList.slice(0, 5).map((r) => (
                <div key={r.id} className="wd-li" style={{ gridTemplateColumns: "1fr" }}>
                  <div>
                    <b>{r.title}</b>
                    <p>
                      {r.author} · {r.kind} · {r.date}
                    </p>
                    <div className="wd-row" style={{ marginTop: 8, gap: 6 }}>
                      <Link className="wd-btn blue sm" href={`/inhouse/requests/${r.id}`}>
                        검토하기
                      </Link>
                      <span className="wd-t10" style={{ fontWeight: 700 }}>{r.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </section>
            <section className="wd-card soft">
              <div className="wd-card-head">
                <h3>내가 처리한 결재</h3>
              </div>
              {handled.length === 0 && <p className="wd-t10 wd-faint" style={{ margin: "6px 0" }}>아직 처리한 결재가 없어요.</p>}
              {handled.map((h) => (
                <Link key={h.id} href={`/inhouse/requests/${h.id}`} className="wd-between wd-t10" style={{ padding: "8px 0" }}>
                  <span className="wd-row" style={{ gap: 8 }}>
                    <span className={`wd-badge ${APPROVAL_TONE[h.status]}`}>{h.status}</span>
                    {h.title}
                  </span>
                  <span className="wd-faint wd-t9">{h.date}</span>
                </Link>
              ))}
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
