"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import AdminShell, { refreshAdminCounts } from "@/components/inhouse/AdminShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import {
  decideReport,
  fetchHandledReports,
  fetchReportedPost,
  fetchReports,
  groupReports,
  type Report,
  type ReportDecision,
  type ReportGroup,
} from "@/lib/admin-api";
import type { PostDetail } from "@/lib/board";
import type { Tone } from "@/lib/shared";

const ACTIONS: [ReportDecision, string, string, Tone][] = [
  ["숨김", "글 숨김", "작성자에게만 보이고 다른 사람에겐 안 보여요", "orange"],
  ["삭제", "글 삭제", "글을 지워요. 되돌릴 수 없어요", "red"],
  ["반려", "신고 반려", "문제없음으로 처리하고 글은 그대로 둬요", ""],
];
const TONE: Record<string, Tone> = { 숨김: "orange", 삭제: "red", 반려: "" };

const stamp = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function AdminReports() {
  const toast = useToast();
  const [queue, setQueue] = useState<ReportGroup[] | null>(null);
  const [log, setLog] = useState<Report[]>([]);
  const [post, setPost] = useState<PostDetail | null | undefined>(undefined);
  const [pick, setPick] = useState<ReportDecision>("숨김");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const req = useRef(0);

  const load = useCallback(async () => {
    const id = ++req.current;
    setError(null);
    try {
      const [pending, handled] = await Promise.all([fetchReports("PENDING"), fetchHandledReports(10)]);
      if (id !== req.current) return;
      setQueue(groupReports(pending));
      setLog(handled);
    } catch (e) {
      if (id === req.current) setError({ status: e instanceof ApiError ? e.status : 0, message: e instanceof Error ? e.message : "신고를 불러오지 못했어요." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const group = queue?.[0];

  useEffect(() => {
    setPost(undefined);
    setPick("숨김");
    setNote("");
    if (!group) return;
    let alive = true;
    fetchReportedPost(group.postId)
      .then((p) => alive && setPost(p))
      .catch(() => alive && setPost(null));
    return () => {
      alive = false;
    };
  }, [group]);

  const submit = async () => {
    if (!group || sending) return;
    setSending(true);
    try {
      // 같은 글에 들어온 신고를 모두 같은 결과로 처리
      for (const r of group.reports) await decideReport(r.id, pick, note.trim());
      setQueue((q) => q?.slice(1) ?? null);
      setLog((l) => [
        { ...group.reports[0], status: pick, handledBy: "나", handledAt: new Date().toISOString(), note: note.trim() },
        ...l,
      ]);
      refreshAdminCounts();
      toast.show(pick === "반려" ? "신고를 반려했어요" : `글을 ${pick} 처리했어요`);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "처리하지 못했어요.");
      load();
    } finally {
      setSending(false);
    }
  };

  if (error?.status === 403) {
    return (
      <AdminShell title="신고 처리">
        <EmptyState icon="!" title="신고 처리는 Admin만 할 수 있어요" description="Leader · FA 역할은 신고 내용을 볼 수 없어요." />
      </AdminShell>
    );
  }

  return (
    <AdminShell title="신고 처리" sub="신고자는 운영진에게도 공개되지 않아요.">
      {error && (
        <div className="wd-banner danger" style={{ marginBottom: 18 }}>
          <span className="ico">!</span>
          <div>
            <b>{error.message}</b>
          </div>
          <button type="button" className="wd-btn sm" onClick={load}>
            다시 시도
          </button>
        </div>
      )}
      <div className="wd-side">
        {!queue && !error ? (
          <p className="wd-t11 wd-faint" aria-busy="true">
            신고를 불러오는 중이에요…
          </p>
        ) : group ? (
          <section className="wd-card" style={{ padding: 28 }}>
            <div className="wd-row" style={{ gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {group.reasons.map((r) => (
                <span key={r} className="wd-badge red">
                  {r}
                </span>
              ))}
              <span className="wd-badge">신고 {group.reports.length}회</span>
              {queue && queue.length > 1 && <span className="wd-t9 wd-faint">남은 신고 글 {queue.length - 1}개</span>}
            </div>
            <div className="wd-card soft" style={{ padding: 18, marginBottom: 18 }}>
              {post === undefined && <p className="wd-t10 wd-faint" aria-busy="true">게시글을 불러오는 중…</p>}
              {post === null && <p className="wd-t10 wd-faint" style={{ margin: 0 }}>게시글 #{group.postId}을 열 수 없어요. 이미 숨겨졌거나 삭제됐을 수 있어요.</p>}
              {post && (
                <>
                  <span className="wd-badge">{post.category}</span>
                  <b style={{ display: "block", margin: "10px 0 6px", fontSize: 14 }}>{post.title}</b>
                  <p className="wd-t11" style={{ margin: 0, lineHeight: 1.7, color: "var(--wd-text)", whiteSpace: "pre-wrap" }}>
                    {post.body}
                  </p>
                  <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 10 }}>
                    {post.anonymous ? "작성자 익명" : `작성자 ${post.author}`} · {post.when} ·{" "}
                    <Link href={`/inhouse/community/${post.id}`} className="wd-link">
                      글 열기
                    </Link>
                  </span>
                </>
              )}
            </div>
            {group.reports.some((r) => r.detail) && (
              <div style={{ marginBottom: 18 }}>
                <b className="wd-t10" style={{ color: "var(--wd-sub)" }}>신고 내용</b>
                {group.reports
                  .filter((r) => r.detail)
                  .map((r) => (
                    <p key={r.id} className="wd-t10" style={{ margin: "6px 0 0" }}>
                      · {r.detail}
                    </p>
                  ))}
              </div>
            )}
            <b className="wd-t10" style={{ color: "var(--wd-sub)" }}>처리 방법</b>
            <div className="wd-stack" role="radiogroup" aria-label="처리 방법" style={{ gap: 8, marginTop: 10 }}>
              {ACTIONS.map(([key, t, d]) => (
                <button
                  type="button"
                  key={key}
                  role="radio"
                  aria-checked={pick === key}
                  className="wd-row wd-t11"
                  style={{ padding: "12px 14px", border: `1px solid ${pick === key ? "var(--t-cobalt)" : "var(--wd-line)"}`, borderRadius: 12, gap: 10, background: "transparent", textAlign: "left", color: "inherit" }}
                  onClick={() => setPick(key)}
                >
                  <span className={`wd-radio ${pick === key ? "on" : ""}`} />
                  <span>
                    <b style={{ fontWeight: 620 }}>{t}</b>
                    <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 3 }}>{d}</span>
                  </span>
                </button>
              ))}
            </div>
            <label className="wd-field" style={{ marginTop: 14, marginBottom: 0 }}>
              <span>
                처리 메모 <em>선택 · 운영진만 봐요</em>
              </span>
              <input className="wd-input" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="처리한 이유를 남겨 두세요" />
            </label>
            <div className="wd-row" style={{ justifyContent: "flex-end", marginTop: 18 }}>
              <button type="button" className="wd-btn" onClick={submit} disabled={sending} aria-busy={sending}>
                {sending ? "처리 중…" : "처리 완료"}
              </button>
            </div>
          </section>
        ) : (
          !error && <EmptyState icon="✓" title="처리할 신고가 없어요" description="새 신고가 들어오면 여기에 보여요." />
        )}
        <aside className="wd-card">
          <div className="wd-card-head">
            <h3>처리 기록</h3>
          </div>
          {log.length === 0 && <p className="wd-t10 wd-faint" style={{ margin: 0 }}>아직 처리한 신고가 없어요.</p>}
          {log.map((r) => (
            <div key={r.id} className="wd-between wd-t10" style={{ padding: "9px 0", gap: 8 }}>
              <span className="wd-row" style={{ gap: 8, minWidth: 0 }}>
                <span className={`wd-badge ${TONE[r.status] ?? ""}`}>{r.status}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  #{r.postId} · {r.reason}
                </span>
              </span>
              <span className="wd-faint wd-t9" style={{ flex: "none" }}>
                {[r.handledBy, r.handledAt && stamp(r.handledAt)].filter(Boolean).join(" · ")}
              </span>
            </div>
          ))}
        </aside>
      </div>
      {toast.node}
    </AdminShell>
  );
}
