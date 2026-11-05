"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminShell, { AdminToggle } from "@/components/inhouse/AdminShell";
import { useToast } from "@/components/inhouse/ui";
import { fileSize, type Attachment } from "@/lib/api";
import { createNotice, updateNotice, type NoticeInput } from "@/lib/admin-api";
import { uploadFile } from "@/lib/approvals";
import { fetchDocs, type DocItem } from "@/lib/docs";
import { fetchNotice } from "@/lib/notices";
import { usePeople } from "@/lib/people";
import { useMe } from "@/lib/session";

const KINDS = ["필독", "제도", "일정", "일반"];
const MAX_TITLE = 60;
const MAX_DOCS = 3;
const MAX_FILES = 5;

export default function AdminNoticeNew() {
  const router = useRouter();
  const toast = useToast();
  const { me } = useMe();
  const { people } = usePeople();
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState("필독");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [allDocs, setAllDocs] = useState<DocItem[]>([]);
  const [docs, setDocs] = useState<{ slug: string; title: string }[]>([]);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [mustRead, setMustRead] = useState(true);
  const [scheduled, setScheduled] = useState(false);
  const [at, setAt] = useState("");
  const [saving, setSaving] = useState<"" | "draft" | "publish">("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDocs(100)
      .then((list) => setAllDocs(list.filter((d) => d.type !== "TEMPLATE")))
      .catch(() => {});
    // ?id= 로 들어오면 기존 공지 수정
    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;
    setEditId(id);
    setLoading(true);
    fetchNotice(id)
      .then((n) => {
        setKind(n.kind);
        setTitle(n.title);
        setBody(n.body);
        setPinned(n.pinned);
        setMustRead(n.mustRead);
        setDocs(n.related.map(([slug, t]) => ({ slug, title: t })));
        setFiles(n.attachments);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "공지를 불러오지 못했어요."))
      .finally(() => setLoading(false));
  }, []);

  const addable = allDocs.filter((d) => !docs.some((x) => x.slug === d.slug));
  const previewTitle = title.trim() || "제목을 입력하면 여기에 보여요";
  const atDate = at ? new Date(at) : null;
  const atValid = !!atDate && !Number.isNaN(atDate.getTime()) && atDate.getTime() > Date.now();
  const canSubmit = !!title.trim() && !!body.trim() && (!scheduled || atValid) && !uploading;

  const addFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    const picked = Array.from(list).slice(0, MAX_FILES - files.length);
    setUploading(true);
    try {
      for (const f of picked) {
        if (f.size > 10 * 1024 * 1024) {
          toast.show(`${f.name}: 10MB 이하만 올릴 수 있어요`);
          continue;
        }
        const up = await uploadFile(f);
        setFiles((prev) => [...prev, up]);
      }
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "파일을 올리지 못했어요.");
    } finally {
      setUploading(false);
    }
  };

  const save = async (draft: boolean) => {
    if (saving) return;
    if (!draft && !canSubmit) return;
    if (draft && !title.trim()) {
      toast.show("제목을 먼저 적어 주세요");
      return;
    }
    setSaving(draft ? "draft" : "publish");
    setError("");
    const input: NoticeInput = {
      kind,
      title: title.trim(),
      body,
      pinned,
      mustRead,
      status: draft ? "DRAFT" : scheduled ? "SCHEDULED" : "PUBLISHED",
      // 서버는 시간대가 붙은 시각을 받는다
      publishAt: !draft && scheduled && atDate ? atDate.toISOString() : null,
      sendPush: !draft,
      attachments: files.map((f) => f.id),
      linkedDocuments: docs,
    };
    try {
      const r = editId ? await updateNotice(editId, input) : await createNotice(input);
      if (draft) {
        if (!editId) {
          setEditId(r.id);
          history.replaceState(null, "", `?id=${r.id}`);
        }
        toast.show("임시 저장했어요");
      } else {
        toast.show(scheduled ? "예약했어요. 시간이 되면 게시돼요" : "등록하고 알림을 보냈어요");
        setTimeout(() => router.push(scheduled ? "/inhouse/community/notices" : `/inhouse/community/notices/${r.id}`), 700);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "공지를 저장하지 못했어요.");
    } finally {
      setSaving("");
    }
  };

  return (
    <AdminShell
      title={editId ? "공지 수정" : "공지 등록"}
      right={
        <div className="wd-row">
          <button type="button" className="wd-btn ghost" onClick={() => save(true)} disabled={!!saving || loading} aria-busy={saving === "draft"}>
            {saving === "draft" ? "저장 중…" : "임시 저장"}
          </button>
          <button type="submit" form="notice-form" className="wd-btn" disabled={!canSubmit || !!saving || loading} aria-busy={saving === "publish"}>
            {saving === "publish" ? "보내는 중…" : scheduled ? "예약하기" : editId ? "저장하고 알림 보내기" : "등록하고 알림 보내기"}
          </button>
        </div>
      }
    >
      {error && (
        <div className="wd-banner danger" role="alert" style={{ marginBottom: 18 }}>
          <span className="ico">!</span>
          <div>
            <b>{error}</b>
          </div>
        </div>
      )}
      {loading ? (
        <p className="wd-t11 wd-faint" aria-busy="true">
          공지를 불러오는 중이에요…
        </p>
      ) : (
        <div className="wd-side">
          <form
            id="notice-form"
            className="wd-card"
            style={{ padding: 28 }}
            onSubmit={(e) => {
              e.preventDefault();
              save(false);
            }}
          >
            <div className="wd-field">
              <span>분류</span>
              <div className="wd-seg" role="radiogroup" aria-label="분류">
                {KINDS.map((k) => (
                  <button type="button" key={k} role="radio" aria-checked={kind === k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>
                    {k}
                  </button>
                ))}
              </div>
            </div>
            <label className="wd-field">
              <span>
                제목 <em>{title.length} / {MAX_TITLE}</em>
              </span>
              <input className="wd-input" required maxLength={MAX_TITLE} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 11월 정산 일정 안내 — 영수증은 11.28까지" />
            </label>
            <label className="wd-field">
              <span>본문</span>
              <textarea className="wd-input" required style={{ minHeight: 180 }} value={body} onChange={(e) => setBody(e.target.value)} placeholder="일정, 대상, 해야 할 일을 적어주세요" />
            </label>
            <div className="wd-field">
              <span>
                첨부 파일 <em>최대 {MAX_FILES}개 · 10MB 이하</em>
              </span>
              <div className="wd-stack" style={{ gap: 6 }}>
                {files.map((f) => (
                  <div key={f.id} className="wd-file">
                    <span className="ext">{f.name.split(".").pop()?.slice(0, 4).toUpperCase() || "FILE"}</span>
                    <div>
                      <b>{f.name}</b>
                      <small>{fileSize(f.size)}</small>
                    </div>
                    <button type="button" className="wd-btn ghost sm" style={{ marginLeft: "auto" }} onClick={() => setFiles(files.filter((x) => x.id !== f.id))} aria-label={`${f.name} 빼기`}>
                      ×
                    </button>
                  </div>
                ))}
                {files.length < MAX_FILES && (
                  <label className="wd-btn line sm" style={{ cursor: "pointer", alignSelf: "flex-start" }} aria-busy={uploading}>
                    {uploading ? "올리는 중…" : "+ 파일 올리기"}
                    <input
                      type="file"
                      multiple
                      style={{ display: "none" }}
                      disabled={uploading}
                      onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="wd-field" style={{ marginBottom: 0 }}>
              <span>
                관련 문서 <em>최대 {MAX_DOCS}개</em>
              </span>
              <div className="wd-chips">
                {docs.map((d) => (
                  <button type="button" key={d.slug} className="wd-chip on" onClick={() => setDocs(docs.filter((x) => x.slug !== d.slug))} aria-label={`${d.title} 빼기`}>
                    {d.title} ×
                  </button>
                ))}
                {docs.length < MAX_DOCS && addable.length > 0 && (
                  <select
                    className="wd-chip"
                    style={{ borderStyle: "dashed", font: "inherit" }}
                    value=""
                    aria-label="문서함에서 선택"
                    onChange={(e) => {
                      const d = allDocs.find((x) => x.slug === e.target.value);
                      if (d) setDocs([...docs, { slug: d.slug, title: d.title }]);
                    }}
                  >
                    <option value="">+ 문서함에서 선택</option>
                    {addable.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </form>
          <aside className="wd-stack">
            <section className="wd-card">
              <h3 style={{ fontSize: 12 }}>게시 옵션</h3>
              <AdminToggle on={pinned} onChange={setPinned} label="상단 고정" desc="공지 목록과 홈 피드 맨 위" />
              <AdminToggle on={mustRead} onChange={setMustRead} label="필독" desc="전원 확인 요청 · 확인 현황 집계" />
              <AdminToggle on={scheduled} onChange={setScheduled} label="예약 게시" desc={scheduled ? "정한 시간에 게시" : "지금 바로 게시"} />
              {scheduled && (
                <>
                  <input className="wd-input" type="datetime-local" aria-label="예약 시간" value={at} onChange={(e) => setAt(e.target.value)} style={{ marginTop: 12 }} />
                  {at && !atValid && <p className="wd-t9" style={{ color: "#f04452", margin: "6px 0 0" }}>지금보다 뒤의 시간을 골라 주세요</p>}
                </>
              )}
            </section>
            <section className="wd-card soft">
              <h3 style={{ fontSize: 12 }}>알림 미리보기</h3>
              <div className="wd-li unread" style={{ padding: "12px 10px", marginTop: 10, borderRadius: 12, gridTemplateColumns: "auto 1fr" }}>
                <span className="ico orange">공</span>
                <div>
                  <b style={{ fontSize: 11 }}>
                    새 공지: {mustRead ? "[필독] " : ""}
                    {previewTitle}
                  </b>
                  <p>{[me?.dept, "방금"].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              <p className="wd-t9 wd-faint" style={{ margin: "10px 0 0" }}>
                {people ? `전체 ${people.length}명` : "전체 팀원"} · 방해 금지 시간인 사람은 푸시 없이 알림 센터에만 쌓여요
              </p>
            </section>
          </aside>
        </div>
      )}
      {toast.node}
    </AdminShell>
  );
}
