"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import AdminShell, { AdminToggle } from "@/components/inhouse/AdminShell";
import { TEAM_SIZE } from "@/lib/admin";
import EmptyState from "@/components/inhouse/EmptyState";
import { Modal, useToast } from "@/components/inhouse/ui";
import { DOCS, type Doc } from "@/lib/demo";

type Section = NonNullable<Doc["sections"]>[number];
type Draft = { title: string; base: string; text: string };

const lineText = (l: Section["lines"][number], side: "was" | "now") =>
  l[side] === undefined ? l.text : `${l.text}${l[side]}${l.after ?? ""}`;
const sectionText = (s: Section, side: "was" | "now") => s.lines.map((l) => lineText(l, side)).join("\n");
const shiftVersion = (v: string, by: number) => v.replace(/(\d+)$/, (n) => String(Math.max(Number(n) + by, 0)));
const today = () => new Date().toISOString().slice(0, 10);

// 개정 중인 문서는 was → now 가 이미 들어 있으니 그 상태로 편집을 이어감
const initialDrafts = (doc?: Doc): Draft[] =>
  (doc?.sections ?? []).map((s) => ({ title: s.title, base: sectionText(s, "was"), text: sectionText(s, doc?.revised ? "now" : "was") }));

const summaryOf = (doc?: Doc) =>
  (doc?.sections ?? [])
    .flatMap((s) => s.lines.filter((l) => l.was !== undefined).map((l) => `${s.title.split(" ")[0]} ${l.was}→${l.now}`))
    .join(", ");

