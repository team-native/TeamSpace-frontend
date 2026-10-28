"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminShell, { AdminToggle } from "@/components/inhouse/AdminShell";
import { TEAM_SIZE } from "@/lib/admin";
import { useToast } from "@/components/inhouse/ui";
import { DOCS, ME, type Notice } from "@/lib/demo";

const KINDS: Notice["kind"][] = ["필독", "제도", "일정", "일반"];
const MAX_TITLE = 60;
const MAX_DOCS = 3;

export default function AdminNoticeNew() {
  const router = useRouter();
  const toast = useToast();
  const [kind, setKind] = useState<Notice["kind"]>("필독");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [docs, setDocs] = useState<string[]>([]);
  const [pinned, setPinned] = useState(true);
  const [mustRead, setMustRead] = useState(true);
  const [scheduled, setScheduled] = useState(false);
  const [at, setAt] = useState("");

  const addable = DOCS.filter((d) => !docs.includes(d.slug));
  const previewTitle = title.trim() || "제목을 입력하면 여기에 보여요";
  const canSubmit = title.trim() && body.trim() && (!scheduled || at);

  return (
    <AdminShell
      title="공지 등록"
      right={
        <div className="wd-row">
          <button type="button" className="wd-btn ghost" onClick={() => toast.show("임시 저장했어요")}>
            임시 저장
          </button>
          <button
            type="submit"
            form="notice-form"
            className="wd-btn"
            disabled={!canSubmit}
          >
            {scheduled ? "예약하기" : "등록하고 알림 보내기"}
          </button>
        </div>
      }
    >
      <div className="wd-side">
        <form
          id="notice-form"
          className="wd-card"
          style={{ padding: 28 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            toast.show(scheduled ? "예약했어요. 시간이 되면 알림이 가요" : `전체 ${TEAM_SIZE}명에게 알림을 보냈어요`);
            setTimeout(() => router.push("/inhouse/community/notices"), 900);
          }}
        >
          <div className="wd-field">
            <span>분류</span>
            <div className="wd-seg" role="radiogroup" aria-label="분류">
              {KINDS.map((k) => (
                <button type="button" key={k} role="radio" aria-checked={kind === k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <label className="wd-field">
            <span>
              제목 <em>{title.length} / {MAX_TITLE}</em>
            </span>
            <input className="wd-input" required maxLength={MAX_TITLE} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 10월 정산 일정 안내 — 영수증은 10.30까지" />
          </label>
          <label className="wd-field">
            <span>본문</span>
            <textarea className="wd-input" required style={{ minHeight: 180 }} value={body} onChange={(e) => setBody(e.target.value)} placeholder="일정, 대상, 해야 할 일을 적어주세요" />
          </label>
          <div className="wd-field" style={{ marginBottom: 0 }}>
            <span>
              관련 문서 <em>최대 {MAX_DOCS}개</em>
            </span>
            <div className="wd-chips">
              {docs.map((slug) => (
                <button type="button" key={slug} className="wd-chip on" onClick={() => setDocs(docs.filter((d) => d !== slug))} aria-label={`${DOCS.find((d) => d.slug === slug)?.title} 빼기`}>
                  {DOCS.find((d) => d.slug === slug)?.title} ×
                </button>
              ))}
              {docs.length < MAX_DOCS && addable.length > 0 && (
                <select
                  className="wd-chip"
                  style={{ borderStyle: "dashed", font: "inherit" }}
                  value=""
                  aria-label="문서함에서 선택"
                  onChange={(e) => e.target.value && setDocs([...docs, e.target.value])}
                >
                  <option value="">+ 문서함에서 선택</option>
                  {addable.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </form>
        <aside className="wd-stack">
          <section className="wd-card">
            <h3 style={{ fontSize: 12 }}>게시 옵션</h3>
            <AdminToggle on={pinned} onChange={setPinned} label="상단 고정" desc="공지 목록과 홈 피드 맨 위" />
            <AdminToggle on={mustRead} onChange={setMustRead} label="필독" desc="전원 확인 요청 · 확인 현황 집계" />
            <AdminToggle on={scheduled} onChange={setScheduled} label="예약 게시" desc={scheduled ? "정한 시간에 게시" : "지금 바로 게시"} />
            {scheduled && (
              <input className="wd-input" type="datetime-local" aria-label="예약 시간" value={at} onChange={(e) => setAt(e.target.value)} style={{ marginTop: 12 }} />
            )}
          </section>
          <section className="wd-card soft">
            <h3 style={{ fontSize: 12 }}>알림 미리보기</h3>
            <div className="wd-li unread" style={{ padding: "12px 10px", marginTop: 10, borderRadius: 12, gridTemplateColumns: "auto 1fr" }}>
              <span className="ico orange">공</span>
              <div>
                <b style={{ fontSize: 11 }}>
                  {mustRead ? "[필독] " : ""}
                  {previewTitle}
                </b>
                <p>{ME.dept} · 방금</p>
              </div>
            </div>
            <p className="wd-t9 wd-faint" style={{ margin: "10px 0 0" }}>
              전체 {TEAM_SIZE}명 · 방해 금지 시간인 사람은 아침에 받아요
            </p>
          </section>
        </aside>
      </div>
      {toast.node}
    </AdminShell>
  );
}
