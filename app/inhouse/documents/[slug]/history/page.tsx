"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import WdPage from "@/components/inhouse/WdPage";
import EmptyState from "@/components/inhouse/EmptyState";
import { Eyebrow, Modal } from "@/components/inhouse/ui";
import { fetchDoc, fetchDocHistory, type DocVersion } from "@/lib/docs";

export default function DocumentHistoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [title, setTitle] = useState("");
  const [current, setCurrent] = useState("");
  const [history, setHistory] = useState<DocVersion[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [compare, setCompare] = useState<DocVersion | null>(null);
  const req = useRef(0);

  const load = useCallback(async () => {
    const id = ++req.current;
    setLoadError("");
    try {
      const [doc, list] = await Promise.all([fetchDoc(slug), fetchDocHistory(slug)]);
      if (id !== req.current) return;
      setTitle(doc.title);
      setCurrent(doc.version);
      setHistory(list);
    } catch (e) {
      if (id === req.current) setLoadError((e instanceof Error ? e.message : "변경 내역을 불러오지 못했어요."));
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  // 맨 위(가장 최근)가 현재 버전. 서버 이력에 현재 버전이 없으면 첫 항목을 현재로 본다
  const isCurrent = (v: DocVersion, i: number) => (current ? v.ver === current : i === 0);
  const head = history?.find((v, i) => isCurrent(v, i)) ?? history?.[0];

  return (
    <WdPage active="documents">
      <div className="wd-narrow wd-pb">
        <div className="wd-crumb">
          <Link href="/inhouse/documents">문서함</Link> › <Link href={`/inhouse/documents/${slug}`}>{title || "문서"}</Link> › <b>변경 내역</b>
        </div>
        <section className="wd-hero sm">
          <div>
            <Eyebrow>HISTORY</Eyebrow>
            <h1>변경 내역</h1>
            <p>버전마다 무엇이 바뀌었는지 확인해요.</p>
          </div>
        </section>

        {!history && !loadError && (
          <p className="wd-t11 wd-faint" aria-busy="true">변경 내역을 불러오는 중이에요…</p>
        )}

        {loadError && (
          <div className="wd-banner danger">
            <span className="ico">!</span>
            <div>
              <b>{loadError}</b>
            </div>
            <button type="button" className="wd-btn sm" onClick={load}>
              다시 시도
            </button>
          </div>
        )}

        {history && history.length === 0 && (
          <EmptyState
            icon="↺"
            title="아직 개정된 적이 없어요"
            description="처음 등록된 버전 그대로예요."
            actionLabel="문서로 돌아가기"
            onAction={() => (window.location.href = `/inhouse/documents/${slug}`)}
          />
        )}

        {history && history.length > 0 && (
          <div className="wd-tl">
            {history.map((v, i) => {
              const on = isCurrent(v, i);
              return (
                <div key={`${v.ver}-${i}`} className={on ? "on" : ""}>
                  <div className="wd-card" style={{ padding: 18, borderColor: on ? "#cfe0fd" : undefined }}>
                    <div className="wd-between">
                      <div className="wd-row" style={{ gap: 8 }}>
                        <b style={{ fontSize: 14 }}>{v.ver || "버전 없음"}</b>
                        {on && <span className="wd-badge blue">현재</span>}
                      </div>
                      <span className="wd-t9 wd-faint">
                        {[v.date, v.who].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    {v.note && <p className="wd-t11" style={{ margin: "10px 0 12px", color: "#333d4b" }}>{v.note}</p>}
                    <div className="wd-row" style={{ gap: 6 }}>
                      {on ? (
                        <Link className="wd-btn line sm" href={`/inhouse/documents/${slug}`}>
                          현재 문서 보기
                        </Link>
                      ) : (
                        <>
                          {v.ver && (
                            <Link className="wd-btn line sm" href={`/inhouse/documents/${slug}?version=${encodeURIComponent(v.ver)}`}>
                              이 버전 보기
                            </Link>
                          )}
                          <button type="button" className="wd-btn ghost sm" onClick={() => setCompare(v)}>
                            현재와 비교
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {compare && history && head && (
        <Modal eyebrow="COMPARE" title={`${compare.ver} → ${head.ver}`} sub={`${compare.date} 이후 바뀐 내용`} onClose={() => setCompare(null)}>
          <div className="wd-tl">
            {history.slice(history.indexOf(head), history.indexOf(compare)).map((v, i) => (
              <div key={`${v.ver}-${i}`} className="on">
                <b className="wd-t11">{v.ver}</b>
                <p className="wd-t11" style={{ margin: "4px 0 0", color: "#333d4b" }}>{v.note}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </WdPage>
  );
}
