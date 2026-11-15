"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CommunityShell from "@/components/inhouse/CommunityShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { useToast } from "@/components/inhouse/ui";
import { AuthorAvatar } from "@/components/inhouse/ProfileAvatar";
import { ApiError } from "@/lib/api";
import { PROPOSAL_STATUSES, STATUS_TONE, commentProposal, fetchProposal, manageProposal, recommendProposal, type Proposal } from "@/lib/proposals";
import { isAdminRole, useMe } from "@/lib/session";

// 답변 완료 · 반려는 마지막 칸
const STEPS = ["접수", "검토 중", "협업 중", "완료"] as const;
const stepOf = (s: string) => (s === "검토 중" ? 1 : s === "협업 중" || s === "진행 중" ? 2 : s === "답변 완료" || s === "반려" || s === "완료" ? 3 : 0);
const day = (iso: string) => (iso ? iso.slice(5, 10).replace("-", ".") : "");

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { me } = useMe();
  const admin = isAdminRole(me);
  const [p, setP] = useState<Proposal | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [text, setText] = useState("");
  const [anon, setAnon] = useState(false);
  const [sending, setSending] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [status, setStatus] = useState("");
  const [answer, setAnswer] = useState("");
  const [managing, setManaging] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const got = await fetchProposal(id);
      setP(got);
      setStatus(got.status);
    } catch (e) {
      setError({ status: e instanceof ApiError ? e.status : 0, message: e instanceof Error ? e.message : "제안을 불러오지 못했어요." });
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <CommunityShell>
        <EmptyState
          icon="!"
          title={error.status === 404 ? "없는 제안이에요" : "제안을 불러오지 못했어요"}
          description={error.status === 404 ? "삭제됐거나 주소가 잘못됐어요." : error.message}
          actionLabel="목록으로"
          onAction={() => (window.location.href = "/inhouse/community/proposals")}
        />
      </CommunityShell>
    );
  }
  if (!p) {
    return (
      <CommunityShell>
        <div className="wd-muted wd-t11" aria-busy="true" style={{ padding: 48, textAlign: "center" }}>
          제안을 불러오는 중…
        </div>
      </CommunityShell>
    );
  }

  const step = stepOf(p.status);
  const reachedAt = (i: number) => {
    const h = [...p.history].reverse().find((x) => stepOf(x.status) === i);
    return h ? day(h.at) : i === 0 ? day(p.createdAt) : "";
  };

  const recommend = async () => {
    if (recommending) return;
    setRecommending(true);
    try {
      const r = await recommendProposal(p.id);
      setP({ ...p, recommended: r.recommended, recommendCount: r.recommendCount ?? r.likes ?? p.recommendCount + (r.recommended ? 1 : -1) });
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "추천하지 못했어요.");
    } finally {
      setRecommending(false);
    }
  };

  const send = async () => {
    if (sending || !text.trim()) return;
    setSending(true);
    try {
      const c = await commentProposal(p.id, { text: text.trim(), anonymous: anon });
      setP({ ...p, comments: [...p.comments, c], commentCount: p.commentCount + 1 });
      setText("");
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "댓글을 달지 못했어요.");
    } finally {
      setSending(false);
    }
  };

  const manage = async () => {
    if (managing) return;
    setManaging(true);
    try {
      await manageProposal(p.id, { status, ...(answer.trim() ? { answer: answer.trim() } : {}) });
      setAnswer("");
      toast.show(answer.trim() ? "답변을 등록했어요" : `${status}(으)로 바꿨어요`);
      await load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "처리하지 못했어요.");
    } finally {
      setManaging(false);
    }
  };

  return (
    <CommunityShell>
      <div className="t-side t-side-300" style={{ marginTop: 6 }}>
        <article className="wd-card" style={{ padding: 28, minWidth: 0 }}>
          <Link href="/inhouse/community/proposals" className="wd-t10 wd-faint">
            ← 운영 제안
          </Link>
          <div className="wd-row" style={{ gap: 6, marginTop: 14 }}>
            <span className="wd-badge">{p.dept || "기타"}</span>
            <span className={`wd-badge ${STATUS_TONE[p.status] ?? ""}`}>{p.status}</span>
          </div>
          <h1 style={{ margin: "12px 0 10px", fontSize: 24, letterSpacing: "-.05em", fontWeight: 620 }}>{p.title}</h1>
          <div className="wd-row wd-t10 wd-faint" style={{ gap: 8, marginBottom: 24 }}>
            <AuthorAvatar name={p.author} profile={p.profile} anonymous={p.anonymous} mine={p.mine} size={24} />
            <b style={{ color: "var(--t-ink)" }}>{p.author}</b> · {p.when} · 조회 {p.views}
          </div>
          <div className="wd-doc" style={{ marginBottom: 24, whiteSpace: "pre-line" }}>
            <p>{p.body}</p>
          </div>
          <div className="wd-row" style={{ gap: 10, paddingBottom: 22, borderBottom: "1px solid var(--t-line)" }}>
            <button type="button" aria-pressed={p.recommended} className={`wd-chip ${p.recommended ? "bon" : ""}`} onClick={() => void recommend()} disabled={recommending}>
              {p.recommended ? "▲" : "△"} 추천 {p.recommendCount}
            </button>
            <span className="wd-t9 wd-faint">1인 1회 추천할 수 있어요. 다시 누르면 취소돼요.</span>
          </div>

          {p.answer && (
            <div className="wd-banner gray" style={{ margin: "22px 0 0", padding: "16px 18px", alignItems: "flex-start" }}>
              <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>✓</span>
              <div>
                <b className="wd-t11">
                  {p.answer.who} 답변 <span className="wd-faint" style={{ fontWeight: 400 }}>· {p.answer.when}</span>
                </b>
                <p style={{ margin: "6px 0 0", whiteSpace: "pre-line", lineHeight: 1.7 }}>{p.answer.text}</p>
              </div>
            </div>
          )}

          <b className="wd-t11" style={{ display: "block", margin: "26px 0 12px" }}>
            댓글 {p.comments.length}
          </b>
          {p.comments.length === 0 && <p className="wd-t10 wd-faint" style={{ margin: "0 0 14px" }}>첫 의견을 남겨보세요.</p>}
          {p.comments.map((c) => (
            <div key={c.id} className="wd-row" style={{ gap: 10, alignItems: "flex-start", padding: "12px 0", borderTop: "1px solid var(--t-line)" }}>
              <AuthorAvatar name={c.author} profile={c.profile} anonymous={c.anonymous || c.author === "글쓴이"} mine={c.mine} size={28} />
              <div style={{ minWidth: 0 }}>
                <b className="wd-t10">
                  {c.author}
                  {c.author === "글쓴이" && <span className="wd-badge" style={{ marginLeft: 6 }}>글쓴이</span>}
                  <span className="wd-faint" style={{ fontWeight: 400 }}> · {c.when}</span>
                </b>
                <p className="wd-t11" style={{ margin: "4px 0 0", whiteSpace: "pre-line" }}>{c.text}</p>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <textarea className="wd-input" rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder="이 제안에 대한 의견을 남겨주세요" style={{ width: "100%", resize: "vertical" }} />
            <div className="wd-between" style={{ marginTop: 8 }}>
              <label className="wd-row wd-t10" style={{ gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} /> 익명으로
              </label>
              <button type="button" className="wd-btn sm" onClick={() => void send()} disabled={sending || !text.trim()}>
                {sending ? "올리는 중…" : "댓글 달기"}
              </button>
            </div>
          </div>
        </article>

        <aside style={{ display: "grid", gap: 14, position: "sticky", top: 88 }}>
          <div className="wd-card" style={{ padding: 20 }}>
            <b className="wd-t11" style={{ display: "block", marginBottom: 14 }}>진행 상태</b>
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {STEPS.map((label, i) => {
                const done = i <= step;
                const name = i === 3 && (p.status === "반려" || p.status === "답변 완료") ? p.status : label;
                return (
                  <li key={label} className="wd-row" style={{ gap: 10, padding: "7px 0" }}>
                    <span
                      aria-hidden
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 10,
                        color: "#fff",
                        background: done ? (p.status === "반려" && i === 3 ? "var(--t-red)" : "var(--t-blue)") : "var(--t-line)",
                      }}
                    >
                      {done ? "✓" : ""}
                    </span>
                    <span className="wd-t11" style={{ flex: 1, fontWeight: i === step ? 650 : 400, color: done ? "var(--t-ink)" : "var(--t-faint)" }}>
                      {name}
                    </span>
                    <span className="wd-t9 wd-faint">{done ? reachedAt(i) : ""}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {admin && (
            <div className="wd-card" style={{ padding: 20 }}>
              <b className="wd-t11" style={{ display: "block", marginBottom: 12 }}>처리하기</b>
              <label className="wd-t10 wd-faint" htmlFor="proposal-status" style={{ display: "block", marginBottom: 6 }}>
                상태
              </label>
              <select id="proposal-status" className="wd-input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: "100%" }}>
                {PROPOSAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <label className="wd-t10 wd-faint" htmlFor="proposal-answer" style={{ display: "block", margin: "12px 0 6px" }}>
                공식 답변 (선택)
              </label>
              <textarea
                id="proposal-answer"
                className="wd-input"
                rows={4}
                maxLength={2000}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="답변을 남기면 반려가 아닌 한 답변 완료로 바뀌어요"
                style={{ width: "100%", resize: "vertical" }}
              />
              <button
                type="button"
                className="wd-btn sm"
                style={{ width: "100%", marginTop: 10 }}
                onClick={() => void manage()}
                disabled={managing || (status === p.status && !answer.trim())}
              >
                {managing ? "저장하는 중…" : "저장"}
              </button>
            </div>
          )}
        </aside>
      </div>
      {toast.node}
    </CommunityShell>
  );
}
