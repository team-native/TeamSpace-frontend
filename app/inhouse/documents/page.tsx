"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import EmptyState from "@/components/inhouse/EmptyState";
import PortalShell from "@/components/inhouse/PortalShell";
import { useRevealOnScroll } from "@/components/inhouse/useRevealOnScroll";
import { useOutside } from "@/components/inhouse/ui";
import { loadLocal, saveLocal } from "@/lib/shared";
import { fetchDocs, type DocItem } from "@/lib/docs";

const RECENT_KEY = "native-inhouse-recent-searches";

const DOC_TYPE_LABEL: Record<string, string> = { RULE: "규칙", FINANCE: "재무", GUIDE: "가이드", TEMPLATE: "템플릿" };

export default function DocumentsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [docs, setDocs] = useState<DocItem[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const req = useRef(0);
  const searchRef = useOutside<HTMLDivElement>(focused, () => setFocused(false));
  const DOCUMENTS = useMemo(() => docs ?? [], [docs]);
  // 개정됐는데 아직 안 읽은 문서 하나를 위에 알린다
  const revised = DOCUMENTS.find((d) => d.revised && !d.read);
  const categories = useMemo(
    () => ["전체", ...Array.from(new Set(DOCUMENTS.map((d) => d.category)))],
    [DOCUMENTS],
  );

  const load = useCallback(async () => {
    const id = ++req.current;
    setLoadError("");
    try {
      const list = await fetchDocs();
      if (id === req.current) setDocs(list);
    } catch (e) {
      if (id === req.current) setLoadError((e instanceof Error ? e.message : "문서를 불러오지 못했어요."));
    }
  }, []);

  useEffect(() => {
    setRecent(loadLocal<string[]>(RECENT_KEY, []));
    load();
  }, [load]);

  const remember = (q: string) => {
    const term = q.trim();
    if (!term) return;

    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 6);
    setRecent(next);
    saveLocal(RECENT_KEY, next);
  };

  const filtered = useMemo(
    () =>
      DOCUMENTS.filter(
        (doc) =>
          (category === "전체" || doc.category === category) &&
          `${doc.title} ${doc.copy}`.includes(query.trim()),
      ),
    [DOCUMENTS, category, query],
  );

  useRevealOnScroll(
    ".pf-doc-reveal",
    { threshold: 0.12, rootMargin: "0px 0px -34px" },
    [docs, category, query],
  );

  return (
    <PortalShell active="documents">
      <>
          <section className="pf-doc-hero pf-doc-reveal">
            <div>
              <span>TEAM LIBRARY</span>
              <h1>
                팀의 기준을
                <br />
                한곳에서 찾아요.
              </h1>
              <p>
                규칙도 문서의 일부예요. 운영 기준, 재무 정책,
                <br />
                업무 템플릿을 같은 문서함에서 관리합니다.
              </p>
            </div>

            <div
              style={{ position: "relative" }}
              ref={searchRef}
              className="wd-scope"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  remember(query);
                  setFocused(false);
                }}
              >
                <label>
                  <i>⌕</i>
                  <input
                    value={query}
                    onFocus={() => setFocused(true)}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="찾고 싶은 문서를 검색해보세요"
                  />
                </label>
              </form>

              {focused && !query && (
                <div
                  className="wd-pop"
                  style={{ top: "calc(100% + 8px)", left: 0, right: 0, padding: 16 }}
                >
                  <div className="wd-between" style={{ marginBottom: 10 }}>
                    <b className="wd-t10">최근 검색어</b>
                    {recent.length > 0 && (
                      <button
                        type="button"
                        className="wd-t9 wd-faint"
                        style={{ border: 0, background: "none" }}
                        onClick={() => {
                          setRecent([]);
                          saveLocal(RECENT_KEY, []);
                        }}
                      >
                        전체 삭제
                      </button>
                    )}
                  </div>

                  <div className="wd-chips" style={{ marginBottom: 14 }}>
                    {recent.length === 0 && (
                      <span className="wd-t10 wd-faint">아직 검색한 기록이 없어요.</span>
                    )}

                    {recent.map((r) => (
                      <span key={r} className="wd-chip">
                        <button
                          type="button"
                          style={{
                            border: 0,
                            background: "none",
                            padding: 0,
                            color: "inherit",
                          }}
                          onClick={() => setQuery(r)}
                        >
                          {r}
                        </button>
                        <button
                          type="button"
                          aria-label={`${r} 삭제`}
                          style={{ border: 0, background: "none", padding: 0, opacity: 0.5 }}
                          onClick={() => {
                            const next = recent.filter((x) => x !== r);
                            setRecent(next);
                            saveLocal(RECENT_KEY, next);
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <b className="wd-t10">자주 찾는 문서</b>
                  {DOCUMENTS.filter((d) => d.type !== "TEMPLATE").slice(0, 2).map((d) => (
                    <Link
                      key={d.slug}
                      href={`/inhouse/documents/${d.slug}`}
                      className="wd-row wd-t11"
                      style={{ padding: "9px 0", gap: 8 }}
                    >
                      <span className="wd-faint">→</span> {d.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {revised && (
            <div className="wd-scope wd-wrap" style={{ marginBottom: 40 }}>
              <div className="wd-banner warn">
                <span className="ico" style={{ color: "var(--t-orange)" }}>
                  !
                </span>
                <div>
                  <b>
                    &lsquo;{revised.title}&rsquo;이 개정됐어요
                    {revised.effective ? ` · ${revised.effective} 시행` : ""}
                  </b>
                  <p>{revised.copy ? `${revised.copy} · ` : ""}아직 읽지 않았어요.</p>
                </div>
                <Link className="wd-btn sm" href={`/inhouse/documents/${revised.slug}`}>
                  바뀐 부분 보기
                </Link>
              </div>
            </div>
          )}

          <section className="pf-doc-body pf-doc-reveal">
            <aside>
              {categories.map((name) => (
                <button
                  key={name}
                  onClick={() => setCategory(name)}
                  className={category === name ? "active" : ""}
                >
                  {name}
                  <span>
                    {name === "전체"
                      ? DOCUMENTS.length
                      : DOCUMENTS.filter((d) => d.category === name).length}
                  </span>
                </button>
              ))}
            </aside>

            <div className="pf-doc-list">
              <header>
                <b>{category}</b>
                <span>{filtered.length}개의 문서</span>
              </header>

              {filtered.map((doc, i) => (
                <Link
                  key={doc.slug}
                  href={`/inhouse/documents/${doc.slug}`}
                  onClick={() => remember(query)}
                  style={{ display: "block", color: "inherit", textDecoration: "none" }}
                >
                  <article
                    className="pf-doc-reveal"
                    style={{ "--row-delay": `${i * 55}ms` } as CSSProperties}
                  >
                    <small>{DOC_TYPE_LABEL[doc.type] ?? doc.type}</small>
                    <div>
                      <b>
                        {doc.title}
                        {doc.revised && !doc.read && (
                          <span className="wd-scope" style={{ marginLeft: 6 }}>
                            <span className="wd-badge orange">개정</span>
                          </span>
                        )}
                      </b>
                      <p>{doc.copy}</p>
                    </div>
                    <time>{doc.date}</time>
                    <i>→</i>
                  </article>
                </Link>
              ))}

              {!docs && !loadError && (
                <p className="wd-scope wd-t11 wd-faint" aria-busy="true" style={{ padding: "24px 0" }}>
                  문서를 불러오는 중이에요…
                </p>
              )}

              {loadError && (
                <div className="wd-scope" style={{ padding: "16px 0" }}>
                  <div className="wd-banner danger">
                    <span className="ico">!</span>
                    <div>
                      <b>{loadError}</b>
                    </div>
                    <button type="button" className="wd-btn sm" onClick={load}>
                      다시 시도
                    </button>
                  </div>
                </div>
              )}

              {docs && filtered.length === 0 && (
                <div className="wd-scope">
                  <EmptyState
                    icon="⌕"
                    title={DOCUMENTS.length ? "검색 결과가 없어요" : "아직 등록된 문서가 없어요"}
                    description={DOCUMENTS.length ? "다른 단어로 찾아보거나 분류를 바꿔보세요." : "관리자가 규칙이나 양식을 올리면 여기에 보여요."}
                    actionLabel="필터 초기화"
                    onAction={() => {
                      setQuery("");
                      setCategory("전체");
                      setFocused(false);
                    }}
                  />
                </div>
              )}
            </div>
          </section>
      </>
    </PortalShell>
  );
}