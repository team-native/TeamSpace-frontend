"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminShell, { AdminToggle } from "@/components/inhouse/AdminShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import { createEvent, fetchEvent, updateEvent, type CalEvent, type EventInput } from "@/lib/events";
import { isAdminRole, useMe } from "@/lib/session";

const SCOPES = ["팀", "프로젝트", "개인"];
const label = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")} (${"일월화수목금토"[d.getDay()]})`;
};
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const EMPTY: EventInput = { title: "", date: "", start: "", end: "", scope: "팀", place: "", audience: "전체", agenda: "", rsvp: false };

const toInput = (e: CalEvent): EventInput => ({
  title: e.title,
  date: e.date,
  start: e.start,
  end: e.end,
  scope: e.scope,
  place: e.place,
  audience: e.audience || "전체",
  agenda: e.agenda,
  rsvp: e.rsvp,
});

export default function AdminEventEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();
  const toast = useToast();
  const { me } = useMe();
  const [original, setOriginal] = useState<CalEvent | null>(null);
  const [form, setForm] = useState<EventInput>({ ...EMPTY, date: today() });
  const [loadError, setLoadError] = useState<{ status: number; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof EventInput>(k: K, v: EventInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (isNew) return;
    let alive = true;
    fetchEvent(id)
      .then((e) => {
        if (!alive) return;
        setOriginal(e);
        setForm(toInput(e));
      })
      .catch((e) => alive && setLoadError({ status: e instanceof ApiError ? e.status : 0, message: e instanceof Error ? e.message : "일정을 불러오지 못했어요." }));
    return () => {
      alive = false;
    };
  }, [id, isNew]);

  const dateChanged = !!original && form.date !== original.date;
  const timeError = form.start && form.end && form.end <= form.start ? "끝나는 시간이 시작보다 늦어야 해요" : "";
  const canSave = !!form.title.trim() && !!form.date && !timeError && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setError("");
    const input = { ...form, title: form.title.trim() };
    try {
      if (isNew) {
        await createEvent(input);
        toast.show("일정을 등록하고 알림을 보냈어요");
      } else {
        // 바뀐 항목만 보낸다 (서버가 바뀐 내용을 이력으로 남김)
        const before = original ? toInput(original) : EMPTY;
        const changes = Object.fromEntries(Object.entries(input).filter(([k, v]) => before[k as keyof EventInput] !== v)) as Partial<EventInput>;
        if (Object.keys(changes).length === 0) {
          toast.show("바뀐 내용이 없어요");
          setSaving(false);
          return;
        }
        // 서버가 날짜·시간을 함께 확인해서 날짜는 늘 같이 보낸다
        await updateEvent(id, { ...changes, date: input.date });
        toast.show("변경 내용을 저장하고 알림을 보냈어요");
      }
      setTimeout(() => router.push("/inhouse/my/calendar"), 700);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 403 ? "일정 등록·수정은 Admin만 할 수 있어요." : e instanceof Error ? e.message : "저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    const missing = loadError.status === 404;
    return (
      <AdminShell title="일정 변경">
        <EmptyState
          icon={missing ? "?" : "!"}
          title={missing ? "일정을 찾을 수 없어요" : "일정을 불러오지 못했어요"}
          description={missing ? "삭제됐거나 주소가 바뀌었어요." : loadError.message}
          actionLabel="캘린더로"
          onAction={() => router.push("/inhouse/my/calendar")}
        />
      </AdminShell>
    );
  }

  if (!isNew && !original) {
    return (
      <AdminShell title="일정 변경">
        <p className="wd-t11 wd-faint" aria-busy="true">
          일정을 불러오는 중이에요…
        </p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={isNew ? "일정 등록" : "일정 변경"}
      sub={original?.title}
      right={
        <div className="wd-row">
          {!isNew && (
            <button type="button" className="wd-btn ghost" onClick={() => router.push("/inhouse/admin/events/new")}>
              새 일정
            </button>
          )}
          <button type="submit" form="event-form" className="wd-btn" disabled={!canSave} aria-busy={saving}>
            {saving ? "저장 중…" : isNew ? "등록하고 알림 보내기" : "변경 저장"}
          </button>
        </div>
      }
    >
      {!isAdminRole(me) && (
        <div className="wd-banner warn" style={{ marginBottom: 18 }}>
          <span className="ico" style={{ color: "#9a6b00" }}>!</span>
          <div>
            <b>일정 등록·수정은 Admin만 저장할 수 있어요</b>
            <p>Leader · FA 역할은 내용을 볼 수만 있어요.</p>
          </div>
        </div>
      )}
      {error && (
        <div className="wd-banner danger" role="alert" style={{ marginBottom: 18 }}>
          <span className="ico">!</span>
          <div>
            <b>{error}</b>
          </div>
        </div>
      )}
      <div className="wd-side">
        <form
          id="event-form"
          className="wd-card"
          style={{ padding: 28 }}
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label className="wd-field">
            <span>일정 이름</span>
            <input className="wd-input" required maxLength={80} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="예: 11월 전체 회의" />
          </label>
          <div className="wd-grid g2">
            <label className="wd-field">
              <span>
                날짜 {dateChanged && original && <em style={{ textDecoration: "line-through" }}>{label(original.date)}</em>}
              </span>
              <input className="wd-input" type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} />
            </label>
            <div className="wd-field">
              <span>
                시간 <em>비우면 종일</em>
              </span>
              <div className="wd-row" style={{ gap: 6 }}>
                <input className="wd-input" type="time" aria-label="시작 시간" value={form.start} onChange={(e) => set("start", e.target.value)} />
                <span className="wd-faint">–</span>
                <input className="wd-input" type="time" aria-label="끝 시간" value={form.end} onChange={(e) => set("end", e.target.value)} />
              </div>
              {timeError && <p className="wd-t9" style={{ color: "#f04452", margin: "6px 0 0" }}>{timeError}</p>}
            </div>
          </div>
          <div className="wd-field">
            <span>범위</span>
            <div className="wd-seg" role="radiogroup" aria-label="범위">
              {SCOPES.map((s) => (
                <button type="button" key={s} role="radio" aria-checked={form.scope === s} className={form.scope === s ? "on" : ""} onClick={() => set("scope", s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <label className="wd-field">
            <span>장소</span>
            <input className="wd-input" value={form.place} onChange={(e) => set("place", e.target.value)} placeholder="예: 본관 302호 · 온라인 병행" />
          </label>
          <label className="wd-field">
            <span>대상</span>
            <input className="wd-input" value={form.audience} onChange={(e) => set("audience", e.target.value)} placeholder="예: 전체 · iOS 파트 · Book-on 팀" />
          </label>
          <label className="wd-field" style={{ marginBottom: 0 }}>
            <span>안건</span>
            <textarea className="wd-input" style={{ minHeight: 80 }} value={form.agenda} onChange={(e) => set("agenda", e.target.value)} />
          </label>
        </form>
        <aside className="wd-stack">
          <section className="wd-card">
            <h3 style={{ fontSize: 12 }}>참석 응답</h3>
            <AdminToggle on={form.rsvp} onChange={(v) => set("rsvp", v)} label="참석 응답 받기" desc="참석 · 불참 · 미정" />
            {original && (
              <div className="wd-between wd-t10" style={{ paddingTop: 12 }}>
                <span className="wd-faint">현재 응답</span>
                <b>참석 {original.rsvpCount}명</b>
              </div>
            )}
            <p className="wd-t9 wd-faint" style={{ margin: "10px 0 0" }}>미리 알림은 사람마다 일정 화면에서 직접 켜요.</p>
          </section>
          {dateChanged && (
            <div className="wd-banner warn" role="status">
              <span className="ico" style={{ color: "#9a6b00" }}>!</span>
              <div>
                <b style={{ fontSize: 11 }}>날짜가 바뀌어요 · {label(form.date)}</b>
                <p>저장하면 전체에게 변경 알림이 가요.</p>
              </div>
            </div>
          )}
        </aside>
      </div>
      {toast.node}
    </AdminShell>
  );
}
