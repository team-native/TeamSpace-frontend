"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Attachments from "@/components/inhouse/Attachments";
import CommunityShell from "@/components/inhouse/CommunityShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import { confirmNotice, fetchNotice, type Notice } from "@/lib/notices";
import { isStaff, useMe } from "@/lib/session";

// GET /notices/{id} · POST /notices/{id}/confirm
export default function NoticePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { me } = useMe();
  const [notice, setNotice] = useState<Notice | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setNotice(await fetchNotice(id));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setNotice(null);
      else setError(e instanceof Error ? e.message : "공지를 불러오지 못했어요.");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error)
    return (
      <CommunityShell>
        <EmptyState icon="!" title="공지를 불러오지 못했어요" description={error} actionLabel="다시 시도" onAction={() => void load()} />
      </CommunityShell>
    );
  if (notice === undefined)
    return (
      <CommunityShell>
        <div className="wd-muted wd-t11" aria-busy="true" style={{ padding: 48, textAlign: "center" }}>
          공지를 불러오는 중…
        </div>
      </CommunityShell>
    );
  if (notice === null)
    return (
      <CommunityShell>
        <EmptyState icon="?" title="공지를 찾을 수 없어요" description="삭제됐거나 아직 게시 전인 공지예요." actionLabel="공지 목록" onAction={() => router.push("/inhouse/community/notices")} />
      </CommunityShell>
    );

  const total = Math.max(notice.total, notice.confirmed);
  const ratio = total ? notice.confirmed / total : 0;

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
            {[notice.author, notice.date, `조회 ${notice.views}`].filter(Boolean).join(" · ")}
          </div>
          <div className="wd-doc">
            <p style={{ whiteSpace: "pre-line" }}>{notice.body}</p>
          </div>
          <Attachments files={notice.attachments} />
          {notice.related.length > 0 && (
            <>
              <b className="wd-t10" style={{ display: "block", margin: "26px 0 10px", color: "var(--t-muted)" }}>관련 문서</b>
              <div className="wd-grid g2">
                {notice.related.map(([slug, title]) => (
                  <Link key={slug} href={`/inhouse/documents/${encodeURIComponent(slug)}`} className="wd-file">
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
            <section className="wd-card" style={{ borderColor: "var(--t-blue-line)" }}>
              <h3 style={{ fontSize: 12 }}>필독 확인</h3>
              <p className="wd-t9 wd-faint" style={{ margin: "6px 0 14px" }}>읽었다면 확인을 눌러주세요. 운영진이 확인 현황을 봐요.</p>
              <div className="wd-between wd-t10" style={{ marginBottom: 8 }}>
                <span>{total ? `${notice.confirmed} / ${total}명` : `${notice.confirmed}명 확인`}</span>
                {total > 0 && <span className="wd-faint">{Math.round(ratio * 100)}%</span>}
              </div>
              <div className="wd-bar" style={{ marginBottom: 16 }}>
                <i style={{ width: `${ratio * 100}%` }} />
              </div>
              <button
                type="button"
                className={`wd-btn full ${notice.confirmedByMe ? "ghost" : "blue"}`}
                disabled={notice.confirmedByMe || sending}
                onClick={async () => {
                  setSending(true);
                  try {
                    const r = await confirmNotice(notice.id);
                    setNotice({ ...notice, confirmedByMe: true, confirmed: r.confirmed });
                    toast.show("확인했어요");
                  } catch (e) {
                    toast.show(e instanceof Error ? e.message : "확인하지 못했어요.");
                  } finally {
                    setSending(false);
                  }
                }}
              >
                {notice.confirmedByMe ? "✓ 확인 완료" : sending ? "보내는 중…" : "확인했어요"}
              </button>
            </section>
          )}
          {isStaff(me) && (
            <Link href={`/inhouse/admin/notices/new?id=${notice.id}`} className="wd-btn line full">
              공지 수정
            </Link>
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
