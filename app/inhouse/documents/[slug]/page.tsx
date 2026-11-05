"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import WdPage from "@/components/inhouse/WdPage";
import Attachments from "@/components/inhouse/Attachments";
import EmptyState from "@/components/inhouse/EmptyState";
import { Eyebrow, copyLink, useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import { fetchDoc, fetchDocs, markDocRead, type DocDetail, type DocItem } from "@/lib/docs";
import { isAdminRole, useMe } from "@/lib/session";

export default function DocumentPage() {
  const { slug } = useParams<{ slug: string }>();
  const version = useSearchParams().get("version") ?? undefined;
  const toast = useToast();
  const { me } = useMe();
  const [doc, setDoc] = useState<DocDetail | null>(null);
  const [related, setRelated] = useState<DocItem[]>([]);
  const [loadError, setLoadError] = useState<{ status: number; message: string } | null>(null);
  const [highlight, setHighlight] = useState(true);
  const [section, setSection] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState<number | null>(null);
  const req = useRef(0);

  const load = useCallback(async () => {
    const id = ++req.current;
    setLoadError(null);
    try {
      const d = await fetchDoc(slug, version);
      if (id !== req.current) return;
      setDoc(d);
      // 관련 문서는 목록에서 같은 분류를 골라 보여준다 (못 불러와도 본문은 보여줌)
      fetchDocs(100)
        .then((list) => {
          if (id !== req.current) return;
          const others = list.filter((x) => x.slug !== d.slug && x.type !== "TEMPLATE");
          setRelated([...others.filter((x) => x.category === d.category), ...others.filter((x) => x.category !== d.category)].slice(0, 2));
        })
        .catch(() => {});
    } catch (e) {
      if (id !== req.current) return;
      setLoadError({ status: e instanceof ApiError ? e.status : 0, message: (e instanceof Error ? e.message : "문서를 불러오지 못했어요.") });
    }
  }, [slug, version]);

  useEffect(() => {
    load();
  }, [load]);

  const share = async () => {
    await copyLink();
    toast.show("링크를 복사했어요");
  };

  const confirm = async () => {
    if (!doc || confirming) return;
    setConfirming(true);
    try {
      const r = await markDocRead(doc.slug);
      setDoc({ ...doc, read: true, readAt: r.readAt });
      setConfirmed(r.confirmed);
      toast.show("확인했어요. 고마워요!");
    } catch (e) {
      toast.show((e instanceof Error ? e.message : "확인을 저장하지 못했어요."));
    } finally {
      setConfirming(false);
    }
  };

  if (loadError) {
    const missing = loadError.status === 404;
    const denied = loadError.status === 403;
    return (
      <WdPage active="documents">
        <div className="wd-wrap wd-pb">
          <EmptyState
            icon={missing || denied ? "⌕" : "!"}
            title={missing ? "문서를 찾을 수 없어요" : denied ? "열람 권한이 없는 문서예요" : "문서를 불러오지 못했어요"}
            description={missing ? "삭제됐거나 주소가 바뀌었을 수 있어요." : loadError.message}
            actionLabel={missing || denied ? "문서함으로" : "다시 시도"}
            onAction={missing || denied ? () => (window.location.href = "/inhouse/documents") : load}
          />
        </div>
      </WdPage>
    );
  }

  if (!doc) {
    return (
      <WdPage active="documents">
        <div className="wd-wrap wd-pb">
          <p className="wd-t11 wd-faint" aria-busy="true" style={{ padding: "48px 0" }}>
            문서를 불러오는 중이에요…
          </p>
        </div>
      </WdPage>
    );
  }

  if (doc.type === "TEMPLATE") {
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
              <Link className="wd-btn" href={`/inhouse/requests/new?type=expense&template=${encodeURIComponent(doc.slug)}`}>
                이 템플릿으로 결재 작성 →
              </Link>
            </div>
          </section>
          <div className="wd-side">
            <div className="wd-card" style={{ padding: 32 }}>
              <span className="wd-t9 wd-faint" style={{ fontWeight: 750, letterSpacing: ".1em" }}>미리보기</span>
              {doc.fields.length === 0 && (
                <p className="wd-t11 wd-faint" style={{ margin: "16px 0 0" }}>
                  등록된 작성 항목이 없어요. 원본 파일을 내려받아 확인해 주세요.
                </p>
              )}
              {doc.fields.map(([k, v]) => (
                <div key={k} style={{ padding: "16px 0", borderBottom: "1px solid #e5e8eb" }}>
                  <b className="wd-t11">{k}</b>
                  <div className="wd-input ph" style={{ marginTop: 8, minHeight: 38 }}>{v}</div>
                </div>
              ))}
              {doc.file && (
                <div style={{ marginTop: 20 }}>
                  <Attachments files={[doc.file]} />
                </div>
              )}
            </div>
            <aside className="wd-card">
              <dl className="wd-kv one">
                <div><dt>연결 결재</dt><dd>{doc.approvalTypes.length ? doc.approvalTypes.join(" · ") : "-"}</dd></div>
                <div><dt>이번 달 사용</dt><dd>{doc.usageThisMonth}건</dd></div>
                {doc.owner && <div><dt>담당</dt><dd>{doc.owner}</dd></div>}
                {doc.date && <div><dt>최근 수정</dt><dd>{doc.date}</dd></div>}
              </dl>
            </aside>
          </div>
        </div>
        {toast.node}
      </WdPage>
    );
  }

  const sections = doc.sections;
  const hasRevision = doc.revised || sections.some((s) => s.revised || s.lines.some((l) => l.now || l.was));

  return (
    <WdPage active="documents">
      <div className="wd-wrap wd-pb">
        <div className="wd-crumb">
          <Link href="/inhouse/documents">문서함</Link> › {doc.category} › <b>{doc.title}</b>
        </div>
        {version && (
          <div className="wd-banner warn" style={{ marginBottom: 20 }}>
            <span className="ico" style={{ color: "#9a6b00" }}>!</span>
            <div>
              <b>{version} 버전을 보고 있어요</b>
              <p>지금 시행 중인 문서와 다를 수 있어요.</p>
            </div>
            <Link className="wd-btn sm" href={`/inhouse/documents/${doc.slug}`}>
              현재 문서 보기
            </Link>
          </div>
        )}
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
              {doc.date && <span>개정 {doc.date}</span>}
            </div>
          </div>
          <div className="wd-row">
            <Link className="wd-btn line sm" href={`/inhouse/documents/${doc.slug}/history`}>
              변경 내역
            </Link>
            {isAdminRole(me) && !version && (
              <Link className="wd-btn line sm" href={`/inhouse/admin/documents/${doc.slug}`}>
                개정
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
                key={`${s.title}-${i}`}
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
            {hasRevision && (
              <div className="wd-row wd-t10" style={{ marginBottom: 22, gap: 8 }}>
                <button type="button" role="switch" aria-checked={highlight} className={`wd-toggle ${highlight ? "on" : ""}`} onClick={() => setHighlight((v) => !v)} aria-label="개정된 부분 강조" />
                <span>개정된 부분 강조</span>
              </div>
            )}
            {sections.length === 0 && <p className="wd-t11 wd-faint">아직 본문이 없어요.</p>}
            {sections.map((s, i) => (
              <section key={`${s.title}-${i}`} id={`sec-${i}`}>
                <h3>{s.title}</h3>
                {s.lines.map((l, j) => (
                  <p key={j}>
                    {l.text}
                    {(l.now || l.was) &&
                      (highlight ? (
                        <>
                          {l.was && <del>{l.was}</del>}
                          {l.was && l.now && " "}
                          {l.now && <mark>{l.now}</mark>}
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
            {!version && (
              <section className="wd-card" style={{ borderColor: doc.read ? undefined : "#cfe0fd" }}>
                <h3 style={{ fontSize: 12 }}>읽음 확인</h3>
                <p className="wd-t9 wd-faint" style={{ margin: "6px 0 14px" }}>
                  {doc.read
                    ? `${doc.readAt ? `${doc.readAt.slice(0, 10).replace(/-/g, ".")}에 ` : ""}확인했어요.`
                    : doc.revised
                      ? "개정된 문서예요. 읽고 나서 확인을 눌러 주세요."
                      : "읽고 나서 확인을 눌러 주세요."}
                </p>
                {confirmed !== null && (
                  <p className="wd-t10" style={{ margin: "0 0 12px" }}>지금까지 {confirmed}명이 확인했어요.</p>
                )}
                <button
                  type="button"
                  className={`wd-btn full ${doc.read ? "ghost" : "blue"}`}
                  disabled={doc.read || confirming}
                  aria-busy={confirming}
                  onClick={confirm}
                >
                  {doc.read ? "✓ 확인 완료" : confirming ? "저장 중…" : "확인했어요"}
                </button>
              </section>
            )}
            {related.length > 0 && (
              <section className="wd-card soft">
                <h3 style={{ fontSize: 12 }}>관련 문서</h3>
                {related.map((d) => (
                  <Link key={d.slug} href={`/inhouse/documents/${d.slug}`} className="wd-between wd-t10" style={{ padding: "10px 0" }}>
                    {d.title} <span className="wd-faint">→</span>
                  </Link>
                ))}
              </section>
            )}
          </aside>
        </div>
      </div>
      {toast.node}
    </WdPage>
  );
}
