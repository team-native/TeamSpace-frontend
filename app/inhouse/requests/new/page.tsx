"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import WdPage from "@/components/inhouse/WdPage";
import { Eyebrow, useToast } from "@/components/inhouse/ui";
import { api, fileSize } from "@/lib/api";
import {
  EXPENSE_TYPES,
  STAFF_ROLES,
  createApproval,
  fetchApproval,
  fetchProjectNames,
  updateApproval,
  uploadFile,
  type ApprovalInput,
  type Uploaded,
} from "@/lib/approvals";
import { won } from "@/lib/inhouse";

type Form = {
  kind: "expense" | "project";
  type: string;
  title: string;
  amount: string;
  useDate: string;
  project: string;
  reason: string;
  files: Uploaded[];
  staff: Record<string, number>;
  period: string;
};

const MAX_REASON = 500;
const FA_LIMIT = 300000;
const MAX_FILE = 10 * 1024 * 1024;

const blank = (kind: Form["kind"]): Form => ({
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

const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

export default function NewRequestPage() {
  return (
    <Suspense>
      <NewRequest />
    </Suspense>
  );
}

// POST /approvals (제출 · 임시 저장) · 이어 쓰기 / 반려 후 다시 올리기 PATCH /approvals/{id}
function NewRequest() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const kind = params.get("type") === "project" ? "project" : "expense";
  const editId = params.get("draft") ?? params.get("edit");
  const templateSlug = params.get("template");
  const [form, setForm] = useState<Form>(() => blank(kind));
  const [savedId, setSavedId] = useState<string | null>(editId);
  const [templateTitle, setTemplateTitle] = useState("");
  const [projects, setProjects] = useState<string[]>([]);
  const [savedAt, setSavedAt] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjectNames()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  // 임시 저장본 · 반려 결재 이어쓰기 / 템플릿으로 시작
  useEffect(() => {
    if (editId) {
      fetchApproval(editId)
        .then((a) => {
          if (!["작성 중", "반려"].includes(a.status)) {
            setError("작성 중이거나 반려된 결재만 고칠 수 있어요.");
            return;
          }
          setForm({
            kind: a.kind === "인력 지원" ? "project" : "expense",
            type: a.type || EXPENSE_TYPES[0],
            title: a.title === "제목 없는 결재" ? "" : a.title,
            amount: a.amountValue ? String(a.amountValue) : "",
            useDate: a.useDate,
            project: a.project,
            reason: a.reason,
            files: a.files,
            staff: a.staff,
            period: a.period,
          });
        })
        .catch((e) => setError(errMsg(e, "결재를 불러오지 못했어요.")));
      return;
    }
    if (templateSlug) {
      api<{ title?: string }>(`/docs/${encodeURIComponent(templateSlug)}`)
        .then((d) => {
          const t = d.title ?? "";
          setTemplateTitle(t);
          setForm((f) => ({ ...f, title: f.title || t.replace("요청서", "").trim() }));
        })
        .catch(() => setTemplateTitle(""));
    }
  }, [editId, templateSlug]);

  const amount = Number(form.amount.replace(/[^0-9]/g, "")) || 0;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const input = (): ApprovalInput => ({
    kind: form.kind === "expense" ? "비용 승인" : "인력 지원",
    type: form.kind === "expense" ? form.type : Object.entries(form.staff).filter(([, n]) => n > 0).map(([r, n]) => `${r} ${n}명`).join(", "),
    title: form.title.trim(),
    amount: form.kind === "expense" ? amount : 0,
    useDate: form.useDate,
    project: form.project,
    reason: form.reason.trim(),
    files: form.files.map((f) => f.id),
    staff: Object.fromEntries(Object.entries(form.staff).filter(([, n]) => n > 0)),
    period: form.period,
    ...(templateSlug && !savedId ? { templateSlug } : {}),
  });

  const save = async (draft: boolean) => {
    if (busy || uploading) return;
    setError("");
    if (!draft && form.kind === "project" && Object.values(form.staff).every((n) => !n)) {
      setError("지원할 직군과 인원을 1명 이상 골라주세요.");
      return;
    }
    setBusy(true);
    try {
      let id = savedId;
      if (id) {
        const { kind: _kind, ...rest } = input();
        void _kind;
        await updateApproval(id, rest, draft);
      } else {
        id = (await createApproval(input(), draft)).id;
        setSavedId(id);
      }
      if (draft) {
        setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }));
        toast.show("임시 저장했어요. 결재함에서 이어 쓸 수 있어요.");
      } else setSubmitted(id);
    } catch (e) {
      setError(errMsg(e, draft ? "임시 저장하지 못했어요." : "결재를 올리지 못했어요."));
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <WdPage active="requests">
        <div className="wd-narrow" style={{ padding: "120px 0", textAlign: "center" }}>
          <div className="wd-alert" style={{ margin: "0 auto", boxShadow: "none", border: "1px solid var(--t-line)" }}>
            <span className="ico">✓</span>
            <h2>결재를 올렸어요</h2>
            <p>검토자가 처리하면 알림으로 알려드려요.</p>
            <div className="wd-foot">
              <Link className="wd-btn ghost" href={`/inhouse/requests/${submitted}`}>
                올린 결재 보기
              </Link>
              <button
                type="button"
                className="wd-btn"
                onClick={() => {
                  setForm(blank(form.kind));
                  setSavedId(null);
                  setSavedAt("");
                  setSubmitted(null);
                  router.replace(`/inhouse/requests/new?type=${form.kind}`);
                }}
              >
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
          void save(false);
        }}
      >
        <div className="wd-crumb">
          <Link href="/inhouse/requests">결재</Link> › <b>{form.kind === "expense" ? "비용 승인 요청" : "프로젝트 인력 지원"}</b>
        </div>
        <section className="wd-hero sm">
          <div>
            <Eyebrow>{form.kind === "expense" ? "EXPENSE" : "STAFFING"}</Eyebrow>
            <h1>{form.kind === "expense" ? "비용 승인 요청" : "프로젝트 인력 지원"}</h1>
            <p>
              {templateTitle
                ? `'${templateTitle}' 템플릿으로 시작했어요.`
                : form.kind === "expense"
                  ? "Native 자금이 필요한 모든 요청을 한 경로로 올려요."
                  : "진행 중인 프로젝트에 필요한 직군과 인원을 요청해요."}
            </p>
          </div>
          {savedAt && <span className="wd-t10 wd-faint">✓ {savedAt} 임시 저장됨</span>}
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
              <input className="wd-input" required maxLength={200} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="예: Book-on 테스트 기기 구매" />
            </label>
            {form.kind === "expense" ? (
              <div className="wd-grid g2">
                <label className="wd-field">
                  <span>요청 금액</span>
                  <input className="wd-input" required inputMode="numeric" value={amount ? won.format(amount) : ""} onChange={(e) => set("amount", e.target.value)} placeholder="0원" />
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
                {[...new Set([...projects, form.project].filter(Boolean))].map((p) => (
                  <option key={p}>{p}</option>
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
                  <div className="wd-file" key={f.id}>
                    <span className={`ext ${/\.(png|jpe?g)$/i.test(f.name) ? "img" : ""}`}>{f.name.split(".").pop()?.toUpperCase().slice(0, 4)}</span>
                    <div>
                      <b>{f.name}</b>
                      <small>{fileSize(f.size)}</small>
                    </div>
                    <button type="button" className="end" style={{ border: 0, background: "none" }} aria-label={`${f.name} 삭제`} onClick={() => set("files", form.files.filter((x) => x.id !== f.id))}>
                      ×
                    </button>
                  </div>
                ))}
                <label className="wd-drop" style={{ cursor: "pointer" }}>
                  <b>{uploading ? `${uploading}개 올리는 중…` : "눌러서 파일 선택"}</b>
                  PDF · JPG · PNG
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const picked = [...(e.target.files ?? [])];
                      e.target.value = "";
                      const tooBig = picked.filter((f) => f.size > MAX_FILE);
                      if (tooBig.length) toast.show(`${tooBig.map((f) => f.name).join(", ")}: 10MB 이하만 올릴 수 있어요`);
                      const ok = picked.filter((f) => f.size <= MAX_FILE);
                      setUploading((n) => n + ok.length);
                      for (const file of ok) {
                        try {
                          const up = await uploadFile(file);
                          setForm((f) => ({ ...f, files: [...f.files, up] }));
                        } catch (err) {
                          toast.show(`${file.name}: ${errMsg(err, "올리지 못했어요")}`);
                        } finally {
                          setUploading((n) => n - 1);
                        }
                      }
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
                <span className="wd-t9 wd-faint">올리면 자동 지정</span>
              </div>
              <div className="wd-tl">
                <div className="on">
                  <b className="wd-t11">나 · 기안</b>
                </div>
                <div>
                  <b className="wd-t11">NativeOps 리드 · 검토</b>
                  <p className="wd-t9 wd-faint" style={{ margin: "3px 0 0" }}>없으면 관리자</p>
                </div>
                {form.kind === "expense" && amount >= FA_LIMIT && (
                  <div style={{ paddingBottom: 0 }}>
                    <b className="wd-t11">FA · 최종 승인</b>
                    <p className="wd-t9 wd-faint" style={{ margin: "3px 0 0" }}>30만원 이상이라 자동 추가</p>
                  </div>
                )}
              </div>
            </section>
            {error && (
              <div className="wd-banner danger" role="alert" style={{ padding: "12px 14px" }}>
                <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>!</span>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}
            <div className="wd-row">
              <button type="button" className="wd-btn ghost" style={{ flex: 1 }} disabled={busy || uploading > 0} onClick={() => void save(true)}>
                임시 저장
              </button>
              <button type="submit" className="wd-btn" style={{ flex: 2 }} disabled={busy || uploading > 0}>
                {busy ? "보내는 중…" : "결재 올리기 →"}
              </button>
            </div>
          </aside>
        </div>
      </form>
      {toast.node}
    </WdPage>
  );
}
