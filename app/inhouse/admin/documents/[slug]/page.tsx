"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminShell, { AdminToggle } from "@/components/inhouse/AdminShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { Modal, useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import { TYPE_LABEL, diffLines, fetchDoc, fetchDocs, saveDoc, sectionText, type DocDetail, type DocItem } from "@/lib/docs";
import { isAdminRole, useMe } from "@/lib/session";
import { usePeople } from "@/lib/people";

type Draft = { title: string; base: string; text: string };

const nextVersion = (v: string) => {
  const m = v.match(/^v(\d+)\.(\d+)$/);
  return m ? `v${m[1]}.${Number(m[2]) + 1}` : "v1.1";
};
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const TYPES = ["RULE", "FINANCE", "GUIDE", "TEMPLATE"];

export default function AdminDocRevise() {
  const { slug } = useParams<{ slug: string }>();
  const isNew = slug === "new";
  const router = useRouter();
  const toast = useToast();
  const { me } = useMe();
  const { people } = usePeople();
  const [doc, setDoc] = useState<DocDetail | null>(null);
  const [allDocs, setAllDocs] = useState<DocItem[]>([]);
  const [loadError, setLoadError] = useState<{ status: number; message: string } | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [meta, setMeta] = useState({ slug: "", title: "", category: "운영 규칙", type: "RULE", copy: "" });
  const [summary, setSummary] = useState("");
  const [effective, setEffective] = useState(today());
  const [notify, setNotify] = useState(true);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDocs(100)
      .then(setAllDocs)
      .catch(() => {});
    if (isNew) {
      setDrafts([{ title: "제1조 목적", base: "", text: "" }]);
      setEditing(0);
      return;
    }
    let alive = true;
    fetchDoc(slug)
      .then((d) => {
        if (!alive) return;
        setDoc(d);
        setMeta({ slug: d.slug, title: d.title, category: d.category, type: d.type, copy: d.copy });
        setDrafts(d.sections.map((s) => ({ title: s.title, base: sectionText(s), text: sectionText(s) })));
      })
      .catch((e) => alive && setLoadError({ status: e instanceof ApiError ? e.status : 0, message: e instanceof Error ? e.message : "문서를 불러오지 못했어요." }));
    return () => {
      alive = false;
    };
  }, [slug, isNew]);

  if (loadError) {
    const missing = loadError.status === 404;
    return (
      <AdminShell title="문서 개정">
        <EmptyState
          icon={missing ? "?" : "!"}
          title={missing ? "문서를 찾을 수 없어요" : "문서를 불러오지 못했어요"}
          description={missing ? "삭제됐거나 주소가 바뀌었어요." : loadError.message}
          actionLabel="새 문서 등록"
          onAction={() => router.push("/inhouse/admin/documents/new")}
        />
      </AdminShell>
    );
  }

  if (!isNew && !doc) {
    return (
      <AdminShell title="문서 개정">
        <p className="wd-t11 wd-faint" aria-busy="true">
          문서를 불러오는 중이에요…
        </p>
      </AdminShell>
    );
  }

  const base = doc?.version || "v1.0";
  const next = isNew ? "v1.0" : nextVersion(base);
  const changed = drafts.map((d) => d.text.trim() !== d.base.trim() || (!d.base && !!d.text.trim()));
  const titleChanged = drafts.some((d, i) => doc && doc.sections[i] && doc.sections[i].title !== d.title);
  const changedCount = changed.filter(Boolean).length + (doc ? Math.max(0, doc.sections.length - drafts.length) : 0);
  const slugOk = /^[a-z0-9-]{2,60}$/.test(meta.slug);
  const canPublish = isNew
    ? slugOk && !!meta.title.trim() && drafts.some((d) => d.text.trim()) && !saving
    : (changedCount > 0 || titleChanged) && !!summary.trim() && !!effective && !saving;
  const update = (i: number, patch: Partial<Draft>) => setDrafts(drafts.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const headCount = people?.length;

  const publish = async () => {
    if (!canPublish) return;
    setSaving(true);
    setError("");
    try {
      const sections = drafts
        .filter((d) => d.title.trim() || d.text.trim())
        .map((d) => {
          const { lines, changed: c } = diffLines(isNew ? "" : d.base, d.text.trim());
          // 새 문서는 바뀐 표시 없이 그대로
          return isNew ? { title: d.title.trim(), lines: d.text.trim().split("\n").map((text) => ({ text })) } : { title: d.title.trim(), revised: c, lines };
        });
      const r = await saveDoc({
        slug: isNew ? meta.slug : slug,
        title: meta.title.trim(),
        category: meta.category.trim() || "기타",
        type: meta.type,
        copy: meta.copy.trim(),
        sections,
        note: isNew ? "최초 등록" : summary.trim(),
        effective: effective.replace(/-/g, "."),
        notify: !isNew && notify,
        ...(isNew ? { version: "v1.0" } : {}),
      });
      toast.show(isNew ? "문서를 등록했어요" : `${r.version ?? next} 을 게시했어요${notify ? " · 알림을 보냈어요" : ""}`);
      setTimeout(() => router.push(`/inhouse/documents/${r.slug}`), 700);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 403 ? "문서 등록·개정은 Admin만 할 수 있어요." : e instanceof Error ? e.message : "게시하지 못했어요.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title={isNew ? "문서 등록" : meta.title}
      sub={isNew ? "새 규칙·가이드를 문서함에 올려요." : `${base} → ${next} 개정`}
      right={
        <div className="wd-row">
          <button type="button" className="wd-btn ghost" onClick={() => setPreview(true)}>
            미리보기
          </button>
          <button type="button" className="wd-btn" disabled={!canPublish} onClick={publish} aria-busy={saving}>
            {saving ? "게시 중…" : isNew ? "문서 등록" : "개정 게시"}
          </button>
        </div>
      }
    >
      {!isAdminRole(me) && (
        <div className="wd-banner warn" style={{ marginBottom: 18 }}>
          <span className="ico" style={{ color: "#9a6b00" }}>!</span>
          <div>
            <b>문서 등록·개정은 Admin만 게시할 수 있어요</b>
          </div>
        </div>
      )}
      {error && (
        <div className="wd-banner danger" role="alert" style={{ marginBottom: 18 }}>
          <span className="ico">!</span>
          <div>
            <b>{error}</b>
          </div>
        </div>
      )}
      <div className="wd-side">
        <div className="wd-card" style={{ padding: 28 }}>
          {isNew && (
            <div style={{ marginBottom: 22 }}>
              <div className="wd-grid g2">
                <label className="wd-field">
                  <span>제목</span>
                  <input className="wd-input" maxLength={80} value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} placeholder="예: 장비 대여 규칙" />
                </label>
                <label className="wd-field">
                  <span>
                    주소 이름 <em>영문 소문자·숫자·-</em>
                  </span>
                  <input className="wd-input" value={meta.slug} onChange={(e) => setMeta({ ...meta, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="equipment-rules" />
                </label>
                <label className="wd-field">
                  <span>분류</span>
                  <input className="wd-input" list="doc-categories" value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })} />
                  <datalist id="doc-categories">
                    {[...new Set(allDocs.map((d) => d.category))].map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </label>
                <div className="wd-field">
                  <span>종류</span>
                  <div className="wd-seg">
                    {TYPES.map((t) => (
                      <button type="button" key={t} className={meta.type === t ? "on" : ""} onClick={() => setMeta({ ...meta, type: t })}>
                        {TYPE_LABEL[t] ?? t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <label className="wd-field" style={{ marginBottom: 0 }}>
                <span>한 줄 설명</span>
                <input className="wd-input" maxLength={120} value={meta.copy} onChange={(e) => setMeta({ ...meta, copy: e.target.value })} placeholder="문서함 목록에 보이는 설명" />
              </label>
              {meta.slug && !slugOk && <p className="wd-t9" style={{ color: "#f04452", margin: "6px 0 0" }}>주소 이름은 2자 이상, 영문 소문자·숫자·-만 쓸 수 있어요</p>}
              {allDocs.some((d) => d.slug === meta.slug) && (
                <p className="wd-t9" style={{ color: "#f04452", margin: "6px 0 0" }}>
                  이미 있는 주소예요. 등록하면 그 문서가 개정돼요 — <Link href={`/inhouse/admin/documents/${meta.slug}`}>개정 화면으로</Link>
                </p>
              )}
            </div>
          )}
          {drafts.length === 0 && <p className="wd-t11 wd-faint" style={{ margin: 0 }}>아직 조항이 없어요. 아래에서 조항을 추가해주세요.</p>}
          {drafts.map((d, i) =>
            changed[i] || editing === i ? (
              <div key={i} style={{ marginBottom: 26 }}>
                <div className="wd-between" style={{ marginBottom: 12 }}>
                  <input className="wd-input" aria-label="조항 제목" value={d.title} onChange={(e) => update(i, { title: e.target.value })} style={{ maxWidth: 260, fontWeight: 700 }} />
                  <div className="wd-row">
                    {changed[i] && !isNew && <span className="wd-badge orange">수정됨</span>}
                    {changed[i] && d.base && (
                      <button type="button" className="wd-btn line sm" onClick={() => update(i, { text: d.base })}>
                        되돌리기
                      </button>
                    )}
                    {!d.base && (
                      <button type="button" className="wd-btn ghost sm" onClick={() => setDrafts(drafts.filter((_, j) => j !== i))}>
                        빼기
                      </button>
                    )}
                  </div>
                </div>
                <div className={isNew ? "" : "wd-grid g2"}>
                  {!isNew && (
                    <div className="wd-card soft" style={{ padding: 16 }}>
                      <span className="wd-t9 wd-faint" style={{ fontWeight: 750 }}>{base} (현재)</span>
                      <p className="wd-t11" style={{ lineHeight: 1.8, margin: "8px 0 0", whiteSpace: "pre-line" }}>{d.base || "새 조항"}</p>
                    </div>
                  )}
                  <label className="wd-card" style={{ padding: 16, borderColor: "#3182f6", display: "block" }}>
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
          {!isNew && (
            <>
              <b className="wd-t10" style={{ display: "block", color: "#4e5968", marginBottom: 8 }}>
                변경 없는 조항 {drafts.filter((_, i) => !changed[i] && editing !== i).length}개
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
            </>
          )}
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
          {!isNew && (
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
              <AdminToggle on={notify} onChange={setNotify} label="제도 변경 알림 보내기" desc={headCount ? `전체 ${headCount}명` : "전체 팀원"} />
            </section>
          )}
          <section className="wd-card soft">
            <h3 style={{ fontSize: 12 }}>다른 문서 {isNew ? "개정" : ""}</h3>
            <select
              className="wd-input"
              value=""
              aria-label="개정할 문서 선택"
              onChange={(e) => e.target.value && router.push(`/inhouse/admin/documents/${e.target.value}`)}
              style={{ marginTop: 10 }}
            >
              <option value="">문서 고르기</option>
              {allDocs
                .filter((d) => d.slug !== slug)
                .map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.title}
                  </option>
                ))}
            </select>
            {!isNew && (
              <Link className="wd-btn ghost sm full" href="/inhouse/admin/documents/new" style={{ marginTop: 10 }}>
                + 새 문서 등록
              </Link>
            )}
          </section>
          {!isNew && (
            <p className="wd-t9 wd-faint" style={{ margin: 0, lineHeight: 1.6 }}>
              {changedCount > 0 ? `${changedCount}개 조항이 바뀌어요.` : "바뀐 조항이 없으면 게시할 수 없어요."} 이전 버전은 문서의 변경 내역에 남아요.
            </p>
          )}
        </aside>
      </div>

      {preview && (
        <Modal
          eyebrow={`${next} 미리보기`}
          title={meta.title || "제목 없음"}
          sub={isNew ? meta.category : `시행 ${effective.replaceAll("-", ".")}`}
          size="lg"
          onClose={() => setPreview(false)}
          footer={
            <button type="button" className="wd-btn" onClick={() => setPreview(false)}>
              닫기
            </button>
          }
        >
          {!isNew && summary.trim() && (
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
                {d.title} {changed[i] && !isNew && <span className="wd-badge orange">수정됨</span>}
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
