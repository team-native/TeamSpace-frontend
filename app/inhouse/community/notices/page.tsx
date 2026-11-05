"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import CommunityShell from "@/components/inhouse/CommunityShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { Eyebrow } from "@/components/inhouse/ui";
import { NOTICE_FILTERS, fetchNotices, type Notice, type NoticeFilter } from "@/lib/notices";

// GET /notices — 고정 공지는 서버가 앞에 둔다
export default function NoticesPage() {
  const [kind, setKind] = useState<NoticeFilter>("전체");
  const [list, setList] = useState<Notice[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [more, setMore] = useState(false);
  const req = useRef(0);

  const load = useCallback(async () => {
    const id = ++req.current;
    setError("");
    setList(null);
    try {
      const page = await fetchNotices(kind);
      if (id !== req.current) return;
      setList(page.items);
      setCursor(page.nextCursor);
    } catch (e) {
      if (id !== req.current) return;
      setError(e instanceof Error ? e.message : "공지를 불러오지 못했어요.");
      setList([]);
    }
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadMore = async () => {
    if (!cursor || more) return;
    setMore(true);
    try {
      const page = await fetchNotices(kind, cursor);
      setList((prev) => {
        const seen = new Set((prev ?? []).map((n) => n.id));
        return [...(prev ?? []), ...page.items.filter((n) => !seen.has(n.id))];
      });
      setCursor(page.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "공지를 더 불러오지 못했어요.");
    } finally {
      setMore(false);
    }
  };

  return (
    <CommunityShell>
      <section className="wd-hero sm">
        <div>
          <Eyebrow>NOTICE</Eyebrow>
          <h1>공지</h1>
          <p>필독 공지는 확인하면 체크돼요.</p>
        </div>
      </section>

      <div className="wd-chips" style={{ marginBottom: 14 }}>
        {NOTICE_FILTERS.map((c) => (
          <button type="button" key={c} className={`wd-chip ${kind === c ? "on" : ""}`} onClick={() => setKind(c)}>
            {c}
          </button>
        ))}
      </div>

      {error && (
        <div className="wd-banner danger" role="alert" style={{ marginBottom: 14, padding: "12px 14px" }}>
          <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>!</span>
          <p style={{ margin: 0, flex: 1 }}>{error}</p>
          <button type="button" className="wd-btn ghost sm" onClick={() => void load()}>
            다시 시도
          </button>
        </div>
      )}

      {list === null ? (
        <div className="wd-muted wd-t11" aria-busy="true" style={{ padding: 48, textAlign: "center" }}>
          공지를 불러오는 중…
        </div>
      ) : list.length > 0 ? (
        <>
          <div className="wd-card" style={{ padding: "4px 20px" }}>
            <div className="wd-list">
              {list.map((n) => (
                <Link key={n.id} href={`/inhouse/community/notices/${n.id}`} className="wd-li link" style={{ gridTemplateColumns: "56px 1fr auto auto" }}>
                  <span className={`wd-badge ${n.tone}`} style={{ justifySelf: "start" }}>
                    {n.kind}
                  </span>
                  <div>
                    <b>
                      {n.pinned && (
                        <span className="wd-badge dark" style={{ marginRight: 8, height: 18 }}>
                          고정
                        </span>
                      )}
                      {n.title}
                    </b>
                    <p>{[n.author, n.date].filter(Boolean).join(" · ")}</p>
                  </div>
                  <span className="wd-t9 wd-faint">
                    {n.mustRead ? (n.confirmedByMe ? "✓ 확인함" : n.total ? `${n.confirmed}/${n.total} 확인` : "확인 필요") : ""}
                  </span>
                  <span className="wd-faint">→</span>
                </Link>
              ))}
            </div>
          </div>
          {cursor && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button type="button" className="wd-btn line sm" onClick={() => void loadMore()} disabled={more}>
                {more ? "불러오는 중…" : "공지 더 보기"}
              </button>
            </div>
          )}
        </>
      ) : error ? null : kind === "전체" ? (
        <EmptyState icon="✓" title="아직 공지가 없어요" description="운영진이 공지를 올리면 여기에 모여요." />
      ) : (
        <EmptyState icon="⌕" title="이 분류의 공지가 없어요" description="다른 분류를 선택해 확인해보세요." actionLabel="분류 초기화" onAction={() => setKind("전체")} />
      )}
    </CommunityShell>
  );
}
