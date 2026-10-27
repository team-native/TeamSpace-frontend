"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import CommunityShell, { board } from "@/components/inhouse/CommunityShell";
import { Eyebrow } from "@/components/inhouse/ui";
import { BOARD_CATEGORIES, COMMENTS, type Post } from "@/lib/demo";
import EmptyState from "@/components/inhouse/EmptyState";

const SORTS = ["최신순", "공감순", "댓글순"] as const;
const TONE: Record<string, string> = { 모집: "blue", 칭찬: "green", 질문: "violet" };

export default function BoardPage() {
  return (
    <Suspense>
      <Board />
    </Suspense>
  );
}

function Board() {
  const params = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("최신순");
  const [query, setQuery] = useState("");
  const mineOnly = params.get("mine") === "1";

  useEffect(() => setPosts(board.posts()), []);

  const commentCount = (id: string) => board.comments(id).length || COMMENTS.filter((c) => c.postId === id).length;
  const shown = useMemo(() => {
    const q = query.trim();
    const list = posts.filter(
      (p) => (category === "전체" || p.category === category) && (!mineOnly || p.mine) && (!q || `${p.title} ${p.body}`.includes(q)),
    );
    const sorted = [...list];
    if (sort === "공감순") sorted.sort((a, b) => b.likes - a.likes);
    if (sort === "댓글순") sorted.sort((a, b) => commentCount(b.id) - commentCount(a.id));
    return [...sorted.filter((p) => p.pinned), ...sorted.filter((p) => !p.pinned)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, category, sort, query, mineOnly]);

  return (
    <CommunityShell>
      <section className="wd-hero sm">
        <div>
          <Eyebrow>BOARD</Eyebrow>
          <h1>{mineOnly ? "내 게시글" : "팀 게시판"}</h1>
          <p>실명이나 익명으로 자유롭게 이야기해요.</p>
        </div>
        <Link className="wd-btn" href="/inhouse/community/write">
          글쓰기
        </Link>
      </section>
      <div className="wd-between" style={{ marginBottom: 6, flexWrap: "wrap" }}>
        <div className="wd-chips">
          {["전체", ...BOARD_CATEGORIES, "공지"].map((c) => (
            <button type="button" key={c} className={`wd-chip ${category === c ? "on" : ""}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="wd-row" style={{ flexWrap: "wrap" }}>
          <label className="wd-search" style={{ width: 240, height: 38 }}>
            <i>⌕</i>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="게시글 검색" />
          </label>
          <div className="wd-tabs">
            {SORTS.map((s) => (
              <button type="button" key={s} className={sort === s ? "on" : ""} onClick={() => setSort(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      {shown.length > 0 ? (
  <div className="wd-list">
    {shown.map((p) => (
      <Link
        key={p.id}
        href={`/inhouse/community/${p.id}`}
        className={`wd-post link ${p.pinned ? "pin" : ""}`}
        style={{ padding: "20px 14px" }}
      >
        <div>
          <div className="wd-row" style={{ gap: 6 }}>
            {p.pinned && <span className="wd-badge dark">고정</span>}
            <span className={`wd-badge ${TONE[p.category] ?? ""}`}>{p.category}</span>
          </div>
          <b>{p.title}</b>
          <p>{p.body.split("\n")[0]}</p>
          <div className="wd-foot">
            <span>{p.anonymous ? "익명" : p.author}</span>
            <span>
              조회 {p.views} · 공감 {p.likes} · 댓글 {commentCount(p.id)}
            </span>
          </div>
        </div>
        <span className="wd-t9 wd-faint">{p.when}</span>
      </Link>
    ))}
  </div>
) : (
  <EmptyState
    icon="⌕"
    title="검색 결과가 없어요"
    description="다른 단어로 찾아보거나 필터를 풀어보세요."
    actionLabel="필터 초기화"
    onAction={() => {
      setQuery("");
      setCategory("전체");
      setSort("최신순");
    }}
  />
)}
      </CommunityShell>
    );
}