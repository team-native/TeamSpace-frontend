"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useState } from "react";
import CommunityShell from "@/components/inhouse/CommunityShell";
import { Av, Confirm, Modal, copyLink, useOutside, useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import {
  REPORT_REASONS,
  addComment,
  deletePost,
  fetchPost,
  fetchPosts,
  likeComment,
  likePost,
  reportPost,
  type Comment,
  type Post,
  type PostDetail,
} from "@/lib/board";
import { loadLocal, saveLocal } from "@/lib/shared";
import EmptyState from "@/components/inhouse/EmptyState";

// 서버가 게시글 공감 여부를 주지 않아서, 이 기기에서 누른 기록으로 처음 상태만 맞춘다
const LIKED_KEY = "native-inhouse-liked-posts";

const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [post, setPost] = useState<PostDetail | null | undefined>(undefined);
  const [loadError, setLoadError] = useState("");
  const [related, setRelated] = useState<Post[]>([]);
  const [liked, setLiked] = useState(false);
  const [text, setText] = useState("");
  const [anon, setAnon] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const menuRef = useOutside<HTMLDivElement>(menuOpen, () => setMenuOpen(false));

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const p = await fetchPost(id);
      setPost(p);
      setLiked(loadLocal<string[]>(LIKED_KEY, []).includes(p.id));
      fetchPosts({ category: p.category, sort: "최신순", limit: 4 })
        .then((page) => setRelated(page.items.filter((x) => x.id !== p.id).slice(0, 3)))
        .catch(() => setRelated([]));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setPost(null);
      else setLoadError(errMsg(e, "게시글을 불러오지 못했어요."));
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadError)
    return (
      <CommunityShell>
        <EmptyState icon="!" title="게시글을 불러오지 못했어요" description={loadError} actionLabel="다시 시도" onAction={() => void load()} />
      </CommunityShell>
    );
  if (post === undefined)
    return (
      <CommunityShell>
        <div className="wd-muted wd-t11" aria-busy="true" style={{ padding: 48, textAlign: "center" }}>
          게시글을 불러오는 중…
        </div>
      </CommunityShell>
    );
  if (post === null)
    return (
      <CommunityShell>
        <EmptyState
          icon={<span style={{ display: "inline-block", transform: "translateY(5px)" }}>?</span>}
          title="게시글을 찾을 수 없어요"
          description="삭제됐거나 숨김 처리된 글이에요."
          actionLabel="목록으로"
          onAction={() => router.push("/inhouse/community")}
        />
      </CommunityShell>
    );

  const comments = post.comments;
  // 익명 댓글은 서버가 작성자를 알려주지 않아서 등장 순서대로 번호만 붙인다 (내 익명 댓글은 같은 번호)
  const anonNumbers = new Map<string, number>();
  comments
    .filter((c) => c.anonymous && c.author === "익명")
    .forEach((c) => {
      const key = c.mine ? "me" : c.id;
      if (!anonNumbers.has(key)) anonNumbers.set(key, anonNumbers.size + 1);
    });
  const anonLabel = (c: Comment) => anonNumbers.get(c.mine ? "me" : c.id);
  const isAuthor = (c: Comment) => c.author === "글쓴이" || (!post.anonymous && !c.anonymous && c.author === post.author);
  const displayName = (c: Comment) => (c.anonymous && c.author === "익명" ? `익명 ${anonLabel(c)}` : c.author);
  const roots = comments.filter((c) => !c.replyTo || !comments.some((x) => x.id === c.replyTo));

  const setComments = (next: Comment[]) => setPost((p) => (p ? { ...p, comments: next, commentCount: next.length } : p));

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const c = await addComment(post.id, { text: text.trim(), anonymous: post.anonComments && anon, replyTo: replyTo?.id });
      setComments([...comments, { ...c, mine: true }]);
      setText("");
      setReplyTo(null);
    } catch (e) {
      toast.show(errMsg(e, "댓글을 등록하지 못했어요."));
    } finally {
      setSending(false);
    }
  };

  const toggleLike = async () => {
    try {
      const r = await likePost(post.id);
      setLiked(r.liked);
      setPost((p) => (p ? { ...p, likes: r.likes } : p));
      const ids = loadLocal<string[]>(LIKED_KEY, []).filter((x) => x !== post.id);
      saveLocal(LIKED_KEY, r.liked ? [...ids, post.id].slice(-500) : ids);
    } catch (e) {
      toast.show(errMsg(e, "공감하지 못했어요."));
    }
  };

  const toggleCommentLike = async (c: Comment) => {
    try {
      const r = await likeComment(post.id, c.id);
      setComments(comments.map((x) => (x.id === c.id ? { ...x, liked: r.liked, likes: r.likes } : x)));
    } catch (e) {
      toast.show(errMsg(e, "공감하지 못했어요."));
    }
  };

  const CommentRow = ({ c, reply = false }: { c: Comment; reply?: boolean }) => (
    <div className={`wd-comment ${reply ? "reply" : ""}`}>
      {c.anonymous && c.author === "익명" ? <span className="wd-av">{anonLabel(c)}</span> : <Av name={c.author} />}
      <div>
        <header>
          {displayName(c)} {isAuthor(c) && <span className="wd-badge blue" style={{ height: 17 }}>글쓴이</span>} <small>{c.when}</small>
        </header>
        <p>{c.text}</p>
        <div className="wd-foot">
          <button
            type="button"
            aria-pressed={c.liked}
            style={{ border: 0, background: "none", padding: 0, color: c.liked ? "#3182f6" : "inherit", fontSize: 9 }}
            onClick={() => void toggleCommentLike(c)}
          >
            {c.liked ? "♥" : "♡"} 공감 {c.likes}
          </button>
          {!reply && (
            <button type="button" style={{ border: 0, background: "none", padding: 0, color: "inherit", fontSize: 9 }} onClick={() => setReplyTo(c)}>
              답글
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <CommunityShell>
      <div className="pf-post-layout">
        <article className="wd-card" style={{ padding: 30 }}>
          <div className="wd-between">
            <div className="wd-row" style={{ gap: 6 }}>
              {post.pinned && <span className="wd-badge dark">고정</span>}
              <span className="wd-badge blue">{post.category}</span>
            </div>
            <div style={{ position: "relative" }} ref={menuRef}>
              <button type="button" className="wd-x" style={{ background: "transparent", border: "1px solid var(--wd-line)", fontSize: 14 }} aria-label="더보기" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
                ⋯
              </button>
              {menuOpen && (
                <div className="wd-pop wd-menu" role="menu" style={{ top: 40, right: 0 }}>
                  <MenuItem
                    label="링크 복사"
                    onClick={async () => {
                      await copyLink();
                      setMenuOpen(false);
                      toast.show("링크를 복사했어요");
                    }}
                  />
                  {post.mine ? (
                    <>
                      <MenuItem label="수정" onClick={() => router.push(`/inhouse/community/write?edit=${post.id}`)} />
                      <hr />
                      <MenuItem
                        label="삭제"
                        danger
                        onClick={() => {
                          setMenuOpen(false);
                          setDeleteOpen(true);
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <hr />
                      <MenuItem
                        label="신고"
                        danger
                        onClick={() => {
                          setMenuOpen(false);
                          setReportOpen(true);
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <h1 style={{ margin: "14px 0 10px", fontSize: 26, letterSpacing: "-.05em", fontWeight: 620 }}>{post.title}</h1>
          <div className="wd-row wd-t10 wd-faint" style={{ gap: 10, marginBottom: 24 }}>
            {post.anonymous ? <span className="wd-av sm">?</span> : <Av name={post.author} size="sm" />}
            <b style={{ color: "#191f28" }}>{post.author}</b> · {post.when} · 조회 {post.views}
          </div>
          <div className="wd-doc" style={{ marginBottom: 26, whiteSpace: "pre-line" }}>
            <p>{post.body}</p>
          </div>
          <div className="wd-row" style={{ gap: 8, paddingBottom: 20, borderBottom: "1px solid #e5e8eb" }}>
            <button type="button" aria-pressed={liked} className={`wd-chip ${liked ? "bon" : ""}`} onClick={() => void toggleLike()}>
              {liked ? "♥" : "♡"} 공감 {post.likes}
            </button>
            <button
              type="button"
              className="wd-chip"
              onClick={async () => {
                await copyLink();
                toast.show("링크를 복사했어요");
              }}
            >
              링크 복사
            </button>
          </div>
          <div className="wd-between" style={{ margin: "20px 0 4px" }}>
            <b className="wd-t12">댓글 {comments.length}</b>
            <span className="wd-t9 wd-faint">{post.anonComments ? "익명 댓글 허용" : "실명 댓글만"}</span>
          </div>
          {roots.map((c) => (
            <Fragment key={c.id}>
              <CommentRow c={c} />
              {comments
                .filter((r) => r.replyTo === c.id)
                .map((r) => (
                  <CommentRow key={r.id} c={r} reply />
                ))}
            </Fragment>
          ))}
          {replyTo && (
            <div className="wd-between wd-t10 wd-muted" style={{ marginTop: 10 }}>
              <span>{displayName(replyTo)}님에게 답글 다는 중</span>
              <button type="button" className="wd-link" style={{ border: 0, background: "none" }} onClick={() => setReplyTo(null)}>
                취소
              </button>
            </div>
          )}
          <form
            className="wd-row"
            style={{ marginTop: 12, flexWrap: "wrap" }}
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            {post.anonComments && (
              <div className="wd-seg" style={{ width: 140 }}>
                <button type="button" className={!anon ? "on" : ""} onClick={() => setAnon(false)}>
                  실명
                </button>
                <button type="button" className={anon ? "on" : ""} onClick={() => setAnon(true)}>
                  익명
                </button>
              </div>
            )}
            <input className="wd-input" style={{ flex: 1, minWidth: 200 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="댓글을 남겨주세요" />
            <button type="submit" className="wd-btn" disabled={!text.trim() || sending}>
              {sending ? "등록 중…" : "등록"}
            </button>
          </form>
        </article>
        <aside className="wd-card soft">
          <h3 style={{ fontSize: 12 }}>이 카테고리의 다른 글</h3>
          {related.length === 0 && <p className="wd-t10 wd-faint" style={{ margin: "10px 0" }}>다른 글이 없어요</p>}
          {related.map((p) => (
            <Link key={p.id} href={`/inhouse/community/${p.id}`} className="wd-between wd-t10" style={{ padding: "10px 0" }}>
              {p.title}
              <span className="wd-faint">→</span>
            </Link>
          ))}
          <Link href="/inhouse/community" className="wd-btn ghost sm full" style={{ marginTop: 10 }}>
            목록으로
          </Link>
        </aside>
      </div>

      {reportOpen && (
        <Modal
          eyebrow="REPORT"
          title="이 글을 신고할까요?"
          sub="신고자는 공개되지 않아요. 운영진이 확인 후 처리해요."
          size="sm"
          onClose={() => setReportOpen(false)}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => setReportOpen(false)}>
                취소
              </button>
              <button
                type="button"
                className="wd-btn"
                style={{ background: "#f04452" }}
                onClick={async () => {
                  try {
                    await reportPost(post.id, reason);
                    setReportOpen(false);
                    toast.show("신고했어요. 운영진이 확인할게요.");
                  } catch (e) {
                    toast.show(errMsg(e, "신고하지 못했어요."));
                  }
                }}
              >
                신고하기
              </button>
            </>
          }
        >
          <div className="wd-stack" style={{ gap: 8 }} role="radiogroup">
            {REPORT_REASONS.map((x) => (
              <button
                type="button"
                role="radio"
                aria-checked={reason === x}
                key={x}
                className="wd-row wd-t11"
                style={{ padding: "11px 12px", border: `1px solid ${reason === x ? "#3182f6" : "var(--wd-line)"}`, borderRadius: 11, background: "transparent", textAlign: "left" }}
                onClick={() => setReason(x)}
              >
                <span className={`wd-radio ${reason === x ? "on" : ""}`} />
                {x}
              </button>
            ))}
          </div>
        </Modal>
      )}
      {deleteOpen && (
        <Confirm
          title="게시글을 삭제할까요?"
          message={`댓글 ${comments.length}개도 함께 보이지 않고 되돌릴 수 없어요.`}
          confirmLabel="삭제"
          danger
          onClose={() => setDeleteOpen(false)}
          onConfirm={async () => {
            try {
              await deletePost(post.id);
              router.replace("/inhouse/community");
            } catch (e) {
              setDeleteOpen(false);
              toast.show(errMsg(e, "삭제하지 못했어요."));
            }
          }}
        />
      )}
      {toast.node}
    </CommunityShell>
  );
}

function MenuItem({ label, danger = false, onClick }: { label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button type="button" role="menuitem" className={danger ? "red" : ""} onClick={onClick}>
      {label}
    </button>
  );
}
