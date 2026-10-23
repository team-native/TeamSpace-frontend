"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import WdPage from "@/components/inhouse/WdPage";
import { Eyebrow, copyLink, useToast } from "@/components/inhouse/ui";
import { DOCS, DOC_HISTORY, TEMPLATE_FIELDS, loadLocal, saveLocal } from "@/lib/demo";

const READ_KEY = "native-inhouse-read-docs";
const TEAM_SIZE = 20;

export default function DocumentPage() {
  const { slug } = useParams<{ slug: string }>();
  const doc = DOCS.find((d) => d.slug === slug);
  const toast = useToast();
  const [highlight, setHighlight] = useState(true);
  const [read, setRead] = useState(false);
  const [section, setSection] = useState(0);

  useEffect(() => {
    setRead(loadLocal<string[]>(READ_KEY, []).includes(slug));
  }, [slug]);

  if (!doc) return notFound();
  const share = async () => {
    await copyLink();
    toast.show("링크를 복사했어요");
  };

  if (doc.type === "TEMPLATE") {
    const fields = TEMPLATE_FIELDS[doc.slug] ?? [];
    return (
      <WdPage active="documents">
        <div className="wd-wrap wd-pb">
          <div className="wd-crumb">
            <Link href="/inhouse/documents">문서함</Link> › 템플릿 › <b>{doc.title}</b>
          </div>
          <section className="wd-hero sm">
            <div>
              <Eyebrow>TEMPLATE</Eyebrow>
              <h1>{doc.title}</h1>
              <p>{doc.copy}</p>
            </div>
            <div className="wd-row">
              <button type="button" className="wd-btn line sm" onClick={share}>
                링크 복사
              </button>
              <Link className="wd-btn" href={`/inhouse/requests/new?type=expense&template=${doc.slug}`}>
                이 템플릿으로 결재 작성 →
              </Link>
            </div>
          </section>
          <div className="wd-side">
            <div className="wd-card" style={{ padding: 32 }}>
              <span className="wd-t9 wd-faint" style={{ fontWeight: 750, letterSpacing: ".1em" }}>미리보기</span>
              {fields.map(([k, v]) => (
                <div key={k} style={{ padding: "16px 0", borderBottom: "1px solid #e5e8eb" }}>
                  <b className="wd-t11">{k}</b>
                  <div className="wd-input ph" style={{ marginTop: 8, minHeight: 38 }}>{v}</div>
                </div>
              ))}
            </div>
            <aside className="wd-card">
              <dl className="wd-kv one">
                <div><dt>연결 결재</dt><dd>비용 승인 · 물품 구매</dd></div>
                <div><dt>기본 결재선</dt><dd>NativeOps 리드 → FA</dd></div>
                <div><dt>담당 부서</dt><dd>{doc.owner}</dd></div>
                <div><dt>최근 수정</dt><dd>{doc.date}</dd></div>
              </dl>
            </aside>
          </div>
        </div>
        {toast.node}
      </WdPage>
    );
  }

  const sections = doc.sections ?? [{ title: "본문", lines: [{ text: doc.copy }] }];
  const readCount = 13 + (read ? 1 : 0);

  return (
    <WdPage active="documents">
      <div className="wd-wrap wd-pb">
        <div className="wd-crumb">
          <Link href="/inhouse/documents">문서함</Link> › {doc.category} › <b>{doc.title}</b>
        </div>
        <section className="wd-hero sm">
          <div>
            <Eyebrow>
              {doc.type}
              {doc.version ? ` · ${doc.version}` : ""}
            </Eyebrow>
            <h1>{doc.title}</h1>
            <div className="wd-row wd-t10 wd-faint" style={{ gap: 16, flexWrap: "wrap" }}>
              {doc.effective && <span>시행 {doc.effective}</span>}
              {doc.owner && <span>담당 {doc.owner}</span>}
              <span>개정 {doc.date}</span>
            </div>
          </div>
          <div className="wd-row">
            {DOC_HISTORY[doc.slug] && (
              <Link className="wd-btn line sm" href={`/inhouse/documents/${doc.slug}/history`}>
                변경 내역
              </Link>
            )}
            <button type="button" className="wd-btn line sm" onClick={share}>
              링크 복사
            </button>
          </div>
        </section>
        <div className="pf-doc-detail">
          <nav className="wd-toc" aria-label="목차">
            <b className="wd-t9 wd-faint" style={{ padding: "0 12px 8px" }}>목차</b>
            {sections.map((s, i) => (
              <a
                key={s.title}
                href={`#sec-${i}`}
                className={section === i ? "on" : ""}
                onClick={() => setSection(i)}
                style={{ padding: "9px 12px", borderRadius: 9, fontSize: 10, fontWeight: 600, color: section === i ? "#191f28" : "#6b7684", background: section === i ? "#f2f4f6" : undefined }}
              >
                {s.title} {s.revised && <em style={{ float: "right", color: "#d2621b", fontStyle: "normal", fontSize: 8, fontWeight: 750 }}>개정</em>}
              </a>
            ))}
          </nav>
          <article className="wd-card wd-doc" style={{ padding: 32 }}>
            {doc.revised && (
              <div className="wd-row wd-t10" style={{ marginBottom: 22, gap: 8 }}>
                <button type="button" role="switch" aria-checked={highlight} className={`wd-toggle ${highlight ? "on" : ""}`} onClick={() => setHighlight((v) => !v)} aria-label="개정된 부분 강조" />
                <span>개정된 부분 강조</span>
              </div>
            )}
            {sections.map((s, i) => (
              <section key={s.title} id={`sec-${i}`}>
                <h3>{s.title}</h3>
                {s.lines.map((l, j) => (
                  <p key={j}>
                    {l.text}
                    {l.now &&
                      (highlight ? (
                        <>
                          <del>{l.was}</del> <mark>{l.now}</mark>
                        </>
                      ) : (
                        l.now
                      ))}
                    {l.after}
                  </p>
                ))}
              </section>
            ))}
          </article>
          <aside className="wd-stack">
            {doc.revised && (
              <section className="wd-card" style={{ borderColor: "#cfe0fd" }}>
                <h3 style={{ fontSize: 12 }}>읽음 확인</h3>
                <p className="wd-t9 wd-faint" style={{ margin: "6px 0 14px" }}>시행 전까지 전원 확인이 필요한 문서예요.</p>
                <div className="wd-between wd-t10" style={{ marginBottom: 8 }}>
                  <span>
                    {readCount} / {TEAM_SIZE}명 확인
                  </span>
                  <span className="wd-faint">{Math.round((readCount / TEAM_SIZE) * 100)}%</span>
                </div>
                <div className="wd-bar" style={{ marginBottom: 16 }}>
                  <i style={{ width: `${(readCount / TEAM_SIZE) * 100}%` }} />
                </div>
                <button
                  type="button"
                  className={`wd-btn full ${read ? "ghost" : "blue"}`}
                  disabled={read}
                  onClick={() => {
                    saveLocal(READ_KEY, [...loadLocal<string[]>(READ_KEY, []), slug]);
                    setRead(true);
                    toast.show("확인했어요. 고마워요!");
                  }}
                >
                  {read ? "✓ 확인 완료" : "확인했어요"}
                </button>
              </section>
            )}
            <section className="wd-card soft">
              <h3 style={{ fontSize: 12 }}>관련 문서</h3>
              {DOCS.filter((d) => d.slug !== slug && d.type !== "TEMPLATE")
                .slice(0, 2)
                .map((d) => (
                  <Link key={d.slug} href={`/inhouse/documents/${d.slug}`} className="wd-between wd-t10" style={{ padding: "10px 0" }}>
                    {d.title} <span className="wd-faint">→</span>
                  </Link>
                ))}
            </section>
          </aside>
        </div>
      </div>
      {toast.node}
    </WdPage>
  );
}
