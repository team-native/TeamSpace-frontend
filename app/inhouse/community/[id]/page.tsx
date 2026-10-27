"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import CommunityShell, { board } from "@/components/inhouse/CommunityShell";
import { Av, Confirm, Modal, copyLink, useOutside, useToast } from "@/components/inhouse/ui";
import { ME, REPORT_REASONS, type Comment, type Post } from "@/lib/demo";
import EmptyState from "@/components/inhouse/EmptyState";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [text, setText] = useState("");
  const [anon, setAnon] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const menuRef = useOutside<HTMLDivElement>(menuOpen, () => setMenuOpen(false));

  useEffect(() => {
    setPost(board.posts().find((p) => p.id === id) ?? null);
    setComments(board.comments(id));
    setLiked(board.liked().includes(id));
  }, [id]);

  if (post === undefined) return <CommunityShell>{null}</CommunityShell>;
  if (post === null)
  return (
    <CommunityShell>
      <EmptyState
        icon={
                <span style={{ display: "inline-block", transform: "translateY(5px)" }}>
                  ?
                </span>
              }
        title="페이지를 찾을 수 없어요"
        description="삭제됐거나 주소가 바뀌었어요."
        actionLabel="홈으로"
        onAction={() => router.push("/inhouse/community")}
      />
    </CommunityShell>
  );

  // 익명 댓글 작성자에게 처음 등장한 순서대로 번호를 매김
  const anonNumbers = new Map<string, number>();
  comments.filter((c) => c.anonymous).forEach((c) => {
    const key = c.author === ME.name ? ME.name : c.id;
    if (!anonNumbers.has(key)) anonNumbers.set(key, anonNumbers.size + 1);
  });
  const isAuthor = (c: Comment) => !post.anonymous && !c.anonymous && c.author === post.author;
  const displayName = (c: Comment) => (c.anonymous ? `익명 ${anonNumbers.get(c.author === ME.name ? ME.name : c.id)}` : c.author);
  const likes = post.likes + (liked ? 1 : 0);
  const roots = comments.filter((c) => !c.replyTo);

  const submit = () => {
    if (!text.trim()) return;
    const c: Comment = {
      id: `c-${Date.now()}`,
      postId: id,
      author: ME.name,
      anonymous: post.anonComments && anon,
      text: text.trim(),
      when: "방금",
      likes: 0,
      replyTo: replyTo?.id,
    };
    board.addComment(c);
    setComments([...comments, c]);
    setText("");
    setReplyTo(null);
  };

  const CommentRow = ({ c, reply = false }: { c: Comment; reply?: boolean }) => (
    <div className={`wd-comment ${reply ? "reply" : ""}`}>
      {c.anonymous ? <span className="wd-av">{anonNumbers.get(c.author === ME.name ? ME.name : c.id)}</span> : <Av name={c.author} id={c.author === ME.name ? ME.id : undefined} />}
      <div>
        <header>
          {displayName(c)} {isAuthor(c) && <span className="wd-badge blue" style={{ height: 17 }}>글쓴이</span>} <small>{c.when}</small>
        </header>
        <p>{c.text}</p>
        {!reply && (
          <div className="wd-foot">
            <span>공감 {c.likes}</span>
            <button type="button" style={{ border: 0, background: "none", padding: 0, color: "inherit", fontSize: 9 }} onClick={() => setReplyTo(c)}>
              답글
            </button>
          </div>
        )}
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
              <button type="button" className="wd-x" style={{ background: "#fff", border: "1px solid #e5e8eb", fontSize: 14 }} aria-label="더보기" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
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
            {post.anonymous ? <span className="wd-av sm">?</span> : <Av name={post.author} size="sm" id={post.mine ? ME.id : undefined} />}
            <b style={{ color: "#191f28" }}>{post.anonymous ? "익명" : post.author}</b> · {post.when} · 조회 {post.views + 1}
          </div>
          <div className="wd-doc" style={{ marginBottom: 26, whiteSpace: "pre-line" }}>
            <p>{post.body}</p>
          </div>
          <div className="wd-row" style={{ gap: 8, paddingBottom: 20, borderBottom: "1px solid #e5e8eb" }}>
            <button type="button" aria-pressed={liked} className={`wd-chip ${liked ? "bon" : ""}`} onClick={() => setLiked(board.toggleLike(id).includes(id))}>
              {liked ? "♥" : "♡"} 공감 {likes}
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
              submit();
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
            <button type="submit" className="wd-btn" disabled={!text.trim()}>
              등록
            </button>
          </form>
        </article>
        <aside className="wd-card soft">
          <h3 style={{ fontSize: 12 }}>이 카테고리의 다른 글</h3>
          {board
            .posts()
            .filter((p) => p.category === post.category && p.id !== post.id)
            .slice(0, 3)
            .map((p) => (
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
                onClick={() => {
                  setReportOpen(false);
                  toast.show("신고했어요. 운영진이 확인할게요.");
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
                style={{ padding: "11px 12px", border: `1px solid ${reason === x ? "#3182f6" : "#e5e8eb"}`, borderRadius: 11, background: "#fff", textAlign: "left" }}
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
          message={`댓글 ${comments.length}개도 함께 지워지고 되돌릴 수 없어요.`}
          confirmLabel="삭제"
          danger
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => {
            board.deletePost(post.id);
            router.replace("/inhouse/community");
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
