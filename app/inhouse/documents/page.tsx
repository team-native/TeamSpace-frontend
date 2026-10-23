"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import PortalShell from "@/components/inhouse/PortalShell";
import { useRevealOnScroll } from "@/components/inhouse/useRevealOnScroll";
import { useInhouseData } from "@/lib/inhouse";
import { useOutside } from "@/components/inhouse/ui";
import { DOCS, loadLocal, saveLocal } from "@/lib/demo";

const DOCUMENTS = DOCS;
const RECENT_KEY = "native-inhouse-recent-searches";

const CATEGORIES = ["전체", "운영 규칙", "재무", "템플릿", "NativeLab", "팀 규칙"];

export default function DocumentsPage() {
  const { data, error } = useInhouseData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [revisedRead, setRevisedRead] = useState(true);
  const searchRef = useOutside<HTMLDivElement>(focused, () => setFocused(false));
  const revised = DOCUMENTS.find((d) => d.revised);

  useEffect(() => {
    setRecent(loadLocal<string[]>(RECENT_KEY, []));
    setRevisedRead(loadLocal<string[]>("native-inhouse-read-docs", []).includes(revised?.slug ?? ""));
  }, [revised]);

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
        (doc) => (category === "전체" || doc.category === category) && `${doc.title} ${doc.copy}`.includes(query.trim()),
      ),
    [category, query],
  );

  useRevealOnScroll(".pf-doc-reveal", { threshold: 0.12, rootMargin: "0px 0px -34px" }, [data, category, query]);

  return (
    <PortalShell data={data} error={error} active="documents">
      {data && (
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
            <div style={{ position: "relative" }} ref={searchRef} className="wd-scope">
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
                <div className="wd-pop" style={{ top: "calc(100% + 8px)", left: 0, right: 0, padding: 16 }}>
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
                    {recent.length === 0 && <span className="wd-t10 wd-faint">아직 검색한 기록이 없어요.</span>}
                    {recent.map((r) => (
                      <span key={r} className="wd-chip">
                        <button type="button" style={{ border: 0, background: "none", padding: 0, color: "inherit" }} onClick={() => setQuery(r)}>
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
                  {DOCUMENTS.slice(1, 3).map((d) => (
                    <Link key={d.slug} href={`/inhouse/documents/${d.slug}`} className="wd-row wd-t11" style={{ padding: "9px 0", gap: 8 }}>
                      <span className="wd-faint">→</span> {d.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {revised && !revisedRead && (
            <div className="wd-scope wd-wrap" style={{ marginBottom: 40 }}>
              <div className="wd-banner" style={{ background: "#fff8dc" }}>
                <span className="ico" style={{ color: "#9a6b00" }}>!</span>
                <div>
                  <b>
                    &lsquo;{revised.title}&rsquo;이 개정됐어요 · {revised.effective} 시행
                  </b>
                  <p>적립풀 비율 30% → 25%, 배당 정산 주기 분기 → 월. 아직 읽지 않았어요.</p>
                </div>
                <Link className="wd-btn sm" href={`/inhouse/documents/${revised.slug}`}>
                  바뀐 부분 보기
                </Link>
              </div>
            </div>
          )}

          <section className="pf-doc-body pf-doc-reveal">
            <aside>
              {CATEGORIES.map((name) => (
                <button key={name} onClick={() => setCategory(name)} className={category === name ? "active" : ""}>
                  {name}
                  <span>{name === "전체" ? DOCUMENTS.length : DOCUMENTS.filter((d) => d.category === name).length}</span>
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
                  <article className="pf-doc-reveal" style={{ "--row-delay": `${i * 55}ms` } as CSSProperties}>
                    <small>{doc.type}</small>
                    <div>
                      <b>
                        {doc.title}
                        {doc.revised && !revisedRead && (
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
              {filtered.length === 0 && <div className="pf-empty">검색 결과가 없어요.</div>}
            </div>
          </section>
        </>
      )}
    </PortalShell>
  );
}
