"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import AdminShell, { AdminToggle } from "@/components/inhouse/AdminShell";
import { TEAM_SIZE } from "@/lib/admin";
import EmptyState from "@/components/inhouse/EmptyState";
import { Confirm, useToast } from "@/components/inhouse/ui";
import { EVENTS } from "@/lib/demo";

const TARGETS = ["전체", "부서 선택", "프로젝트 선택"] as const;
const dateOf = (day: number) => `2026-10-${String(day).padStart(2, "0")}`;
const label = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")} (${"일월화수목금토"[d.getDay()]})`;
};

export default function AdminEventEdit() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const event = EVENTS.find((e) => String(e.day) === id);
  const original = event ? dateOf(event.day) : "";

  const [form, setForm] = useState({
    title: event?.title ?? "",
    date: original,
    start: "19:00",
    end: "20:30",
    place: event?.place ?? "",
    target: "전체" as (typeof TARGETS)[number],
    agenda: event?.agenda ?? "",
  });
  const [rsvp, setRsvp] = useState(event?.rsvp ?? false);
  const [remind, setRemind] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  // 참석 응답 현황 (데모)
  const yes = 12;
  const no = 2;
  const answered = yes + no;
  const dateChanged = form.date !== original;

  if (!event) {
    return (
      <AdminShell title="일정 변경">
        <EmptyState icon="?" title="일정을 찾을 수 없어요" description="삭제됐거나 주소가 바뀌었어요." actionLabel="캘린더로" onAction={() => router.push("/inhouse/my/calendar")} />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="일정 변경"
      sub={event.title}
      right={
        <div className="wd-row">
          <button type="button" className="wd-btn danger" onClick={() => setCancelling(true)}>
            일정 취소
          </button>
          <button type="submit" form="event-form" className="wd-btn">
            변경 저장
          </button>
        </div>
      }
    >
      <div className="wd-side">
        <form
          id="event-form"
          className="wd-card"
          style={{ padding: 28 }}
          onSubmit={(e) => {
            e.preventDefault();
            toast.show(dateChanged ? `응답한 ${answered}명에게 변경 알림을 보냈어요` : "변경 내용을 저장했어요");
          }}
        >
          <label className="wd-field">
            <span>일정 이름</span>
            <input className="wd-input" required value={form.title} onChange={(e) => set("title", e.target.value)} />
          </label>
          <div className="wd-grid g2">
            <label className="wd-field">
              <span>
                날짜 {dateChanged && <em style={{ textDecoration: "line-through" }}>{label(original)}</em>}
              </span>
              <input className="wd-input" type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} />
            </label>
            <div className="wd-field">
              <span>시간</span>
              <div className="wd-row" style={{ gap: 6 }}>
                <input className="wd-input" type="time" aria-label="시작 시간" value={form.start} onChange={(e) => set("start", e.target.value)} />
                <span className="wd-faint">–</span>
                <input className="wd-input" type="time" aria-label="끝 시간" value={form.end} onChange={(e) => set("end", e.target.value)} />
              </div>
            </div>
          </div>
          <label className="wd-field">
            <span>장소</span>
            <input className="wd-input" value={form.place} onChange={(e) => set("place", e.target.value)} placeholder="예: 본관 302호 · 온라인 병행" />
          </label>
          <div className="wd-field">
            <span>대상</span>
            <div className="wd-seg" role="radiogroup" aria-label="대상">
              {TARGETS.map((t) => (
                <button type="button" key={t} role="radio" aria-checked={form.target === t} className={form.target === t ? "on" : ""} onClick={() => set("target", t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <label className="wd-field" style={{ marginBottom: 0 }}>
            <span>안건</span>
            <textarea className="wd-input" style={{ minHeight: 80 }} value={form.agenda} onChange={(e) => set("agenda", e.target.value)} />
          </label>
        </form>
        <aside className="wd-stack">
          <section className="wd-card">
            <h3 style={{ fontSize: 12 }}>참석 응답</h3>
            <AdminToggle on={rsvp} onChange={setRsvp} label="참석 응답 받기" desc="참석 · 불참 · 미정" />
            <AdminToggle on={remind} onChange={setRemind} label="하루 전 리마인드" />
            <div className="wd-between wd-t10" style={{ paddingTop: 12 }}>
              <span className="wd-faint">현재 응답</span>
              <b>
                참석 {yes} · 불참 {no} · 미응답 {TEAM_SIZE - answered}
              </b>
            </div>
          </section>
          {dateChanged && (
            <div className="wd-banner warn" role="status">
              <span className="ico" style={{ color: "#9a6b00" }}>!</span>
              <div>
                <b style={{ fontSize: 11 }}>날짜가 바뀌어요 · {label(form.date)}</b>
                <p>저장하면 응답한 {answered}명에게 변경 알림이 가고, 응답은 초기화돼요.</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {cancelling && (
        <Confirm
          danger
          title="일정을 취소할까요?"
          message={`${event.title} 일정이 캘린더에서 사라지고, 대상자 전원에게 취소 알림이 가요.`}
          confirmLabel="일정 취소"
          onClose={() => setCancelling(false)}
          onConfirm={() => {
            setCancelling(false);
            toast.show("일정을 취소하고 알림을 보냈어요");
            setTimeout(() => router.push("/inhouse/my/calendar"), 900);
          }}
        />
      )}
      {toast.node}
    </AdminShell>
  );
}
