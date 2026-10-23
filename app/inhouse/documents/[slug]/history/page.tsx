"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import WdPage from "@/components/inhouse/WdPage";
import { Eyebrow, Modal } from "@/components/inhouse/ui";
import { DOCS, DOC_HISTORY } from "@/lib/demo";

export default function DocumentHistoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const doc = DOCS.find((d) => d.slug === slug);
  const history = DOC_HISTORY[slug];
  const [compare, setCompare] = useState<(typeof history)[number] | null>(null);
  if (!doc || !history) return notFound();

  return (
    <WdPage active="documents">
      <div className="wd-narrow wd-pb">
        <div className="wd-crumb">
          <Link href="/inhouse/documents">문서함</Link> › <Link href={`/inhouse/documents/${slug}`}>{doc.title}</Link> › <b>변경 내역</b>
        </div>
        <section className="wd-hero sm">
          <div>
            <Eyebrow>HISTORY</Eyebrow>
            <h1>변경 내역</h1>
            <p>버전마다 무엇이 바뀌었는지 확인해요.</p>
          </div>
        </section>
        <div className="wd-tl">
          {history.map((v, i) => (
            <div key={v.ver} className={i === 0 ? "on" : ""}>
              <div className="wd-card" style={{ padding: 18, borderColor: i === 0 ? "#cfe0fd" : undefined }}>
                <div className="wd-between">
                  <div className="wd-row" style={{ gap: 8 }}>
                    <b style={{ fontSize: 14 }}>{v.ver}</b>
                    {i === 0 && <span className="wd-badge blue">현재</span>}
                  </div>
                  <span className="wd-t9 wd-faint">
                    {v.date} · {v.who}
                  </span>
                </div>
                <p className="wd-t11" style={{ margin: "10px 0 12px", color: "#333d4b" }}>{v.note}</p>
                <div className="wd-row" style={{ gap: 6 }}>
                  {i === 0 ? (
                    <Link className="wd-btn line sm" href={`/inhouse/documents/${slug}`}>
                      현재 문서 보기
                    </Link>
                  ) : (
                    <button type="button" className="wd-btn ghost sm" onClick={() => setCompare(v)}>
                      현재와 비교
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {compare && (
        <Modal eyebrow="COMPARE" title={`${compare.ver} → ${history[0].ver}`} sub={`${compare.date} 이후 바뀐 내용`} onClose={() => setCompare(null)}>
          <div className="wd-tl">
            {history.slice(0, history.indexOf(compare)).map((v) => (
              <div key={v.ver} className="on">
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
