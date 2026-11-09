"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import CommunityShell from "@/components/inhouse/CommunityShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { Av, Eyebrow, useToast } from "@/components/inhouse/ui";
import {
  INQUIRY_STEPS,
  INQUIRY_TONE,
  INQUIRY_TYPES,
  addInquiryReply,
  createInquiry,
  fetchInquiries,
  resolveInquiry,
  type Inquiry,
} from "@/lib/inquiries";
import { useMe } from "@/lib/session";

const TARGETS = ["NativeOps", "PMO", "FA", "Leader", "잘 모르겠어요"];
// 받는 부서를 모르면 운영(NativeOps)이 받아서 넘긴다
const UNKNOWN_TARGET = "NativeOps";
const MAX = 1000;
const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

export default function InquiryPage() {
  return (
    <Suspense>
      <InquiryView />
    </Suspense>
  );
}

// 문의 작성 POST /inquiries · 내 문의 GET /inquiries · 해결 확인 · 추가 문의
function InquiryView() {
  const params = useSearchParams();
  const toast = useToast();
  const { me } = useMe();
  const [tab, setTab] = useState<"new" | "mine">(params.get("tab") === "mine" ? "mine" : "new");
  const [list, setList] = useState<Inquiry[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState(params.get("id") ?? "");
  const [form, setForm] = useState({ type: "문의", dept: "", title: "", body: "", anonymous: false });
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [reply, setReply] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const page = await fetchInquiries();
      setList(page.items);
      setCursor(page.nextCursor);
    } catch (e) {
      setLoadError(errMsg(e, "문의를 불러오지 못했어요."));
      setList([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const items = list ?? [];
  const selected = items.find((q) => q.id === selectedId) ?? items[0];
  const update = (q: Inquiry) => setList((prev) => (prev ?? []).map((x) => (x.id === q.id ? q : x)));

  const more = async () => {
    if (!cursor) return;
    try {
      const page = await fetchInquiries(cursor);
      setList((prev) => [...(prev ?? []), ...page.items]);
      setCursor(page.nextCursor);
    } catch (e) {
      toast.show(errMsg(e, "문의를 더 불러오지 못했어요."));
    }
  };

  return (
    <CommunityShell>
      <section className="wd-hero sm">
        <div>
          <Eyebrow>INQUIRY</Eyebrow>
          <h1>{tab === "new" ? "문의 · 건의" : "내 문의"}</h1>
          <p>운영진에게 바로 묻고, 팀에 바라는 점을 남겨요.</p>
        </div>
        <div className="wd-tabs">
          <button type="button" className={tab === "new" ? "on" : ""} onClick={() => setTab("new")}>
            새로 작성
          </button>
          <button type="button" className={tab === "mine" ? "on" : ""} onClick={() => setTab("mine")}>
            내 문의<small>{list ? `${items.length}${cursor ? "+" : ""}` : "…"}</small>
          </button>
        </div>
      </section>

      {tab === "new" ? (
        <div className="wd-side">
          <form
            className="wd-card"
            style={{ padding: 28 }}
            onSubmit={async (e) => {
              e.preventDefault();
              if (sending) return;
              setFormError("");
              if (!form.dept) {
                setFormError("받는 부서를 골라주세요.");
                return;
              }
              setSending(true);
              try {
                const dept = form.dept === "잘 모르겠어요" ? UNKNOWN_TARGET : form.dept;
                const { id } = await createInquiry({ ...form, dept, title: form.title.trim(), body: form.body.trim() });
                await load();
                setSelectedId(id);
                setForm({ type: "문의", dept: "", title: "", body: "", anonymous: false });
                setTab("mine");
                toast.show("보냈어요. 답변이 오면 알림을 드릴게요.");
              } catch (err) {
                setFormError(errMsg(err, "문의를 보내지 못했어요."));
              } finally {
                setSending(false);
              }
            }}
          >
            <div className="wd-field">
              <span>유형</span>
              <div className="wd-seg">
                {INQUIRY_TYPES.map((t) => (
                  <button type="button" key={t} className={form.type === t ? "on" : ""} onClick={() => setForm({ ...form, type: t })}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="wd-field">
              <span>받는 부서</span>
              <div className="wd-chips" role="radiogroup">
                {TARGETS.map((d) => (
                  <button type="button" role="radio" aria-checked={form.dept === d} key={d} className={`wd-chip ${form.dept === d ? "bon" : ""}`} onClick={() => setForm({ ...form, dept: d })}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <label className="wd-field">
              <span>제목</span>
              <input className="wd-input" required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="한 줄로 요약해주세요" />
            </label>
            <label className="wd-field">
              <span>
                내용 <em>{form.body.length.toLocaleString()} / {MAX.toLocaleString()}</em>
              </span>
              <textarea className="wd-input" required maxLength={MAX} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="상황과 궁금한 점을 자세히 적을수록 답이 빨라요" />
            </label>
            <div className="wd-field">
              <span>작성자 표시</span>
              <div className="wd-seg">
                <button type="button" className={!form.anonymous ? "on" : ""} onClick={() => setForm({ ...form, anonymous: false })}>
                  실명 · {me?.name}
                </button>
                <button type="button" className={form.anonymous ? "on" : ""} onClick={() => setForm({ ...form, anonymous: true })}>
                  익명
                </button>
              </div>
            </div>
            {formError && (
              <div className="wd-banner danger" role="alert" style={{ padding: "12px 14px", marginBottom: 14 }}>
                <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>!</span>
                <p style={{ margin: 0 }}>{formError}</p>
              </div>
            )}
            <div className="wd-row" style={{ justifyContent: "flex-end" }}>
              <button type="submit" className="wd-btn" disabled={sending}>
                {sending ? "보내는 중…" : "보내기"}
              </button>
            </div>
          </form>
          <aside className="wd-card soft">
            <h3 style={{ fontSize: 12 }}>익명으로 보내면</h3>
            <p className="wd-t10 wd-muted" style={{ lineHeight: 1.7, margin: "8px 0 0" }}>
              받는 부서도 작성자를 볼 수 없어요. 답변은 &lsquo;내 문의&rsquo;에서 확인할 수 있고, 답변이 오면 알림을 드려요.
            </p>
          </aside>
        </div>
      ) : list === null ? (
        <div className="wd-muted wd-t11" aria-busy="true" style={{ padding: 48, textAlign: "center" }}>
          문의를 불러오는 중…
        </div>
      ) : loadError ? (
        <EmptyState icon="!" title="문의를 불러오지 못했어요" description={loadError} actionLabel="다시 시도" onAction={() => void load()} />
      ) : !selected ? (
        <EmptyState icon="✎" title="아직 보낸 문의가 없어요" description="궁금한 점이나 바라는 점을 운영진에게 보내보세요." actionLabel="새로 작성" onAction={() => setTab("new")} />
      ) : (
        <div className="pf-inquiry-layout">
          <div className="wd-stack" style={{ gap: 8 }}>
            {items.map((q) => (
              <button
                type="button"
                key={q.id}
                className="wd-card"
                aria-pressed={q.id === selected.id}
                style={{ padding: 16, textAlign: "left", borderColor: q.id === selected.id ? "var(--t-cobalt)" : undefined }}
                onClick={() => {
                  setSelectedId(q.id);
                  setReplyOpen(false);
                }}
              >
                <span className={`wd-badge ${INQUIRY_TONE[q.status]}`}>{q.status}</span>
                <b style={{ display: "block", margin: "10px 0 4px", fontSize: 12 }}>{q.title}</b>
                <span className="wd-t9 wd-faint">
                  {q.dept} · {q.anonymous ? "익명" : "실명"} · {q.date}
                </span>
              </button>
            ))}
            {cursor && (
              <button type="button" className="wd-btn line sm" onClick={() => void more()}>
                더 보기
              </button>
            )}
          </div>
          <section className="wd-card" style={{ padding: 28 }}>
            <div className="wd-line" style={{ marginBottom: 26 }}>
              {INQUIRY_STEPS.map((label, i) => {
                const level = selected.status === "해결됨" ? 2 : INQUIRY_STEPS.indexOf(selected.status as (typeof INQUIRY_STEPS)[number]);
                const reached = level >= i;
                return (
                  <div key={label} className={reached ? "done" : ""}>
                    <span className="wd-av">{reached ? "✓" : i + 1}</span>
                    <b>{label}</b>
                    <small>{selected.steps[i] || "—"}</small>
                  </div>
                );
              })}
            </div>
            <span className="wd-t9 wd-faint">
              {selected.type} · {selected.dept} · {selected.anonymous ? "익명" : "실명"}
            </span>
            <h2 style={{ margin: "8px 0 10px", fontSize: 20, letterSpacing: "-.04em" }}>{selected.title}</h2>
            <p className="wd-t11" style={{ lineHeight: 1.75, color: "var(--t-text)", margin: "0 0 22px", whiteSpace: "pre-line" }}>{selected.body}</p>
            {selected.answer ? (
              <div className="wd-card soft" style={{ borderLeft: "3px solid var(--t-cobalt)", borderRadius: 14 }}>
                <div className="wd-row" style={{ gap: 8, marginBottom: 10 }}>
                  <Av name={selected.answer.who} size="sm" />
                  <b className="wd-t11">{selected.answer.who}</b>
                  <span className="wd-t9 wd-faint">답변 · {selected.answer.at}</span>
                </div>
                <p className="wd-t11" style={{ lineHeight: 1.75, margin: 0, color: "var(--t-text)", whiteSpace: "pre-line" }}>{selected.answer.text}</p>
              </div>
            ) : (
              <div className="wd-banner gray">
                <span className="ico">…</span>
                <div>
                  <b>{selected.status === "접수" ? "담당 부서에 전달됐어요" : "담당자가 확인하고 있어요"}</b>
                  <p>답변이 오면 알림으로 알려드려요.</p>
                </div>
              </div>
            )}
            {selected.replies.length > 0 && (
              <div className="wd-stack" style={{ gap: 8, marginTop: 14 }}>
                {selected.replies.map((r, i) => (
                  <div key={i} className="wd-card soft" style={{ padding: 14, borderRadius: 12 }}>
                    <div className="wd-t9 wd-faint" style={{ marginBottom: 6 }}>
                      {r.who} · {r.at}
                    </div>
                    <p className="wd-t11" style={{ margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>{r.text}</p>
                  </div>
                ))}
              </div>
            )}
            {selected.status === "해결됨" ? (
              <p className="wd-t10 wd-muted" style={{ marginTop: 18 }}>✓ 해결된 문의예요.</p>
            ) : (
              selected.answer && (
                <div className="wd-row" style={{ marginTop: 18, gap: 6, flexWrap: "wrap" }}>
                  <span className="wd-t10 wd-muted">답변이 도움이 됐나요?</span>
                  <button
                    type="button"
                    className="wd-chip"
                    onClick={async () => {
                      try {
                        await resolveInquiry(selected.id);
                        update({ ...selected, status: "해결됨" });
                        toast.show("고마워요! 해결된 문의로 바꿨어요.");
                      } catch (e) {
                        toast.show(errMsg(e, "상태를 바꾸지 못했어요."));
                      }
                    }}
                  >
                    네, 해결됐어요
                  </button>
                  <button type="button" className={`wd-chip ${replyOpen ? "bon" : ""}`} onClick={() => setReplyOpen((v) => !v)}>
                    추가로 물어볼게요
                  </button>
                </div>
              )
            )}
            {replyOpen && selected.status !== "해결됨" && (
              <form
                className="wd-row"
                style={{ marginTop: 12, gap: 8 }}
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!reply.trim()) return;
                  try {
                    const r = await addInquiryReply(selected.id, reply.trim());
                    update({ ...selected, replies: [...selected.replies, r] });
                    setReply("");
                    setReplyOpen(false);
                    toast.show("추가 문의를 보냈어요.");
                  } catch (err) {
                    toast.show(errMsg(err, "보내지 못했어요."));
                  }
                }}
              >
                <input className="wd-input" style={{ flex: 1 }} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="더 궁금한 점을 적어주세요" />
                <button type="submit" className="wd-btn" disabled={!reply.trim()}>
                  보내기
                </button>
              </form>
            )}
          </section>
        </div>
      )}
      {toast.node}
    </CommunityShell>
  );
}
