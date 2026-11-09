"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import CommunityShell from "@/components/inhouse/CommunityShell";
import { Eyebrow } from "@/components/inhouse/ui";
import { FILTER_CATEGORIES, SORTS, fetchPosts, type Post, type SortLabel } from "@/lib/board";
import EmptyState from "@/components/inhouse/EmptyState";

const TONE: Record<string, string> = { 모집: "blue", 칭찬: "green", 질문: "violet", "정보 공유": "orange", 공지: "dark" };

export default function BoardPage() {
  return (
    <Suspense>
      <Board />
    </Suspense>
  );
}

// GET /posts — 분류 · 정렬 · 검색 · 내 글은 서버가 거르고, 고정 글은 서버가 앞에 둔다
function Board() {
  const params = useSearchParams();
  const mineOnly = params.get("mine") === "1";
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState<SortLabel>("최신순");
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  // 입력이 멈추고 0.3초 뒤에 검색
  useEffect(() => {
    const t = setTimeout(() => setQuery(input), 300);
    return () => clearTimeout(t);
  }, [input]);

  // 조건이 빨리 바뀌면 늦게 온 이전 응답은 버린다
  const req = useRef(0);
  const load = useCallback(async () => {
    const id = ++req.current;
    setError("");
    setPosts(null);
    try {
      const page = await fetchPosts({ category, sort, q: query, mine: mineOnly });
      if (id !== req.current) return;
      setPosts(page.items);
      setCursor(page.nextCursor);
    } catch (e) {
      if (id !== req.current) return;
      setError(e instanceof Error ? e.message : "게시글을 불러오지 못했어요.");
      setPosts([]);
    }
  }, [category, sort, query, mineOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const more = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchPosts({ category, sort, q: query, mine: mineOnly, cursor });
      setPosts((prev) => {
        const seen = new Set((prev ?? []).map((p) => p.id));
        return [...(prev ?? []), ...page.items.filter((p) => !seen.has(p.id))];
      });
      setCursor(page.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "게시글을 더 불러오지 못했어요.");
    } finally {
      setLoadingMore(false);
    }
  };

  const filtered = category !== "전체" || !!query.trim();

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
          {FILTER_CATEGORIES.map((c) => (
            <button type="button" key={c} className={`wd-chip ${category === c ? "on" : ""}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="wd-row" style={{ flexWrap: "wrap" }}>
          <label className="wd-search" style={{ width: 240, height: 38 }}>
            <i>⌕</i>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="제목 · 내용 검색" />
          </label>
          <div className="wd-tabs">
            {(Object.keys(SORTS) as SortLabel[]).map((s) => (
              <button type="button" key={s} className={sort === s ? "on" : ""} onClick={() => setSort(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      {error && (
        <div className="wd-banner danger" role="alert" style={{ margin: "12px 0", padding: "12px 14px" }}>
          <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>!</span>
          <p style={{ margin: 0, flex: 1 }}>{error}</p>
          <button type="button" className="wd-btn ghost sm" onClick={() => void load()}>
            다시 시도
          </button>
        </div>
      )}
      {posts === null ? (
        <div className="wd-muted wd-t11" aria-busy="true" style={{ padding: 48, textAlign: "center" }}>
          게시글을 불러오는 중…
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="wd-list">
            {posts.map((p) => (
              <Link key={p.id} href={`/inhouse/community/${p.id}`} className={`wd-post link ${p.pinned ? "pin" : ""}`} style={{ padding: "20px 14px" }}>
                <div>
                  <div className="wd-row" style={{ gap: 6 }}>
                    {p.pinned && <span className="wd-badge dark">고정</span>}
                    <span className={`wd-badge ${TONE[p.category] ?? ""}`}>{p.category}</span>
                  </div>
                  <b>{p.title}</b>
                  <p>{p.body.split("\n")[0]}</p>
                  <div className="wd-foot">
                    <span>{p.author}</span>
                    <span>
                      조회 {p.views} · 공감 {p.likes} · 댓글 {p.commentCount}
                    </span>
                  </div>
                </div>
                <span className="wd-t9 wd-faint">{p.when}</span>
              </Link>
            ))}
          </div>
          {cursor && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button type="button" className="wd-btn line sm" onClick={() => void more()} disabled={loadingMore}>
                {loadingMore ? "불러오는 중…" : "게시글 더 보기"}
              </button>
            </div>
          )}
        </>
      ) : error ? null : filtered ? (
        <EmptyState
          icon="⌕"
          title="검색 결과가 없어요"
          description="다른 단어로 찾아보거나 필터를 풀어보세요."
          actionLabel="필터 초기화"
          onAction={() => {
            setInput("");
            setQuery("");
            setCategory("전체");
            setSort("최신순");
          }}
        />
      ) : (
        <EmptyState
          icon="✎"
          title={mineOnly ? "아직 쓴 글이 없어요" : "아직 게시글이 없어요"}
          description="첫 글을 올려보세요."
          actionLabel="글쓰기"
          onAction={() => (window.location.href = "/inhouse/community/write")}
        />
      )}
    </CommunityShell>
  );
}
