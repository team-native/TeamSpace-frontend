"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminShell, { refreshAdminCounts } from "@/components/inhouse/AdminShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import { answerInquiry, fetchAdminInquiries, setInquiryStatus } from "@/lib/admin-api";
import { INQUIRY_TONE, addInquiryReply, stamp, type Inquiry, type InquiryStatus } from "@/lib/inquiries";
import { useMe } from "@/lib/session";

const TABS: [string, InquiryStatus[]][] = [
  ["대기", ["접수"]],
  ["검토 중", ["검토 중"]],
  ["완료", ["답변 완료", "해결됨"]],
];
const STATUSES: InquiryStatus[] = ["접수", "검토 중", "답변 완료", "해결됨"];
const QUICK = ["확인 후 다시 안내드릴게요.", "문서함의 관련 기준을 확인해 주세요."];

export default function AdminInquiries() {
  const toast = useToast();
  const { me } = useMe();
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [tab, setTab] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [answer, setAnswer] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const req = useRef(0);

  const load = useCallback(async () => {
    const id = ++req.current;
    setError(null);
    try {
      const list = await fetchAdminInquiries(undefined, 300);
      if (id !== req.current) return;
      setItems(list);
      // 대시보드에서 ?id= 로 들어오면 그 문의를 열어줌
      const want = new URLSearchParams(location.search).get("id");
      const found = list.find((q) => q.id === want);
      if (found) {
        setTab(Math.max(0, TABS.findIndex(([, s]) => s.includes(found.status))));
        setSelectedId(found.id);
      }
    } catch (e) {
      if (id === req.current) setError({ status: e instanceof ApiError ? e.status : 0, message: e instanceof Error ? e.message : "문의를 불러오지 못했어요." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const all = items ?? [];
  const list = all.filter((q) => TABS[tab][1].includes(q.status));
  const selected = all.find((q) => q.id === selectedId) ?? list[0];
  const update = (id: string, patch: Partial<Inquiry>) => setItems((qs) => qs?.map((q) => (q.id === id ? { ...q, ...patch } : q)) ?? null);

  const changeStatus = async (q: Inquiry, s: InquiryStatus) => {
    if (busy || q.status === s) return;
    setBusy(true);
    try {
      await setInquiryStatus(q.id, s);
      update(q.id, { status: s });
      refreshAdminCounts();
      toast.show(`상태를 '${s}'(으)로 바꿨어요`);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "상태를 바꾸지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  const sendAnswer = async (q: Inquiry) => {
    const text = answer.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const r = await answerInquiry(q.id, text);
      update(q.id, { status: "답변 완료", answer: { who: r.answer.who, at: stamp(r.answer.at), text: r.answer.text } });
      setAnswer("");
      refreshAdminCounts();
      toast.show("답변을 보냈어요");
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "답변을 보내지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async (q: Inquiry) => {
    const text = reply.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const r = await addInquiryReply(q.id, text);
      update(q.id, { replies: [...q.replies, r] });
      setReply("");
      toast.show("메시지를 보냈어요");
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "메시지를 보내지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  if (error?.status === 403) {
    return (
      <AdminShell title="받은 문의">
        <EmptyState icon="!" title="문의를 볼 권한이 없어요" description="Admin이거나 담당 부서가 있어야 해요. 프로필의 부서를 확인해 주세요." />
      </AdminShell>
    );
  }

  return (
    <AdminShell title="받은 문의" sub="익명 문의는 작성자가 보이지 않아요. Admin이 아니면 내 부서 문의만 보여요.">
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
      {!items && !error && (
        <p className="wd-t11 wd-faint" aria-busy="true">
          문의를 불러오는 중이에요…
        </p>
      )}
      {items && (
        <div className="wd-grid" style={{ gridTemplateColumns: "minmax(260px,340px) 1fr", alignItems: "start" }}>
          <div className="wd-stack" style={{ gap: 8 }}>
            <div className="wd-tabs" style={{ marginBottom: 6 }}>
              {TABS.map(([name, s], i) => (
                <button
                  type="button"
                  key={name}
                  className={tab === i ? "on" : ""}
                  onClick={() => {
                    setTab(i);
                    setSelectedId("");
                  }}
                >
                  {name}
                  <small>{all.filter((q) => s.includes(q.status)).length}</small>
                </button>
              ))}
            </div>
            {list.map((q) => (
              <button
                type="button"
                key={q.id}
                className="wd-card"
                style={{ padding: 16, textAlign: "left", borderColor: q.id === selected?.id ? "var(--t-cobalt)" : undefined }}
                onClick={() => {
                  setSelectedId(q.id);
                  setAnswer("");
                  setReply("");
                }}
              >
                <span className={`wd-badge ${INQUIRY_TONE[q.status]}`}>{q.status}</span>
                <b style={{ display: "block", margin: "10px 0 4px", fontSize: 12 }}>{q.title}</b>
                <span className="wd-t9 wd-faint">{[q.dept, q.anonymous ? "익명" : "실명", q.date].filter(Boolean).join(" · ")}</span>
              </button>
            ))}
            {list.length === 0 && <EmptyState icon="✓" title="여기는 비어 있어요" description="다른 탭을 확인해 보세요." />}
          </div>

          {selected && (
            <section className="wd-card" style={{ padding: 28 }}>
              <div className="wd-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <span className="wd-t9 wd-faint">
                  {[selected.type, selected.dept, selected.anonymous ? "익명" : "실명", selected.steps[0] || selected.date].filter(Boolean).join(" · ")}
                </span>
                <div className="wd-seg" role="radiogroup" aria-label="상태" style={{ width: 340 }}>
                  {STATUSES.map((s) => (
                    <button
                      type="button"
                      key={s}
                      role="radio"
                      aria-checked={selected.status === s}
                      className={selected.status === s ? "on" : ""}
                      disabled={busy}
                      onClick={() => changeStatus(selected, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <h2 style={{ margin: "14px 0 10px", fontSize: 20, letterSpacing: "-.04em" }}>{selected.title}</h2>
              <p className="wd-t11" style={{ lineHeight: 1.75, color: "var(--wd-text)", margin: "0 0 22px", whiteSpace: "pre-wrap" }}>
                {selected.body}
              </p>

              {selected.answer ? (
                <div className="wd-card soft" style={{ padding: 18 }}>
                  <span className="wd-t9 wd-faint">
                    {selected.answer.who} · {selected.answer.at}
                  </span>
                  <p className="wd-t11" style={{ margin: "8px 0 0", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{selected.answer.text}</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendAnswer(selected);
                  }}
                >
                  <label className="wd-field">
                    <span>
                      답변 <em>{[me?.dept, me?.name].filter(Boolean).join(" ")} 이름으로 보내져요</em>
                    </span>
                    <textarea className="wd-input" required value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="답변을 적어주세요" />
                  </label>
                  <div className="wd-between" style={{ gap: 12, flexWrap: "wrap" }}>
                    <div className="wd-chips">
                      {QUICK.map((t) => (
                        <button type="button" key={t} className="wd-chip" onClick={() => setAnswer((a) => (a ? `${a}\n${t}` : t))}>
                          + {t.slice(0, 10)}…
                        </button>
                      ))}
                    </div>
                    <button type="submit" className="wd-btn" disabled={!answer.trim() || busy} aria-busy={busy}>
                      {busy ? "보내는 중…" : "답변 보내기"}
                    </button>
                  </div>
                </form>
              )}

              {selected.replies.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <b className="wd-t10" style={{ color: "var(--wd-sub)" }}>이어진 대화</b>
                  {selected.replies.map((r, i) => (
                    <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--wd-line)" }}>
                      <span className="wd-t9 wd-faint">
                        {r.who} · {r.at}
                      </span>
                      <p className="wd-t11" style={{ margin: "4px 0 0", whiteSpace: "pre-wrap" }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
              {selected.answer && selected.status !== "해결됨" && (
                <form
                  className="wd-row"
                  style={{ gap: 8, marginTop: 14 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendReply(selected);
                  }}
                >
                  <input className="wd-input" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="추가로 안내할 내용" maxLength={1000} />
                  <button type="submit" className="wd-btn line" disabled={!reply.trim() || busy}>
                    보내기
                  </button>
                </form>
              )}
            </section>
          )}
        </div>
      )}
      {toast.node}
    </AdminShell>
  );
}
