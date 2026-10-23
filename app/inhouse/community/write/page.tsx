"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import CommunityShell, { board } from "@/components/inhouse/CommunityShell";
import { Eyebrow, useToast } from "@/components/inhouse/ui";
import { BOARD_CATEGORIES, ME, loadLocal, saveLocal } from "@/lib/demo";

const DRAFT_KEY = "native-inhouse-post-draft";
const MAX_TITLE = 50;
const MAX_BODY = 2000;

type Draft = { category: string; title: string; body: string; anonymous: boolean; anonComments: boolean };
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

  useEffect(() => {
    const editing = editId ? board.posts().find((p) => p.id === editId) : undefined;
    if (editing) {
      setD({ category: editing.category, title: editing.title, body: editing.body, anonymous: editing.anonymous, anonComments: editing.anonComments });
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

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  return (
    <CommunityShell>
      <form
        className="wd-narrow"
        style={{ width: "min(760px, 100%)" }}
        onSubmit={(e) => {
          e.preventDefault();
          const existing = editId ? board.posts().find((p) => p.id === editId) : undefined;
          const post = {
            ...(existing ?? { id: `p-${Date.now()}`, views: 0, likes: 0, when: "방금", mine: true }),
            category: d.category,
            title: d.title.trim(),
            body: d.body.trim(),
            anonymous: d.anonymous,
            anonComments: d.anonComments,
            author: d.anonymous ? "익명" : ME.name,
          };
          if (existing) board.updatePost(post);
          else board.addPost(post);
          saveLocal(DRAFT_KEY, null);
          router.push(`/inhouse/community/${post.id}`);
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
              {BOARD_CATEGORIES.map((c) => (
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
          <div className="wd-grid g2" style={{ marginBottom: 22 }}>
            <div className="wd-field" style={{ marginBottom: 0 }}>
              <span>작성자 표시</span>
              <div className="wd-seg">
                <button type="button" className={!d.anonymous ? "on" : ""} onClick={() => set("anonymous", false)}>
                  실명 · {ME.name}
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
          <div className="wd-row" style={{ justifyContent: "flex-end" }}>
            {!editId && (
              <button type="button" className="wd-btn ghost" onClick={() => saveDraft()}>
                임시 저장
              </button>
            )}
            <button type="submit" className="wd-btn">
              {editId ? "수정하기" : "올리기"}
            </button>
          </div>
        </div>
      </form>
      {toast.node}
    </CommunityShell>
  );
}
