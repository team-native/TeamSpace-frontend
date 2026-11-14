"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import CommunityShell from "@/components/inhouse/CommunityShell";
import { Eyebrow, useToast } from "@/components/inhouse/ui";
import { MAX_IMAGES, WRITE_CATEGORIES, createPost, fetchPost, updatePost, type PostInput } from "@/lib/board";
import { uploadFile } from "@/lib/approvals";
import type { Attachment } from "@/lib/api";
import { UploadImage } from "@/components/inhouse/PostImages";
import { loadLocal, saveLocal } from "@/lib/shared";
import { isAdminRole, useMe } from "@/lib/session";

const DRAFT_KEY = "native-inhouse-post-draft";
const MAX_TITLE = 50;
const MAX_BODY = 2000;
const MAX_IMAGE_MB = 10;

type Draft = Omit<PostInput, "attachments">;
const EMPTY: Draft = { category: "자유", title: "", body: "", anonymous: false, anonComments: true };

export default function WritePage() {
  return (
    <Suspense>
      <Write />
    </Suspense>
  );
}

function Write() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const editId = params.get("edit");
  const [d, setD] = useState<Draft>(EMPTY);
  const [savedAt, setSavedAt] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const [original, setOriginal] = useState<Draft | null>(null);
  const [loadError, setLoadError] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<Attachment[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const { me } = useMe();
  // 공지 분류는 관리자만 (서버 기준)
  const categories = isAdminRole(me) ? [...WRITE_CATEGORIES, "공지"] : [...WRITE_CATEGORIES];

  useEffect(() => {
    if (editId) {
      fetchPost(editId)
        .then((p) => {
          if (!p.mine) {
            setLoadError("내가 쓴 글만 고칠 수 있어요.");
            return;
          }
          const draft = { category: p.category, title: p.title, body: p.body, anonymous: p.anonymous, anonComments: p.anonComments };
          setD(draft);
          setOriginal(draft);
          setImages(p.attachments);
          setOriginalImages(p.attachments.map((a) => a.id));
        })
        .catch((e) => setLoadError(e instanceof Error ? e.message : "게시글을 불러오지 못했어요."));
      return;
    }
    const saved = loadLocal<Draft | null>(DRAFT_KEY, null);
    if (saved && (saved.title || saved.body)) {
      setD(saved);
      setHasDraft(true);
    }
  }, [editId]);

  const saveDraft = (silent = false) => {
    saveLocal(DRAFT_KEY, d);
    setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }));
    if (!silent) toast.show("임시 저장했어요");
  };

  useEffect(() => {
    if (editId || (!d.title && !d.body)) return;
    const t = setTimeout(() => saveDraft(true), 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d]);

  // 고르자마자 하나씩 올리고, 올라간 것만 글에 붙인다
  const addImages = async (files: FileList | null) => {
    if (!files) return;
    const room = MAX_IMAGES - images.length - uploading;
    const picked = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (picked.length === 0) return;
    if (picked.length > room) toast.show(`사진은 ${MAX_IMAGES}장까지 올릴 수 있어요`);
    for (const f of picked.slice(0, Math.max(room, 0))) {
      if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
        toast.show(`${f.name}: ${MAX_IMAGE_MB}MB 이하만 올릴 수 있어요`);
        continue;
      }
      setUploading((n) => n + 1);
      uploadFile(f)
        .then((a) => setImages((xs) => (xs.length < MAX_IMAGES ? [...xs, a] : xs)))
        .catch((e) => toast.show(e instanceof Error ? e.message : "사진을 올리지 못했어요."))
        .finally(() => setUploading((n) => n - 1));
    }
  };

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  return (
    <CommunityShell>
      <form
        className="wd-narrow"
        style={{ width: "min(760px, 100%)" }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (sending) return;
          setError("");
          if (uploading > 0) return;
          const input: Draft = { ...d, title: d.title.trim(), body: d.body.trim() };
          const ids = images.map((a) => a.id);
          setSending(true);
          try {
            if (editId) {
              // 바뀐 항목만 보낸다
              const changes = Object.fromEntries(
                (Object.keys(input) as (keyof Draft)[]).filter((k) => !original || input[k] !== original[k]).map((k) => [k, input[k]]),
              ) as Partial<PostInput>;
              if (ids.join() !== originalImages.join()) changes.attachments = ids;
              if (Object.keys(changes).length > 0) await updatePost(editId, changes);
              router.push(`/inhouse/community/${editId}`);
            } else {
              const { id } = await createPost({ ...input, attachments: ids });
              saveLocal(DRAFT_KEY, null);
              router.push(`/inhouse/community/${id}`);
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "글을 올리지 못했어요.");
            setSending(false);
          }
        }}
      >
        <section className="wd-hero sm">
          <div>
            <Eyebrow>WRITE</Eyebrow>
            <h1>{editId ? "글 수정" : "글쓰기"}</h1>
          </div>
          {savedAt ? (
            <span className="wd-t10 wd-faint">✓ {savedAt} 임시 저장됨</span>
          ) : (
            hasDraft && <span className="wd-t10 wd-faint">임시 저장된 글을 불러왔어요</span>
          )}
        </section>
        <div className="wd-card" style={{ padding: 28 }}>
          <div className="wd-field">
            <span>카테고리</span>
            <div className="wd-seg">
              {categories.map((c) => (
                <button type="button" key={c} className={d.category === c ? "on" : ""} onClick={() => set("category", c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <label className="wd-field">
            <span>
              제목 <em>{d.title.length} / {MAX_TITLE}</em>
            </span>
            <input className="wd-input" required maxLength={MAX_TITLE} value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="제목을 입력하세요" />
          </label>
          <label className="wd-field">
            <span>
              내용 <em>{d.body.length.toLocaleString()} / {MAX_BODY.toLocaleString()}</em>
            </span>
            <textarea className="wd-input" required maxLength={MAX_BODY} style={{ minHeight: 200 }} value={d.body} onChange={(e) => set("body", e.target.value)} placeholder="팀원들과 나누고 싶은 이야기를 적어주세요" />
          </label>
          <div className="wd-field">
            <span>
              사진 <em>{images.length} / {MAX_IMAGES}</em>
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
              {images.map((a) => (
                <div key={a.id} style={{ position: "relative", aspectRatio: "1 / 1" }}>
                  <UploadImage id={a.id} alt={a.name} />
                  <button
                    type="button"
                    aria-label={`${a.name} 빼기`}
                    onClick={() => setImages((xs) => xs.filter((x) => x.id !== a.id))}
                    style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: 12, border: 0, background: "rgba(0,0,0,.6)", color: "#fff", cursor: "pointer", lineHeight: "24px" }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {Array.from({ length: uploading }, (_, i) => (
                <span key={`u${i}`} className="wd-t9 wd-faint" aria-busy="true" style={{ aspectRatio: "1 / 1", borderRadius: 12, background: "var(--t-soft)", display: "grid", placeItems: "center" }}>
                  올리는 중…
                </span>
              ))}
              {images.length + uploading < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{ aspectRatio: "1 / 1", borderRadius: 12, border: "1px dashed var(--t-line-strong)", background: "transparent", color: "var(--t-faint)", cursor: "pointer", fontSize: 13 }}
                >
                  + 사진
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                void addImages(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          <div className="wd-grid g2" style={{ marginBottom: 22 }}>
            <div className="wd-field" style={{ marginBottom: 0 }}>
              <span>작성자 표시</span>
              <div className="wd-seg">
                <button type="button" className={!d.anonymous ? "on" : ""} onClick={() => set("anonymous", false)}>
                  실명 · {me?.name}
                </button>
                <button type="button" className={d.anonymous ? "on" : ""} onClick={() => set("anonymous", true)}>
                  익명
                </button>
              </div>
            </div>
            <div className="wd-field" style={{ marginBottom: 0 }}>
              <span>댓글 작성자</span>
              <div className="wd-seg">
                <button type="button" className={!d.anonComments ? "on" : ""} onClick={() => set("anonComments", false)}>
                  실명만
                </button>
                <button type="button" className={d.anonComments ? "on" : ""} onClick={() => set("anonComments", true)}>
                  익명 허용
                </button>
              </div>
            </div>
          </div>
          <div className="wd-banner gray" style={{ padding: "12px 14px", marginBottom: 22 }}>
            <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>i</span>
            <p style={{ margin: 0 }}>익명 댓글은 &lsquo;익명 1, 2…&rsquo; 번호로 표시되고 글쓴이 댓글엔 &lsquo;글쓴이&rsquo; 표시가 붙어요.</p>
          </div>
          {(error || loadError) && (
            <div className="wd-banner danger" role="alert" style={{ padding: "12px 14px", marginBottom: 16 }}>
              <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>!</span>
              <p style={{ margin: 0 }}>{error || loadError}</p>
            </div>
          )}
          <div className="wd-row" style={{ justifyContent: "flex-end" }}>
            {!editId && (
              <button type="button" className="wd-btn ghost" onClick={() => saveDraft()}>
                임시 저장
              </button>
            )}
            <button type="submit" className="wd-btn" disabled={sending || uploading > 0 || !!loadError}>
              {sending ? "보내는 중…" : uploading > 0 ? "사진 올리는 중…" : editId ? "수정하기" : "올리기"}
            </button>
          </div>
        </div>
      </form>
      {toast.node}
    </CommunityShell>
  );
}
