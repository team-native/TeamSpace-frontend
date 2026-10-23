"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CommunityShell from "@/components/inhouse/CommunityShell";
import { useToast } from "@/components/inhouse/ui";
import { NOTICES, NOTICE_READ_KEY, loadLocal, saveLocal } from "@/lib/demo";

export default function NoticePage() {
  const { id } = useParams<{ id: string }>();
  const notice = NOTICES.find((n) => n.id === id);
  const toast = useToast();
  const [done, setDone] = useState(false);
  useEffect(() => setDone(loadLocal<string[]>(NOTICE_READ_KEY, []).includes(id)), [id]);
  if (!notice) return notFound();
  const count = notice.confirmed + (done ? 1 : 0);

  return (
    <CommunityShell>
      <div className="pf-post-layout">
        <article className="wd-card" style={{ padding: 32 }}>
          <div className="wd-row" style={{ gap: 6 }}>
            <span className={`wd-badge ${notice.tone}`}>{notice.kind}</span>
            {notice.pinned && <span className="wd-badge dark">고정</span>}
          </div>
          <h1 style={{ margin: "14px 0 10px", fontSize: 26, letterSpacing: "-.05em", fontWeight: 620 }}>{notice.title}</h1>
          <div className="wd-t10 wd-faint" style={{ marginBottom: 26 }}>
            {notice.author} · {notice.date}
          </div>
          <div className="wd-doc">
            {notice.body.map((b, i) => (
              <div key={i}>
                {b.h && <h3>{b.h}</h3>}
                <p style={{ whiteSpace: "pre-line" }}>
                  {b.p}
                  {b.mark && <mark>{b.mark}</mark>}
                  {b.after}
                </p>
              </div>
            ))}
          </div>
          {notice.related.length > 0 && (
            <>
              <b className="wd-t10" style={{ display: "block", margin: "26px 0 10px", color: "#4e5968" }}>관련 문서</b>
              <div className="wd-grid g2">
                {notice.related.map(([slug, title]) => (
                  <Link key={slug} href={`/inhouse/documents/${slug}`} className="wd-file">
                    <span className="ext doc">DOC</span>
                    <div>
                      <b>{title}</b>
                      <small>문서함</small>
                    </div>
                    <span className="end">→</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </article>
        <aside className="wd-stack">
          {notice.mustRead && (
            <section className="wd-card" style={{ borderColor: "#cfe0fd" }}>
              <h3 style={{ fontSize: 12 }}>필독 확인</h3>
              <p className="wd-t9 wd-faint" style={{ margin: "6px 0 14px" }}>읽었다면 확인을 눌러주세요. 운영진이 확인 현황을 봐요.</p>
              <div className="wd-between wd-t10" style={{ marginBottom: 8 }}>
                <span>
                  {count} / {notice.total}명
                </span>
                <span className="wd-faint">{Math.round((count / notice.total) * 100)}%</span>
              </div>
              <div className="wd-bar" style={{ marginBottom: 16 }}>
                <i style={{ width: `${(count / notice.total) * 100}%` }} />
              </div>
              <button
                type="button"
                className={`wd-btn full ${done ? "ghost" : "blue"}`}
                disabled={done}
                onClick={() => {
                  saveLocal(NOTICE_READ_KEY, [...loadLocal<string[]>(NOTICE_READ_KEY, []), id]);
                  setDone(true);
                  toast.show("확인했어요");
                }}
              >
                {done ? "✓ 확인 완료" : "확인했어요"}
              </button>
            </section>
          )}
          <Link href="/inhouse/community/notices" className="wd-btn ghost full">
            공지 목록
          </Link>
        </aside>
      </div>
      {toast.node}
    </CommunityShell>
  );
}