export default function AdminDocRevise() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const toast = useToast();
  const doc = DOCS.find((d) => d.slug === slug);
  const base = doc?.version ? (doc.revised ? shiftVersion(doc.version, -1) : doc.version) : "v1.0";
  const next = doc?.version && doc.revised ? doc.version : shiftVersion(base, 1);

  const [drafts, setDrafts] = useState<Draft[]>(() => initialDrafts(doc));
  const [editing, setEditing] = useState<number | null>(null);
  const [summary, setSummary] = useState(() => summaryOf(doc));
  const [effective, setEffective] = useState(doc?.effective?.replaceAll(".", "-") ?? today());
  const [notify, setNotify] = useState(true);
  const [ackRequest, setAckRequest] = useState(true);
  const [preview, setPreview] = useState(false);

  if (!doc) {
    return (
      <AdminShell title="문서 개정">
        <EmptyState icon="?" title="문서를 찾을 수 없어요" description="삭제됐거나 주소가 바뀌었어요." actionLabel="문서함으로" onAction={() => router.push("/inhouse/documents")} />
      </AdminShell>
    );
  }

  const changed = drafts.map((d) => d.text.trim() !== d.base.trim());
  const changedCount = changed.filter(Boolean).length;
  const canPublish = changedCount > 0 && summary.trim() && effective;
  const update = (i: number, patch: Partial<Draft>) => setDrafts(drafts.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  return (
    <AdminShell
      title={doc.title}
      sub={`${base} → ${next} 개정`}
      right={
        <div className="wd-row">
          <button type="button" className="wd-btn ghost" onClick={() => setPreview(true)}>
            미리보기
          </button>
          <button
            type="button"
            className="wd-btn"
            disabled={!canPublish}
            onClick={() => {
              toast.show(notify ? `${next} 을 게시하고 전체 ${TEAM_SIZE}명에게 알렸어요` : `${next} 을 게시했어요`);
              setTimeout(() => router.push(`/inhouse/documents/${doc.slug}`), 900);
            }}
          >
            개정 게시
          </button>
        </div>
      }
    >
      <div className="wd-side">
        <div className="wd-card" style={{ padding: 28 }}>
          {drafts.length === 0 && <p className="wd-t11 wd-faint" style={{ margin: 0 }}>아직 조항이 없어요. 아래에서 조항을 추가해주세요.</p>}
          {drafts.map((d, i) =>
            changed[i] || editing === i ? (
              <div key={i} style={{ marginBottom: 26 }}>
                <div className="wd-between" style={{ marginBottom: 12 }}>
                  <input className="wd-input" aria-label="조항 제목" value={d.title} onChange={(e) => update(i, { title: e.target.value })} style={{ maxWidth: 260, fontWeight: 700 }} />
                  <div className="wd-row">
                    {changed[i] && <span className="wd-badge orange">수정됨</span>}
                    {changed[i] && d.base && (
                      <button type="button" className="wd-btn line sm" onClick={() => update(i, { text: d.base })}>
                        되돌리기
                      </button>
                    )}
                  </div>
                </div>
                <div className="wd-grid g2">
                  <div className="wd-card soft" style={{ padding: 16 }}>
                    <span className="wd-t9 wd-faint" style={{ fontWeight: 750 }}>{base} (현재)</span>
                    <p className="wd-t11" style={{ lineHeight: 1.8, margin: "8px 0 0", whiteSpace: "pre-line" }}>{d.base || "새 조항"}</p>
                  </div>
                  <label className="wd-card" style={{ padding: 16, borderColor: "#3182f6" }}>
                    <span className="wd-t9" style={{ fontWeight: 750, color: "#3568d4" }}>{next} (편집 중)</span>
                    <textarea
                      className="wd-input"
                      style={{ minHeight: 90, marginTop: 8, lineHeight: 1.8 }}
                      value={d.text}
                      onChange={(e) => update(i, { text: e.target.value })}
                      onBlur={() => editing === i && !changed[i] && setEditing(null)}
                      autoFocus={editing === i}
                    />
                  </label>
                </div>
              </div>
            ) : null,
          )}
          <b className="wd-t10" style={{ display: "block", color: "#4e5968", marginBottom: 8 }}>
            변경 없는 조항 {drafts.length - changedCount - (editing !== null && !changed[editing] ? 1 : 0)}개
          </b>
          <div className="wd-stack" style={{ gap: 6 }}>
            {drafts.map((d, i) =>
              changed[i] || editing === i ? null : (
                <button type="button" key={i} className="wd-file" style={{ textAlign: "left" }} onClick={() => setEditing(i)}>
                  <div>
                    <b>{d.title}</b>
                    <small>{d.base.split("\n")[0]}</small>
                  </div>
                  <span className="end">수정</span>
                </button>
              ),
            )}
          </div>
          <button
            type="button"
            className="wd-btn line sm"
            style={{ marginTop: 16 }}
            onClick={() => {
              setDrafts([...drafts, { title: `제${drafts.length + 1}조 `, base: "", text: "" }]);
              setEditing(drafts.length);
            }}
          >
            + 조항 추가
          </button>
        </div>
        <aside className="wd-stack">
          <section className="wd-card">
            <label className="wd-field">
              <span>
                변경 요약 <em>변경 내역에 표시</em>
              </span>
              <textarea className="wd-input" style={{ minHeight: 70 }} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="무엇이 어떻게 바뀌었는지 한 줄로" />
            </label>
            <label className="wd-field">
              <span>시행일</span>
              <input className="wd-input" type="date" value={effective} onChange={(e) => setEffective(e.target.value)} />
            </label>
            <AdminToggle on={notify} onChange={setNotify} label="제도 변경 알림 보내기" desc={`전체 ${TEAM_SIZE}명`} />
            <AdminToggle on={ackRequest} onChange={setAckRequest} label="읽음 확인 요청" desc="시행일까지 전원 확인" />
          </section>
          <p className="wd-t9 wd-faint" style={{ margin: 0, lineHeight: 1.6 }}>
            {changedCount > 0 ? `${changedCount}개 조항이 바뀌어요.` : "바뀐 조항이 없으면 게시할 수 없어요."} 이전 버전은 문서의 변경 내역에 남아요.
          </p>
        </aside>
      </div>

      {preview && (
        <Modal
          eyebrow={`${next} 미리보기`}
          title={doc.title}
          sub={`시행 ${effective.replaceAll("-", ".")} · ${doc.owner}`}
          size="lg"
          onClose={() => setPreview(false)}
          footer={
            <button type="button" className="wd-btn" onClick={() => setPreview(false)}>
              닫기
            </button>
          }
        >
          {summary.trim() && (
            <div className="wd-banner" style={{ marginBottom: 18 }}>
              <span className="ico">!</span>
              <div>
                <b>이번 개정</b>
                <p>{summary}</p>
              </div>
            </div>
          )}
          {drafts.map((d, i) => (
            <section key={i} style={{ marginBottom: 16 }}>
              <b className="wd-t12">
                {d.title} {changed[i] && <span className="wd-badge orange">수정됨</span>}
              </b>
              <p className="wd-t11" style={{ lineHeight: 1.8, margin: "6px 0 0", whiteSpace: "pre-line" }}>{d.text}</p>
            </section>
          ))}
        </Modal>
      )}
      {toast.node}
    </AdminShell>
  );
}
