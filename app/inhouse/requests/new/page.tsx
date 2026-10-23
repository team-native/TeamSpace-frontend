"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import WdPage from "@/components/inhouse/WdPage";
import { Eyebrow, useToast } from "@/components/inhouse/ui";
import { APPROVALS, DOCS, DRAFTS_KEY, EXPENSE_TYPES, PROJECTS, STAFF_ROLES, loadLocal, saveLocal, type Approval } from "@/lib/demo";
import { won } from "@/lib/inhouse";

type Form = {
  id: string;
  kind: "expense" | "project";
  type: string;
  title: string;
  amount: string;
  useDate: string;
  project: string;
  reason: string;
  files: { name: string; size: string }[];
  staff: Record<string, number>;
  period: string;
};

const MAX_REASON = 500;
const FA_LIMIT = 300000;

const blank = (kind: Form["kind"]): Form => ({
  id: `d-${Date.now()}`,
  kind,
  type: EXPENSE_TYPES[0],
  title: "",
  amount: "",
  useDate: "",
  project: "",
  reason: "",
  files: [],
  staff: {},
  period: "",
});

export default function NewRequestPage() {
  return (
    <Suspense>
      <NewRequest />
    </Suspense>
  );
}

function NewRequest() {
  const params = useSearchParams();
  const toast = useToast();
  const kind = params.get("type") === "project" ? "project" : "expense";
  const template = DOCS.find((d) => d.slug === params.get("template"));
  const [form, setForm] = useState<Form>(() => blank(kind));
  const [savedAt, setSavedAt] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // 임시 저장본 이어쓰기 / 템플릿으로 시작
  useEffect(() => {
    const draftId = params.get("draft");
    const drafts = loadLocal<(Approval & { form?: Form })[]>(DRAFTS_KEY, []);
    const found = drafts.find((d) => d.id === draftId)?.form;
    const editing = APPROVALS.find((a) => a.id === params.get("edit"));
    if (found) setForm(found);
    else if (editing)
      setForm((f) => ({
        ...f,
        id: editing.id,
        type: editing.type,
        title: editing.title,
        amount: editing.amount.replace(/[^0-9]/g, ""),
        project: editing.project,
        reason: editing.reason,
        period: editing.kind === "인력 지원" ? editing.amount : "",
        files: editing.files.map(([, name, size]) => ({ name, size })),
      }));
    else if (template) setForm((f) => ({ ...f, type: "물품 구매", title: template.title.replace("요청서", "") }));
  }, [params, template]);

  const amount = Number(form.amount.replace(/[^0-9]/g, "")) || 0;
  const line = [
    { who: "김준표", role: "기안", note: "Core Platform" },
    { who: "최하은", role: "검토", note: "NativeOps 리드" },
    ...(form.kind === "expense" && amount >= FA_LIMIT ? [{ who: "정민재", role: "최종 승인", note: "FA · 30만원 이상 자동 추가" }] : [{ who: "최하은", role: "최종 승인", note: "30만원 미만은 검토자가 승인" }]),
  ];
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const saveDraft = (silent = false) => {
    const drafts = loadLocal<(Approval & { form?: Form })[]>(DRAFTS_KEY, []).filter((d) => d.id !== form.id);
    const entry = {
      id: form.id,
      kind: form.kind === "expense" ? "비용 승인" : "인력 지원",
      type: form.kind === "expense" ? form.type : Object.entries(form.staff).map(([r, n]) => `${r} ${n}명`).join(", ") || "직군 미정",
      title: form.title || "제목 없는 결재",
      amount: form.kind === "expense" ? `${won.format(amount)}원` : form.period || "기간 미정",
      status: "작성 중",
      date: "임시 저장",
      author: "김준표",
      authorId: "junpyo",
      project: form.project,
      useDate: form.useDate,
      reason: form.reason,
      line: [],
      files: [],
      comments: [],
      form,
    } as Approval & { form: Form };
    saveLocal(DRAFTS_KEY, [entry, ...drafts]);
    setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }));
    if (!silent) toast.show("임시 저장했어요. 결재함에서 이어 쓸 수 있어요.");
  };

  // 입력이 멈추고 2초 뒤 자동 저장
  useEffect(() => {
    if (!form.title && !form.reason) return;
    const t = setTimeout(() => saveDraft(true), 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  if (submitted) {
    return (
      <WdPage active="requests">
        <div className="wd-narrow" style={{ padding: "120px 0", textAlign: "center" }}>
          <div className="wd-alert" style={{ margin: "0 auto", boxShadow: "none", border: "1px solid #e5e8eb" }}>
            <span className="ico">✓</span>
            <h2>결재를 올렸어요</h2>
            <p>
              {line[1].who}님이 검토를 시작하면 알림으로 알려드려요.
            </p>
            <div className="wd-foot">
              <Link className="wd-btn ghost" href="/inhouse/requests#box">
                결재함
              </Link>
              <button type="button" className="wd-btn" onClick={() => {
                  setForm(blank(form.kind));
                  setSubmitted(false);
                }}>
                하나 더 작성
              </button>
            </div>
          </div>
        </div>
      </WdPage>
    );
  }

  return (
    <WdPage active="requests">
      <form
        className="wd-wrap wd-pb"
        onSubmit={(e) => {
          e.preventDefault();
          const drafts = loadLocal<Approval[]>(DRAFTS_KEY, []).filter((d) => d.id !== form.id);
          saveLocal(DRAFTS_KEY, drafts);
          setSubmitted(true);
        }}
      >
        <div className="wd-crumb">
          <Link href="/inhouse/requests">결재</Link> › <b>{kind === "expense" ? "비용 승인 요청" : "프로젝트 인력 지원"}</b>
        </div>
        <section className="wd-hero sm">
          <div>
            <Eyebrow>{kind === "expense" ? "EXPENSE" : "STAFFING"}</Eyebrow>
            <h1>{kind === "expense" ? "비용 승인 요청" : "프로젝트 인력 지원"}</h1>
            <p>
              {template
                ? `'${template.title}' 템플릿으로 시작했어요.`
                : kind === "expense"
                  ? "Native 자금이 필요한 모든 요청을 한 경로로 올려요."
                  : "진행 중인 프로젝트에 필요한 직군과 인원을 요청해요."}
            </p>
          </div>
          {savedAt && <span className="wd-t10 wd-faint">✓ {savedAt} 자동 저장됨</span>}
        </section>

        <div className="wd-side">
          <div className="wd-card" style={{ padding: 28 }}>
            {form.kind === "expense" && (
              <div className="wd-field">
                <span>비용 유형</span>
                <div className="wd-seg" role="radiogroup" aria-label="비용 유형">
                  {EXPENSE_TYPES.map((x) => (
                    <button type="button" role="radio" aria-checked={form.type === x} key={x} className={form.type === x ? "on" : ""} onClick={() => set("type", x)}>
                      {x}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <label className="wd-field">
              <span>제목</span>
              <input className="wd-input" required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="예: Book-on 테스트 기기 구매" />
            </label>
            {form.kind === "expense" ? (
              <div className="wd-grid g2">
                <label className="wd-field">
                  <span>요청 금액</span>
                  <input
                    className="wd-input"
                    required
                    inputMode="numeric"
                    value={amount ? won.format(amount) : ""}
                    onChange={(e) => set("amount", e.target.value)}
                    placeholder="0원"
                  />
                </label>
                <label className="wd-field">
                  <span>사용 예정일</span>
                  <input className="wd-input" type="date" required value={form.useDate} onChange={(e) => set("useDate", e.target.value)} />
                </label>
              </div>
            ) : (
              <>
                <div className="wd-field">
                  <span>필요 직군 · 인원</span>
                  <div className="wd-chips">
                    {STAFF_ROLES.map((r) => {
                      const n = form.staff[r] ?? 0;
                      return (
                        <span key={r} className={`wd-chip ${n ? "bon" : ""}`} style={{ paddingRight: 4 }}>
                          {r}
                          <button type="button" aria-label={`${r} 줄이기`} className="wd-x" style={{ width: 22, height: 22, fontSize: 12 }} onClick={() => set("staff", { ...form.staff, [r]: Math.max(0, n - 1) })}>
                            −
                          </button>
                          <b>{n}</b>
                          <button type="button" aria-label={`${r} 늘리기`} className="wd-x" style={{ width: 22, height: 22, fontSize: 12 }} onClick={() => set("staff", { ...form.staff, [r]: n + 1 })}>
                            +
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <label className="wd-field">
                  <span>투입 기간</span>
                  <input className="wd-input" required value={form.period} onChange={(e) => set("period", e.target.value)} placeholder="예: 11.03 – 11.21 (3주)" />
                </label>
              </>
            )}
            <label className="wd-field">
              <span>
                연결 프로젝트 <em>{form.kind === "expense" ? "선택" : "필수"}</em>
              </span>
              <select className="wd-input" required={form.kind === "project"} value={form.project} onChange={(e) => set("project", e.target.value)}>
                <option value="">선택 안 함</option>
                {PROJECTS.map((p) => (
                  <option key={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="wd-field">
              <span>
                요청 사유 <em>{form.reason.length} / {MAX_REASON}</em>
              </span>
              <textarea className="wd-input" required maxLength={MAX_REASON} value={form.reason} onChange={(e) => set("reason", e.target.value)} placeholder="목적과 필요한 이유를 알려주세요" />
            </label>
            <div className="wd-field" style={{ marginBottom: 0 }}>
              <span>
                첨부파일 <em>견적서 · 영수증 · 최대 10MB</em>
              </span>
              <div className="wd-stack" style={{ gap: 8 }}>
                {form.files.map((f) => (
                  <div className="wd-file" key={f.name}>
                    <span className={`ext ${/\.(png|jpe?g)$/i.test(f.name) ? "img" : ""}`}>{f.name.split(".").pop()?.toUpperCase().slice(0, 4)}</span>
                    <div>
                      <b>{f.name}</b>
                      <small>{f.size}</small>
                    </div>
                    <button type="button" className="end" style={{ border: 0, background: "none" }} aria-label={`${f.name} 삭제`} onClick={() => set("files", form.files.filter((x) => x.name !== f.name))}>
                      ×
                    </button>
                  </div>
                ))}
                <label className="wd-drop" style={{ cursor: "pointer" }}>
                  <b>파일을 끌어다 놓거나 눌러서 선택</b>
                  PDF · JPG · PNG
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const picked = [...(e.target.files ?? [])]
                        .filter((f) => f.size <= 10 * 1024 * 1024)
                        .map((f) => ({ name: f.name, size: f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)}MB` : `${Math.ceil(f.size / 1024)}KB` }));
                      set("files", [...form.files, ...picked]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <aside className="wd-stack">
            <section className="wd-card">
              <div className="wd-card-head">
                <h3>결재선</h3>
                <span className="wd-t9 wd-faint">금액에 따라 자동</span>
              </div>
              <div className="wd-tl">
                {line.map((l, i) => (
                  <div key={l.role} className={i === 0 ? "on" : ""} style={i === line.length - 1 ? { paddingBottom: 0 } : undefined}>
                    <b className="wd-t11">
                      {l.who} · {l.role}
                    </b>
                    <p className="wd-t9 wd-faint" style={{ margin: "3px 0 0" }}>{l.note}</p>
                  </div>
                ))}
              </div>
            </section>
            <div className="wd-row">
              <button type="button" className="wd-btn ghost" style={{ flex: 1 }} onClick={() => saveDraft()}>
                임시 저장
              </button>
              <button type="submit" className="wd-btn" style={{ flex: 2 }}>
                결재 올리기 →
              </button>
            </div>
          </aside>
        </div>
      </form>
      {toast.node}
    </WdPage>
  );
}
