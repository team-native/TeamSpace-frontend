"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/inhouse/AdminShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { Modal, useToast } from "@/components/inhouse/ui";
import { DEPARTMENTS, INQUIRIES, INQUIRY_TONE, ME, type Inquiry, type InquiryStatus } from "@/lib/demo";

const TABS: [string, InquiryStatus[]][] = [
  ["대기", ["접수"]],
  ["검토 중", ["검토 중"]],
  ["완료", ["답변 완료"]],
];
const STATUSES: InquiryStatus[] = ["접수", "검토 중", "답변 완료"];
const QUICK = ["확인 후 다시 안내드릴게요.", "문서함의 관련 기준을 확인해 주세요."];

export default function AdminInquiries() {
  const toast = useToast();
  const [items, setItems] = useState<Inquiry[]>(INQUIRIES);
  const [tab, setTab] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [answer, setAnswer] = useState("");
  const [moving, setMoving] = useState(false);
  const [dept, setDept] = useState("");

  // 대시보드에서 ?id= 로 들어오면 그 문의를 열어줌
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("id");
    const found = INQUIRIES.find((q) => q.id === id);
    if (found) {
      setTab(TABS.findIndex(([, s]) => s.includes(found.status)));
      setSelectedId(found.id);
    }
  }, []);

  const list = items.filter((q) => TABS[tab][1].includes(q.status));
  const selected = items.find((q) => q.id === selectedId) ?? list[0];
  const update = (id: string, patch: Partial<Inquiry>) => setItems((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  return (
    <AdminShell title="받은 문의" sub="익명 문의는 작성자가 보이지 않아요.">
      <div className="wd-grid" style={{ gridTemplateColumns: "minmax(260px,340px) 1fr", alignItems: "start" }}>
        <div className="wd-stack" style={{ gap: 8 }}>
          <div className="wd-tabs" style={{ marginBottom: 6 }}>
            {TABS.map(([name, s], i) => (
              <button type="button" key={name} className={tab === i ? "on" : ""} onClick={() => { setTab(i); setSelectedId(""); }}>
                {name}
                <small>{items.filter((q) => s.includes(q.status)).length}</small>
              </button>
            ))}
          </div>
          {list.map((q) => (
            <button
              type="button"
              key={q.id}
              className="wd-card"
              style={{ padding: 16, textAlign: "left", borderColor: q.id === selected?.id ? "#3182f6" : undefined }}
              onClick={() => { setSelectedId(q.id); setAnswer(""); }}
            >
              <span className={`wd-badge ${INQUIRY_TONE[q.status]}`}>{q.status}</span>
              <b style={{ display: "block", margin: "10px 0 4px", fontSize: 12 }}>{q.title}</b>
              <span className="wd-t9 wd-faint">
                {q.dept} · {q.anonymous ? "익명" : "실명"} · {q.date}
              </span>
            </button>
          ))}
          {list.length === 0 && <EmptyState icon="✓" title="여기는 비어 있어요" description="다른 탭을 확인해 보세요." />}
        </div>

        {selected && (
          <section className="wd-card" style={{ padding: 28 }}>
            <div className="wd-between" style={{ gap: 12, flexWrap: "wrap" }}>
              <span className="wd-t9 wd-faint">
                {selected.type} · {selected.dept} · {selected.anonymous ? "익명" : "실명"} · {selected.steps[0] || selected.date}
              </span>
              <div className="wd-seg" role="radiogroup" aria-label="상태" style={{ width: 280 }}>
                {STATUSES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    role="radio"
                    aria-checked={selected.status === s}
                    className={selected.status === s ? "on" : ""}
                    onClick={() => {
                      update(selected.id, { status: s });
                      toast.show(`상태를 '${s}'(으)로 바꿨어요`);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <h2 style={{ margin: "14px 0 10px", fontSize: 20, letterSpacing: "-.04em" }}>{selected.title}</h2>
            <p className="wd-t11" style={{ lineHeight: 1.75, color: "var(--wd-text)", margin: "0 0 22px" }}>{selected.body}</p>

            {selected.answer ? (
              <div className="wd-card soft" style={{ padding: 18 }}>
                <span className="wd-t9 wd-faint">
                  {selected.answer.who} · {selected.answer.at}
                </span>
                <p className="wd-t11" style={{ margin: "8px 0 0", lineHeight: 1.75 }}>{selected.answer.text}</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!answer.trim()) return;
                  update(selected.id, { status: "답변 완료", answer: { who: `${ME.dept} ${ME.name}`, whoId: ME.id, at: "방금", text: answer.trim() } });
                  setAnswer("");
                  toast.show("답변을 보냈어요");
                }}
              >
                <label className="wd-field">
                  <span>
                    답변 <em>{ME.dept} {ME.name} 이름으로 보내져요</em>
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
                  <div className="wd-row">
                    <button type="button" className="wd-btn ghost" onClick={() => setMoving(true)}>
                      다른 부서로 넘기기
                    </button>
                    <button type="submit" className="wd-btn" disabled={!answer.trim()}>
                      답변 보내기
                    </button>
                  </div>
                </div>
              </form>
            )}
          </section>
        )}
      </div>

      {moving && selected && (
        <Modal
          eyebrow="INQUIRY"
          title="다른 부서로 넘기기"
          size="sm"
          onClose={() => setMoving(false)}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => setMoving(false)}>
                취소
              </button>
              <button
                type="button"
                className="wd-btn"
                disabled={!dept || dept === selected.dept}
                onClick={() => {
                  update(selected.id, { dept });
                  toast.show(`${dept}로 넘겼어요`);
                  setDept("");
                  setMoving(false);
                }}
              >
                넘기기
              </button>
            </>
          }
        >
          <label className="wd-field" style={{ marginBottom: 0 }}>
            <span>받을 부서</span>
            <select className="wd-input" value={dept} onChange={(e) => setDept(e.target.value)}>
              <option value="">선택해 주세요</option>
              {DEPARTMENTS.filter((d) => d !== selected.dept).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </Modal>
      )}
      {toast.node}
    </AdminShell>
  );
}
