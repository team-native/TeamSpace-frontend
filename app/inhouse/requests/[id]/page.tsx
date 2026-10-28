"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import WdPage from "@/components/inhouse/WdPage";
import { Av, Confirm, Modal, useToast } from "@/components/inhouse/ui";
import { APPROVALS, APPROVAL_TONE, ME, type Approval } from "@/lib/demo";

const REJECT_REASONS = ["금액 조정이 필요해요", "증빙이 부족해요", "예산 범위를 넘어요", "직접 입력"];

export default function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const found = APPROVALS.find((a) => a.id === id);
  const [approval, setApproval] = useState<Approval | undefined>(found);
  const [comment, setComment] = useState("");
  const [opinion, setOpinion] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectPick, setRejectPick] = useState(REJECT_REASONS[0]);
  const [rejectText, setRejectText] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [decided, setDecided] = useState<"" | "승인" | "반려" | "취소">("");

  if (!approval) return notFound();
  const myTurn = approval.received && !decided;
  const canManage = !approval.received && !["승인", "반려"].includes(approval.status) && !decided;

  const addComment = (text: string) =>
    setApproval({ ...approval, comments: [...approval.comments, { who: ME.name, whoId: ME.id, meta: "방금", text }] });

  return (
    <WdPage active="requests">
      <div className="wd-wrap wd-pb">
        <div className="wd-crumb">
          <Link href="/inhouse/requests">결재</Link> › <Link href={`/inhouse/requests${approval.received ? "?tab=received" : ""}#box`}>{approval.received ? "받은 결재" : "내가 올린 결재"}</Link> › <b>{approval.title}</b>
        </div>
        <div style={{ height: 24 }} />
        <div className="wd-side">
          <div className="wd-card" style={{ padding: 28 }}>
            <div className="wd-between" style={{ marginBottom: 22, flexWrap: "wrap" }}>
              <div>
                <span className={`wd-badge ${decided === "승인" ? "green" : decided ? "red" : APPROVAL_TONE[approval.status]}`}>
                  {decided ? (decided === "취소" ? "요청 취소" : decided) : approval.status}
                </span>
                <h2 style={{ margin: "12px 0 6px", fontSize: 24, letterSpacing: "-.04em" }}>{approval.title}</h2>
                <span className="wd-t10 wd-faint">
                  {approval.kind} · {approval.type} · {approval.author} · {approval.date}
                </span>
              </div>
              <div className="wd-stat" style={{ textAlign: "right" }}>
                <small>{approval.kind === "비용 승인" ? "요청 금액" : "투입 기간"}</small>
                <strong>{approval.amount}</strong>
              </div>
            </div>

            {approval.status === "반려" && approval.rejectReason && (
              <div className="wd-banner danger" style={{ marginBottom: 22 }}>
                <span className="ico" style={{ color: "#f04452" }}>!</span>
                <div>
                  <b>반려 사유</b>
                  <p>{approval.rejectReason}</p>
                </div>
              </div>
            )}

            <div className="wd-card soft" style={{ padding: "18px 10px", marginBottom: 22 }}>
              <div className="wd-line">
                {approval.line.map((l) => {
                  const state = decided === "승인" && l.state === "now" ? "done" : l.state;
                  return (
                    <div key={l.role} className={state === "done" ? "done" : state === "now" ? "now" : ""}>
                      <span className="wd-av">{state === "done" ? "✓" : l.who.slice(1, 2)}</span>
                      <b>
                        {l.who} · {l.role}
                      </b>
                      <small>{state === "done" && decided === "승인" && l.state === "now" ? "방금 승인" : l.at}</small>
                    </div>
                  );
                })}
              </div>
            </div>

            <dl className="wd-kv" style={{ marginBottom: 22 }}>
              <div><dt>{approval.kind === "비용 승인" ? "사용 예정일" : "투입 기간"}</dt><dd>{approval.useDate}</dd></div>
              <div><dt>연결 프로젝트</dt><dd>{approval.project}</dd></div>
              <div style={{ gridColumn: "1/-1" }}>
                <dt>요청 사유</dt>
                <dd style={{ fontWeight: 500, lineHeight: 1.7 }}>{approval.reason || "아직 작성하지 않았어요."}</dd>
              </div>
            </dl>

            <b className="wd-t10" style={{ color: "#4e5968" }}>첨부파일 {approval.files.length}</b>
            {approval.files.length ? (
              <div className="wd-grid g2" style={{ marginTop: 10 }}>
                {approval.files.map(([ext, name, size]) => (
                  <div key={name} className="wd-file">
                    <span className={`ext ${ext === "JPG" ? "img" : ""}`}>{ext}</span>
                    <div>
                      <b>{name}</b>
                      <small>{size}</small>
                    </div>
                    <span className="end">↓</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="wd-t10 wd-faint" style={{ margin: "8px 0 0" }}>첨부한 파일이 없어요.</p>
            )}
          </div>

          <aside className="wd-stack">
            {approval.received ? (
              <section className="wd-card" style={myTurn ? { borderColor: "#3182f6", boxShadow: "0 0 0 4px #3182f614" } : undefined}>
                <div className="wd-card-head">
                  <h3>내 검토</h3>
                  <span className={`wd-badge ${myTurn ? "blue" : decided === "승인" ? "green" : "red"}`}>{myTurn ? "내 차례" : `${decided} 완료`}</span>
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
                      <button type="button" className="wd-btn danger" style={{ flex: 1 }} onClick={() => setRejectOpen(true)}>
                        반려
                      </button>
                      <button
                        type="button"
                        className="wd-btn blue"
                        style={{ flex: 2 }}
                        onClick={() => {
                          if (opinion.trim()) addComment(opinion.trim());
                          setDecided("승인");
                          toast.show("승인했어요. 다음 결재자에게 알림이 갔어요.");
                        }}
                      >
                        승인하기
                      </button>
                    </div>
                    <p className="wd-t9 wd-faint" style={{ margin: "10px 0 0", textAlign: "center" }}>
                      승인하면 {approval.line.find((l) => l.state === "wait")?.who ?? "기안자"}님에게 다음 단계 알림이 가요
                    </p>
                  </>
                ) : (
                  <button type="button" className="wd-btn ghost full" onClick={() => router.push("/inhouse/requests?tab=received#box")}>
                    받은 결재로 돌아가기
                  </button>
                )}
              </section>
            ) : (
              <section className="wd-card">
                <h3 style={{ fontSize: 12 }}>요청 관리</h3>
                <p className="wd-t9 wd-faint" style={{ margin: "6px 0 14px" }}>
                  {canManage ? "최종 승인 전까지 수정하거나 취소할 수 있어요." : "처리가 끝난 결재는 수정할 수 없어요."}
                </p>
                <div className="wd-row">
                  <Link
                    className="wd-btn line"
                    style={{ flex: 1, pointerEvents: canManage ? undefined : "none", opacity: canManage ? 1 : 0.4 }}
                    href={`/inhouse/requests/new?type=${approval.kind === "비용 승인" ? "expense" : "project"}&edit=${approval.id}`}
                  >
                    수정하기
                  </Link>
                  <button type="button" className="wd-btn danger" style={{ flex: 1 }} disabled={!canManage} onClick={() => setCancelOpen(true)}>
                    요청 취소
                  </button>
                </div>
              </section>
            )}

            <section className="wd-card">
              <div className="wd-card-head">
                <h3>코멘트 {approval.comments.length}</h3>
              </div>
              {approval.comments.map((c, i) => (
                <div key={i} className="wd-comment">
                  <Av name={c.who} id={c.whoId} />
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
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!comment.trim()) return;
                  addComment(comment.trim());
                  setComment("");
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
                disabled={rejectPick === "직접 입력" && !rejectText.trim()}
                onClick={() => {
                  addComment(`[반려] ${rejectPick === "직접 입력" ? rejectText : rejectPick}${rejectText && rejectPick !== "직접 입력" ? ` — ${rejectText}` : ""}`);
                  setDecided("반려");
                  setRejectOpen(false);
                  toast.show("반려했어요. 기안자에게 사유가 전달됐어요.");
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
                style={{ padding: "10px 12px", border: `1px solid ${rejectPick === x ? "#3182f6" : "var(--wd-line)"}`, borderRadius: 11, background: "transparent", textAlign: "left" }}
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
            setDecided("취소");
            setCancelOpen(false);
            toast.show("결재 요청을 취소했어요.");
          }}
        />
      )}
      {toast.node}
    </WdPage>
  );
}
