"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CommunityShell from "@/components/inhouse/CommunityShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { Eyebrow } from "@/components/inhouse/ui";
import { AuthorAvatar } from "@/components/inhouse/ProfileAvatar";
import { CommentIcon } from "@/components/inhouse/Icons";
import { PROPOSAL_SORTS, PROPOSAL_STATUSES, STATUS_TONE, fetchProposals, type Proposal, type ProposalSortLabel } from "@/lib/proposals";

const STAGES = ["전체", ...PROPOSAL_STATUSES] as const;

// 운영 제안 목록: 정렬 · 검색은 서버, 단계 · 부서는 받은 목록에서 거른다
export default function ProposalsPage() {
  const [list, setList] = useState<Proposal[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [sort, setSort] = useState<ProposalSortLabel>("최신순");
  const [stage, setStage] = useState<string>("전체");
  const [dept, setDept] = useState("");
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [mine, setMine] = useState(false);
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setQuery(input), 300);
    return () => clearTimeout(t);
  }, [input]);

  const req = useRef(0);
  const load = useCallback(async () => {
    const id = ++req.current;
    setError("");
    setList(null);
    try {
      const page = await fetchProposals({ sort, q: query, mine });
      if (id !== req.current) return;
      setList(page.items);
      setCursor(page.nextCursor);
    } catch (e) {
      if (id !== req.current) return;
      setError(e instanceof Error ? e.message : "제안을 불러오지 못했어요.");
      setList([]);
    }
  }, [sort, query, mine]);

  useEffect(() => {
    void load();
  }, [load]);

  const more = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchProposals({ sort, q: query, mine, cursor });
      setList((prev) => {
        const seen = new Set((prev ?? []).map((p) => p.id));
        return [...(prev ?? []), ...page.items.filter((p) => !seen.has(p.id))];
      });
      setCursor(page.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "제안을 더 불러오지 못했어요.");
    } finally {
      setLoadingMore(false);
    }
  };

  const depts = useMemo(() => [...new Set((list ?? []).map((p) => p.dept).filter(Boolean))].sort(), [list]);
  const byDept = (list ?? []).filter((p) => !dept || p.dept === dept);
  const shown = byDept.filter((p) => stage === "전체" || p.status === stage);
  const count = (s: string) => byDept.filter((p) => s === "전체" || p.status === s).length;
  const filtered = stage !== "전체" || !!dept || !!query.trim() || mine;

  return (
    <CommunityShell>
      <section className="wd-hero sm">
        <div>
          <Eyebrow>PROPOSAL</Eyebrow>
          <h1>운영 제안</h1>
          <p>Native를 더 나은 팀으로 만들기 위한 의견을 담당 부서에 제안해요.</p>
        </div>
        <Link className="wd-btn" href="/inhouse/community/proposals/write">
          제안하기
        </Link>
      </section>
      <div className="wd-between" style={{ marginBottom: 14, flexWrap: "wrap" }}>
        <div className="wd-tabs">
          {STAGES.map((s) => (
            <button type="button" key={s} className={stage === s ? "on" : ""} onClick={() => setStage(s)}>
              {s}
              {list && <small>{count(s)}</small>}
            </button>
          ))}
        </div>
        <div className="wd-row" style={{ flexWrap: "wrap" }}>
          <label className="wd-search" style={{ width: 220, height: 38 }}>
            <i>⌕</i>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="제목 · 내용 검색" />
          </label>
          <select className="wd-input" aria-label="담당 부서" value={dept} onChange={(e) => setDept(e.target.value)} style={{ height: 38, width: "auto" }}>
            <option value="">부서 전체</option>
            {depts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select className="wd-input" aria-label="정렬" value={sort} onChange={(e) => setSort(e.target.value as ProposalSortLabel)} style={{ height: 38, width: "auto" }}>
            {(Object.keys(PROPOSAL_SORTS) as ProposalSortLabel[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button type="button" className={`wd-chip ${mine ? "on" : ""}`} aria-pressed={mine} onClick={() => setMine((v) => !v)}>
            내 제안
          </button>
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
      {list === null ? (
        <div className="wd-muted wd-t11" aria-busy="true" style={{ padding: 48, textAlign: "center" }}>
          제안을 불러오는 중…
        </div>
      ) : shown.length > 0 ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {shown.map((p) => (
              <ProposalCard key={p.id} p={p} />
            ))}
          </div>
          {cursor && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button type="button" className="wd-btn line sm" onClick={() => void more()} disabled={loadingMore}>
                {loadingMore ? "불러오는 중…" : "제안 더 보기"}
              </button>
            </div>
          )}
        </>
      ) : error ? null : filtered ? (
        <EmptyState
          icon="⌕"
          title="조건에 맞는 제안이 없어요"
          description="다른 단계나 부서를 골라보세요."
          actionLabel="필터 초기화"
          onAction={() => {
            setStage("전체");
            setDept("");
            setInput("");
            setQuery("");
            setMine(false);
          }}
        />
      ) : (
        <EmptyState
          icon="✎"
          title="아직 올라온 제안이 없어요"
          description="불편했던 점이나 바꾸고 싶은 걸 첫 제안으로 남겨보세요."
          actionLabel="제안하기"
          onAction={() => (window.location.href = "/inhouse/community/proposals/write")}
        />
      )}
    </CommunityShell>
  );
}

function ProposalCard({ p }: { p: Proposal }) {
  return (
    <Link href={`/inhouse/community/proposals/${p.id}`} className="wd-card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
      <div className="wd-between">
        <span className="wd-badge">{p.dept || "기타"}</span>
        <span className={`wd-badge ${STATUS_TONE[p.status] ?? ""}`}>{p.status}</span>
      </div>
      <b className="wd-t12" style={{ fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</b>
      <p
        className="wd-t10 wd-faint"
        style={{ margin: 0, lineHeight: 1.6, minHeight: "3.2em", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
      >
        {p.body}
      </p>
      <div className="wd-between wd-t9 wd-faint" style={{ marginTop: 4 }}>
        <span className="wd-row" style={{ gap: 6 }}>
          <AuthorAvatar name={p.author} profile={p.profile} anonymous={p.anonymous} mine={p.mine} size={20} />
          {p.author} · {p.when}
        </span>
        <span className="wd-row" style={{ gap: 10 }}>
          <span className="wd-row" style={{ gap: 3 }} aria-label={`댓글 ${p.commentCount}`}>
            <CommentIcon size={13} /> {p.commentCount}
          </span>
          <span aria-label={`추천 ${p.recommendCount}`}>△ {p.recommendCount}</span>
        </span>
      </div>
    </Link>
  );
}
