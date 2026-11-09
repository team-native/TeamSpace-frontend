"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MyShell, { MyTitle } from "@/components/inhouse/MyShell";
import { useToast } from "@/components/inhouse/ui";
import {
  REMINDER_LABELS,
  RSVP_OPTIONS,
  SCOPES,
  fetchEvents,
  fetchReminders,
  monthKey,
  saveReminders,
  sendRsvp,
  whenText,
  type CalEvent,
  type Reminders,
  type RsvpAnswer,
} from "@/lib/events";
import { isAdminRole, useMe } from "@/lib/session";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarPage() {
  const toast = useToast();
  const { me } = useMe();
  const admin = isAdminRole(me);
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [scope, setScope] = useState<string>("전체");
  const [events, setEvents] = useState<CalEvent[] | null>(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [why, setWhy] = useState("");
  const [sending, setSending] = useState(false);
  const [reminders, setReminders] = useState<Reminders | null>(null);
  const req = useRef(0);
  const remReq = useRef(0);

  const month = monthKey(ym.y, ym.m);

  const load = useCallback(async () => {
    const id = ++req.current;
    setError("");
    setEvents(null);
    try {
      const list = await fetchEvents(month, scope);
      if (id !== req.current) return;
      setEvents(list);
      // 응답이 필요한 일정을 먼저 열어 둔다
      setSelectedId((cur) => (cur && list.some((e) => e.id === cur) ? cur : (list.find((e) => e.rsvp && !e.myRsvp) ?? list[0])?.id ?? null));
    } catch (e) {
      if (id === req.current) setError(e instanceof Error ? e.message : "일정을 불러오지 못했어요.");
    }
  }, [month, scope]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = events?.find((e) => e.id === selectedId) ?? null;

  useEffect(() => {
    setWhy("");
    setReminders(null);
    if (!selectedId) return;
    const id = ++remReq.current;
    fetchReminders(selectedId)
      .then((r) => id === remReq.current && setReminders(r))
      .catch(() => {});
  }, [selectedId]);

  const cells = useMemo(() => {
    const lead = new Date(ym.y, ym.m, 1).getDay();
    const days = new Date(ym.y, ym.m + 1, 0).getDate();
    const prevDays = new Date(ym.y, ym.m, 0).getDate();
    return {
      lead: Array.from({ length: lead }, (_, i) => prevDays - lead + 1 + i),
      days: Array.from({ length: days }, (_, i) => i + 1),
    };
  }, [ym]);

  const isThisMonth = ym.y === now.getFullYear() && ym.m === now.getMonth();
  const shift = (d: number) => setYm(({ y, m }) => ({ y: m + d < 0 ? y - 1 : m + d > 11 ? y + 1 : y, m: (m + d + 12) % 12 }));

  const respond = async (answer: RsvpAnswer) => {
    if (!selected || sending) return;
    setSending(true);
    try {
      await sendRsvp(selected.id, answer, answer === "불참" ? why : undefined);
      setEvents((list) =>
        list?.map((e) => {
          if (e.id !== selected.id) return e;
          const delta = (answer === "참석" ? 1 : 0) - (e.myRsvp === "참석" ? 1 : 0);
          return { ...e, myRsvp: answer, rsvpCount: Math.max(0, e.rsvpCount + delta) };
        }) ?? null,
      );
      toast.show(`'${answer}'으로 응답했어요`);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "응답을 저장하지 못했어요.");
    } finally {
      setSending(false);
    }
  };

  const toggleReminder = async (key: keyof Reminders) => {
    if (!selected || !reminders) return;
    const next = { ...reminders, [key]: !reminders[key] };
    setReminders(next);
    const id = ++remReq.current;
    try {
      // 항목 하나만 보내면 나머지가 초기값으로 돌아갈 수 있어 전체를 보낸다. 다른 일정을 골랐거나 또 눌렀으면 응답은 버린다
      const saved = await saveReminders(selected.id, next);
      if (id === remReq.current) setReminders({ ...next, ...saved });
    } catch (e) {
      if (id === remReq.current) setReminders(reminders);
      toast.show(e instanceof Error ? e.message : "알림 설정을 저장하지 못했어요.");
    }
  };

  return (
    <MyShell>
      <MyTitle
        eyebrow="CALENDAR"
        title={`${ym.y}년 ${ym.m + 1}월`}
        sub="일정을 누르면 상세와 참석 응답이 열려요."
        right={
          <div className="wd-row" style={{ gap: 6 }}>
            {admin && (
              <Link className="wd-btn sm" href="/inhouse/admin/events/new">
                + 일정
              </Link>
            )}
            <button type="button" className="wd-btn line sm" onClick={() => shift(-1)} aria-label="이전 달">
              ‹
            </button>
            {!isThisMonth && (
              <button type="button" className="wd-btn line sm" onClick={() => setYm({ y: now.getFullYear(), m: now.getMonth() })}>
                오늘
              </button>
            )}
            <button type="button" className="wd-btn line sm" onClick={() => shift(1)} aria-label="다음 달">
              ›
            </button>
          </div>
        }
      />
      <div className="wd-seg" style={{ marginBottom: 14, maxWidth: 360 }}>
        {SCOPES.map((s) => (
          <button type="button" key={s} className={scope === s ? "on" : ""} aria-pressed={scope === s} onClick={() => setScope(s)}>
            {s}
          </button>
        ))}
      </div>
      {error && (
        <div className="wd-banner danger" style={{ marginBottom: 14 }}>
          <span className="ico">!</span>
          <div>
            <b>{error}</b>
          </div>
          <button type="button" className="wd-btn sm" onClick={load}>
            다시 시도
          </button>
        </div>
      )}
      <div className="pf-cal-layout">
        <div className="wd-cal" style={{ borderRadius: 14, overflow: "hidden" }} aria-busy={!events && !error}>
          {WEEK.map((h) => (
            <div key={h} className="head">{h}</div>
          ))}
          {cells.lead.map((d) => (
            <div key={`p${d}`} className="dim" style={{ minHeight: 82 }}>
              <span>{d}</span>
            </div>
          ))}
          {cells.days.map((d) => (
            <div key={d} className={isThisMonth && d === now.getDate() ? "today" : ""} style={{ minHeight: 82 }}>
              <span>{d}</span>
              {events
                ?.filter((e) => e.day === d)
                .map((e) => (
                  <button
                    type="button"
                    key={e.id}
                    className={`ev ${selectedId === e.id ? "sel" : e.tone}`}
                    style={{ border: 0, width: "100%", textAlign: "left" }}
                    onClick={() => setSelectedId(e.id)}
                  >
                    {e.title}
                  </button>
                ))}
            </div>
          ))}
        </div>
        <section className="wd-card" style={{ borderColor: "var(--t-blue-line)" }}>
          {!events && !error && <p className="wd-t10 wd-faint" aria-busy="true">일정을 불러오는 중이에요…</p>}
          {events && !selected && (
            <p className="wd-t10 wd-faint" style={{ margin: 0 }}>
              {events.length === 0 ? `${ym.m + 1}월에는 ${scope === "전체" ? "" : `${scope} `}일정이 없어요.` : "달력에서 일정을 골라 주세요."}
            </p>
          )}
          {selected && (
            <>
              <div className="wd-between">
                <span className={`wd-badge ${selected.tone}`}>{selected.scope} 일정</span>
                {admin && (
                  <Link className="wd-link wd-t10" href={`/inhouse/admin/events/${selected.id}`}>
                    수정
                  </Link>
                )}
              </div>
              <h3 style={{ margin: "12px 0 6px", fontSize: 18 }}>{selected.title}</h3>
              <dl className="wd-kv one" style={{ margin: "14px 0 18px" }}>
                <div><dt>일시</dt><dd>{whenText(selected)}</dd></div>
                {selected.place && <div><dt>장소</dt><dd>{selected.place}</dd></div>}
                {selected.host && <div><dt>주최</dt><dd>{selected.host}</dd></div>}
                {selected.audience && <div><dt>대상</dt><dd>{selected.audience}</dd></div>}
                {selected.agenda && <div><dt>안건</dt><dd style={{ fontWeight: 500, whiteSpace: "pre-wrap" }}>{selected.agenda}</dd></div>}
              </dl>
              {selected.rsvp ? (
                <>
                  <div className="wd-between wd-t10" style={{ marginBottom: 8 }}>
                    <b>참석 응답</b>
                    <span className="wd-faint">참석 {selected.rsvpCount}명</span>
                  </div>
                  <div className="wd-seg" style={{ marginBottom: 10 }}>
                    {RSVP_OPTIONS.map((r) => (
                      <button
                        type="button"
                        key={r}
                        aria-pressed={selected.myRsvp === r}
                        className={selected.myRsvp === r ? "on" : ""}
                        disabled={sending}
                        onClick={() => respond(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="wd-row" style={{ gap: 6, marginBottom: 6 }}>
                    <input
                      className="wd-input"
                      value={why}
                      onChange={(e) => setWhy(e.target.value)}
                      placeholder="불참 사유 (선택, 불참을 누를 때 함께 보내요)"
                      maxLength={200}
                    />
                  </div>
                </>
              ) : (
                <p className="wd-t10 wd-faint" style={{ margin: 0 }}>참석 응답이 필요 없는 일정이에요.</p>
              )}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--t-line)" }}>
                <b className="wd-t10">미리 알림</b>
                {!reminders && <p className="wd-t9 wd-faint" style={{ margin: "8px 0 0" }}>불러오는 중…</p>}
                {reminders &&
                  REMINDER_LABELS.map(([key, label]) => (
                    <div key={key} className="wd-between wd-t10" style={{ padding: "8px 0" }}>
                      <span>{label}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={reminders[key]}
                        aria-label={`${label} 알림`}
                        className={`wd-toggle ${reminders[key] ? "on" : ""}`}
                        onClick={() => toggleReminder(key)}
                      />
                    </div>
                  ))}
              </div>
            </>
          )}
        </section>
      </div>
      {toast.node}
    </MyShell>
  );
}
