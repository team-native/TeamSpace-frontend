"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import CommunityShell from "@/components/inhouse/CommunityShell";
import { Av, Eyebrow, useToast } from "@/components/inhouse/ui";
import { INQUIRIES, INQUIRY_TONE, ME, loadLocal, saveLocal, type Inquiry } from "@/lib/demo";

const KEY = "native-inhouse-inquiries";
const TYPES = ["문의", "건의", "불편 신고"];
const TARGETS = ["NativeOps", "PMO", "FA", "Leader", "잘 모르겠어요"];
const STEP_LABELS = ["접수", "검토 중", "답변 완료"] as const;
const MAX = 1000;

export default function InquiryPage() {
  return (
    <Suspense>
      <InquiryView />
    </Suspense>
  );
}

function InquiryView() {
  const params = useSearchParams();
  const toast = useToast();
  const [tab, setTab] = useState<"new" | "mine">(params.get("tab") === "mine" ? "mine" : "new");
  const [list, setList] = useState<Inquiry[]>(INQUIRIES);
  const [selectedId, setSelectedId] = useState(INQUIRIES[0].id);
  const [form, setForm] = useState({ type: "문의", dept: "", title: "", body: "", anonymous: false });
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => setList([...loadLocal<Inquiry[]>(KEY, []), ...INQUIRIES]), []);
  const selected = list.find((q) => q.id === selectedId) ?? list[0];

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
            내 문의<small>{list.length}</small>
          </button>
        </div>
      </section>

      {tab === "new" ? (
        <div className="wd-side">
          <form
            className="wd-card"
            style={{ padding: 28 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.dept) {
                toast.show("받는 부서를 골라주세요");
                return;
              }
              const now = new Date();
              const stamp = `${now.getMonth() + 1}.${String(now.getDate()).padStart(2, "0")} ${now.toTimeString().slice(0, 5)}`;
              const q: Inquiry = { id: `q-${Date.now()}`, ...form, status: "접수", date: stamp.split(" ")[0], steps: [stamp, "", ""] };
              saveLocal(KEY, [q, ...loadLocal<Inquiry[]>(KEY, [])]);
              setList([q, ...list]);
              setSelectedId(q.id);
              setForm({ type: "문의", dept: "", title: "", body: "", anonymous: false });
              setTab("mine");
              toast.show("보냈어요. 답변이 오면 알림을 드릴게요.");
            }}
          >
            <div className="wd-field">
              <span>유형</span>
              <div className="wd-seg">
                {TYPES.map((t) => (
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
              <input className="wd-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="한 줄로 요약해주세요" />
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
                  실명 · {ME.name}
                </button>
                <button type="button" className={form.anonymous ? "on" : ""} onClick={() => setForm({ ...form, anonymous: true })}>
                  익명
                </button>
              </div>
            </div>
            <div className="wd-row" style={{ justifyContent: "flex-end" }}>
              <button type="submit" className="wd-btn">
                보내기
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
      ) : (
        <div className="pf-inquiry-layout">
          <div className="wd-stack" style={{ gap: 8 }}>
            {list.map((q) => (
              <button
                type="button"
                key={q.id}
                className="wd-card"
                aria-pressed={q.id === selected.id}
                style={{ padding: 16, textAlign: "left", borderColor: q.id === selected.id ? "#3182f6" : undefined }}
                onClick={() => setSelectedId(q.id)}
              >
                <span className={`wd-badge ${INQUIRY_TONE[q.status]}`}>{q.status}</span>
                <b style={{ display: "block", margin: "10px 0 4px", fontSize: 12 }}>{q.title}</b>
                <span className="wd-t9 wd-faint">
                  {q.dept} · {q.anonymous ? "익명" : "실명"} · {q.date}
                </span>
              </button>
            ))}
          </div>
          <section className="wd-card" style={{ padding: 28 }}>
            <div className="wd-line" style={{ marginBottom: 26 }}>
              {STEP_LABELS.map((label, i) => {
                const reached = STEP_LABELS.indexOf(selected.status) >= i;
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
            <p className="wd-t11" style={{ lineHeight: 1.75, color: "#333d4b", margin: "0 0 22px", whiteSpace: "pre-line" }}>{selected.body}</p>
            {selected.answer ? (
              <>
                <div className="wd-card soft" style={{ borderLeft: "3px solid #3182f6", borderRadius: 14 }}>
                  <div className="wd-row" style={{ gap: 8, marginBottom: 10 }}>
                    <Av name={selected.answer.who.split(" ").pop() ?? ""} id={selected.answer.whoId} size="sm" />
                    <b className="wd-t11">{selected.answer.who}</b>
                    <span className="wd-t9 wd-faint">답변 · {selected.answer.at}</span>
                  </div>
                  <p className="wd-t11" style={{ lineHeight: 1.75, margin: 0, color: "#333d4b" }}>{selected.answer.text}</p>
                </div>
                <div className="wd-row" style={{ marginTop: 18, gap: 6, flexWrap: "wrap" }}>
                  <span className="wd-t10 wd-muted">답변이 도움이 됐나요?</span>
                  {["네, 해결됐어요", "추가로 물어볼게요"].map((f) => (
                    <button
                      type="button"
                      key={f}
                      className={`wd-chip ${feedback[selected.id] === f ? "bon" : ""}`}
                      onClick={() => {
                        setFeedback({ ...feedback, [selected.id]: f });
                        if (f === "추가로 물어볼게요") {
                          setForm({ ...form, dept: selected.dept, title: `Re: ${selected.title}` });
                          setTab("new");
                        } else toast.show("고마워요! 답변자에게 전달했어요.");
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="wd-banner gray">
                <span className="ico">…</span>
                <div>
                  <b>{selected.status === "접수" ? "담당 부서에 전달됐어요" : "담당자가 확인하고 있어요"}</b>
                  <p>답변이 오면 알림으로 알려드려요.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
      {toast.node}
    </CommunityShell>
  );
}
