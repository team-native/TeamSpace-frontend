"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Attachments from "@/components/inhouse/Attachments";
import EmptyState from "@/components/inhouse/EmptyState";
import WdPage from "@/components/inhouse/WdPage";
import { Av, Confirm, Modal, useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import { APPROVAL_TONE, addApprovalComment, approve, cancelApproval, fetchApproval, reject, type Approval } from "@/lib/approvals";
import { useMe } from "@/lib/session";

const REJECT_REASONS = ["금액 조정이 필요해요", "증빙이 부족해요", "예산 범위를 넘어요", "직접 입력"];
const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

// GET /approvals/{id} · approve · reject · cancel · comments
export default function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { me } = useMe();
  const [approval, setApproval] = useState<Approval | null | undefined>(undefined);
  const [loadError, setLoadError] = useState("");
  const [comment, setComment] = useState("");
  const [opinion, setOpinion] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectPick, setRejectPick] = useState(REJECT_REASONS[0]);
  const [rejectText, setRejectText] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoadError("");
    try {
      setApproval(await fetchApproval(id));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setApproval(null);
      else setLoadError(errMsg(e, "결재를 불러오지 못했어요."));
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadError || approval === undefined || approval === null)
    return (
      <WdPage active="requests">
        <div className="wd-wrap wd-pb" style={{ paddingTop: 60 }}>
          {loadError ? (
            <EmptyState icon="!" title="결재를 불러오지 못했어요" description={loadError} actionLabel="다시 시도" onAction={() => void load()} />
          ) : approval === null ? (
            <EmptyState icon="?" title="결재를 찾을 수 없어요" description="기안자와 결재선에 있는 사람만 볼 수 있어요." actionLabel="결재함" onAction={() => router.push("/inhouse/requests#box")} />
          ) : (
            <div className="wd-muted wd-t11" aria-busy="true" style={{ padding: 48, textAlign: "center" }}>
              결재를 불러오는 중…
            </div>
          )}
        </div>
      </WdPage>
    );

  const myId = me?.id ?? "";
  const isAuthor = approval.authorId === myId;
  const myStep = approval.line.find((l) => l.userId === myId && l.role !== "기안");
  const myTurn = myStep?.state === "now" && ["결재 대기", "검토 중"].includes(approval.status);
  const canCancel = isAuthor && ["작성 중", "결재 대기", "검토 중"].includes(approval.status);
  const canEdit = isAuthor && ["작성 중", "반려"].includes(approval.status);
  const next = approval.line.find((l) => l.state === "wait");

  const run = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await fn();
      await load();
      toast.show(done);
    } catch (e) {
      toast.show(errMsg(e, "처리하지 못했어요."));
    } finally {
      setBusy(false);
    }
  };

  const postComment = async (text: string) => {
    const c = await addApprovalComment(approval.id, text);
    setApproval((a) => (a ? { ...a, comments: [...a.comments, c] } : a));
  };

  return (
    <WdPage active="requests">
      <div className="wd-wrap wd-pb">
        <div className="wd-crumb">
          <Link href="/inhouse/requests">결재</Link> › <Link href={`/inhouse/requests${isAuthor ? "" : "?tab=received"}#box`}>{isAuthor ? "내가 올린 결재" : "받은 결재"}</Link> › <b>{approval.title}</b>
        </div>
        <div style={{ height: 24 }} />
        <div className="wd-side">
          <div className="wd-card" style={{ padding: 28 }}>
            <div className="wd-between" style={{ marginBottom: 22, flexWrap: "wrap" }}>
              <div>
                <span className={`wd-badge ${APPROVAL_TONE[approval.status]}`}>{approval.status === "취소" ? "요청 취소" : approval.status}</span>
                <h2 style={{ margin: "12px 0 6px", fontSize: 24, letterSpacing: "-.04em" }}>{approval.title}</h2>
                <span className="wd-t10 wd-faint">{[approval.kind, approval.type, approval.author, approval.date].filter(Boolean).join(" · ")}</span>
              </div>
              <div className="wd-stat" style={{ textAlign: "right" }}>
                <small>{approval.kind === "인력 지원" ? "투입 기간" : "요청 금액"}</small>
                <strong>{approval.amount || "-"}</strong>
              </div>
            </div>

            {approval.status === "반려" && approval.rejectReason && (
              <div className="wd-banner danger" style={{ marginBottom: 22 }}>
                <span className="ico" style={{ color: "var(--t-red)" }}>!</span>
                <div>
                  <b>반려 사유</b>
                  <p>{approval.rejectReason}</p>
                </div>
              </div>
            )}

            {approval.line.length > 0 && (
              <div className="wd-card soft" style={{ padding: "18px 10px", marginBottom: 22 }}>
                <div className="wd-line">
                  {approval.line.map((l, i) => (
                    <div key={`${l.userId}-${i}`} className={l.state === "done" ? "done" : l.state === "now" ? "now" : ""}>
                      <span className="wd-av">{l.state === "done" ? "✓" : l.who.slice(1, 2) || l.who.slice(0, 1)}</span>
                      <b>
                        {l.who} · {l.role}
                      </b>
                      <small>{l.at}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <dl className="wd-kv" style={{ marginBottom: 22 }}>
              {approval.kind === "인력 지원" ? (
                <div>
                  <dt>필요 직군</dt>
                  <dd>{Object.entries(approval.staff).filter(([, n]) => n > 0).map(([r, n]) => `${r} ${n}명`).join(", ") || approval.type || "-"}</dd>
                </div>
              ) : (
                <div>
                  <dt>사용 예정일</dt>
                  <dd>{approval.useDate || "-"}</dd>
                </div>
              )}
              <div>
                <dt>연결 프로젝트</dt>
                <dd>{approval.project || "-"}</dd>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <dt>요청 사유</dt>
                <dd style={{ fontWeight: 500, lineHeight: 1.7, whiteSpace: "pre-line" }}>{approval.reason || "아직 작성하지 않았어요."}</dd>
              </div>
            </dl>

            {approval.files.length ? <Attachments files={approval.files} title="첨부파일" /> : <p className="wd-t10 wd-faint" style={{ margin: "8px 0 0" }}>첨부한 파일이 없어요.</p>}
          </div>

          <aside className="wd-stack">
            {myStep ? (
              <section className="wd-card" style={myTurn ? { borderColor: "var(--t-cobalt)", boxShadow: "0 0 0 4px #3182f614" } : undefined}>
                <div className="wd-card-head">
                  <h3>내 검토</h3>
                  <span className={`wd-badge ${myTurn ? "blue" : myStep.state === "done" ? "green" : ""}`}>{myTurn ? "내 차례" : myStep.state === "done" ? "처리 완료" : "앞 단계 대기"}</span>
                </div>
                {myTurn ? (
                  <>
                    <label className="wd-field">
                      <span>
                        검토 의견 <em>선택</em>
                      </span>
                      <textarea className="wd-input" style={{ minHeight: 90 }} value={opinion} onChange={(e) => setOpinion(e.target.value)} placeholder="승인 조건이나 참고할 내용을 남겨주세요" />
                    </label>
                    <div className="wd-row">
                      <button type="button" className="wd-btn danger" style={{ flex: 1 }} disabled={busy} onClick={() => setRejectOpen(true)}>
                        반려
                      </button>
                      <button
                        type="button"
                        className="wd-btn blue"
                        style={{ flex: 2 }}
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            if (opinion.trim()) await postComment(opinion.trim());
                            await approve(approval.id);
                            setOpinion("");
                          }, next ? "승인했어요. 다음 결재자에게 알림이 갔어요." : "최종 승인했어요.")
                        }
                      >
                        {busy ? "처리 중…" : "승인하기"}
                      </button>
                    </div>
                    <p className="wd-t9 wd-faint" style={{ margin: "10px 0 0", textAlign: "center" }}>
                      승인하면 {next?.who ?? "기안자"}님에게 {next ? "다음 단계" : "결과"} 알림이 가요
                    </p>
                  </>
                ) : (
                  <button type="button" className="wd-btn ghost full" onClick={() => router.push("/inhouse/requests?tab=received#box")}>
                    받은 결재로 돌아가기
                  </button>
                )}
              </section>
            ) : (
              isAuthor && (
                <section className="wd-card">
                  <h3 style={{ fontSize: 12 }}>요청 관리</h3>
                  <p className="wd-t9 wd-faint" style={{ margin: "6px 0 14px" }}>
                    {canEdit
                      ? approval.status === "반려"
                        ? "고쳐서 다시 올릴 수 있어요."
                        : "이어서 작성하고 올릴 수 있어요."
                      : canCancel
                        ? "검토 중인 결재는 고칠 수 없고 취소만 할 수 있어요."
                        : "처리가 끝난 결재는 바꿀 수 없어요."}
                  </p>
                  <div className="wd-row">
                    <Link
                      className="wd-btn line"
                      style={{ flex: 1, pointerEvents: canEdit ? undefined : "none", opacity: canEdit ? 1 : 0.4 }}
                      aria-disabled={!canEdit}
                      href={`/inhouse/requests/new?type=${approval.kind === "인력 지원" ? "project" : "expense"}&edit=${approval.id}`}
                    >
                      {approval.status === "반려" ? "고쳐서 다시 올리기" : "수정하기"}
                    </Link>
                    <button type="button" className="wd-btn danger" style={{ flex: 1 }} disabled={!canCancel || busy} onClick={() => setCancelOpen(true)}>
                      요청 취소
                    </button>
                  </div>
                </section>
              )
            )}

            <section className="wd-card">
              <div className="wd-card-head">
                <h3>코멘트 {approval.comments.length}</h3>
              </div>
              {approval.comments.map((c) => (
                <div key={c.id} className="wd-comment">
                  <Av name={c.who} />
                  <div>
                    <header>
                      {c.who} <small>{c.meta}</small>
                    </header>
                    <p>{c.text}</p>
                  </div>
                </div>
              ))}
              <form
                className="wd-row"
                style={{ marginTop: 8 }}
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!comment.trim()) return;
                  try {
                    await postComment(comment.trim());
                    setComment("");
                  } catch (err) {
                    toast.show(errMsg(err, "코멘트를 남기지 못했어요."));
                  }
                }}
              >
                <input className="wd-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="코멘트 남기기" />
                <button type="submit" className="wd-btn sm" disabled={!comment.trim()}>
                  등록
                </button>
              </form>
            </section>
          </aside>
        </div>
      </div>

      {rejectOpen && (
        <Modal
          eyebrow="REJECT"
          title="반려 사유를 알려주세요"
          sub="기안자에게 사유와 함께 알림이 가요."
          size="sm"
          onClose={() => setRejectOpen(false)}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => setRejectOpen(false)}>
                취소
              </button>
              <button
                type="button"
                className="wd-btn"
                style={{ background: "#f04452" }}
                disabled={busy || (rejectPick === "직접 입력" && !rejectText.trim())}
                onClick={() => {
                  const reason = rejectPick === "직접 입력" ? rejectText.trim() : `${rejectPick}${rejectText.trim() ? ` — ${rejectText.trim()}` : ""}`;
                  setRejectOpen(false);
                  void run(() => reject(approval.id, reason), "반려했어요. 기안자에게 사유가 전달됐어요.");
                }}
              >
                반려하기
              </button>
            </>
          }
        >
          <div className="wd-stack" style={{ gap: 8, marginBottom: 14 }} role="radiogroup">
            {REJECT_REASONS.map((x) => (
              <button
                type="button"
                role="radio"
                aria-checked={rejectPick === x}
                key={x}
                className="wd-row wd-t11"
                style={{ padding: "10px 12px", border: `1px solid ${rejectPick === x ? "var(--t-cobalt)" : "var(--wd-line)"}`, borderRadius: 11, background: "transparent", textAlign: "left" }}
                onClick={() => setRejectPick(x)}
              >
                <span className={`wd-radio ${rejectPick === x ? "on" : ""}`} />
                {x}
              </button>
            ))}
          </div>
          <textarea className="wd-input" style={{ minHeight: 80 }} value={rejectText} onChange={(e) => setRejectText(e.target.value)} placeholder={rejectPick === "직접 입력" ? "반려 사유를 적어주세요" : "덧붙일 말 (선택)"} />
        </Modal>
      )}

      {cancelOpen && (
        <Confirm
          title="결재 요청을 취소할까요?"
          message="취소하면 결재선에 있는 사람들에게 알림이 가고, 되돌릴 수 없어요."
          confirmLabel="요청 취소"
          danger
          onClose={() => setCancelOpen(false)}
          onConfirm={() => {
            setCancelOpen(false);
            void run(() => cancelApproval(approval.id), "결재 요청을 취소했어요.");
          }}
        />
      )}
      {toast.node}
    </WdPage>
  );
}
