"use client";

import { useEffect, useState } from "react";
import MyShell, { MyTitle } from "@/components/inhouse/MyShell";
import { useToast } from "@/components/inhouse/ui";
import { EVENTS, loadLocal, saveLocal, type CalEvent } from "@/lib/demo";

const KEY = "native-inhouse-rsvp";
const TODAY = 24;
const RSVP = ["참석", "불참", "미정"] as const;

// 데모는 2026년 10월 고정 (1일이 목요일)
const LEAD_DAYS = [27, 28, 29, 30];

export default function CalendarPage() {
  const toast = useToast();
  const [selected, setSelected] = useState<CalEvent>(EVENTS.find((e) => e.rsvp) ?? EVENTS[0]);
  const [answer, setAnswer] = useState<string>("");
  const [why, setWhy] = useState("");

  useEffect(() => {
    const saved = loadLocal<Record<string, { answer: string; why: string }>>(KEY, {});
    setAnswer(saved[selected.title]?.answer ?? "");
    setWhy(saved[selected.title]?.why ?? "");
  }, [selected]);

  const respond = (a: string) => {
    setAnswer(a);
    saveLocal(KEY, { ...loadLocal(KEY, {}), [selected.title]: { answer: a, why } });
    toast.show(`'${a}'으로 응답했어요`);
  };

  const counts = { 참석: 12 + (answer === "참석" ? 1 : 0), 불참: 2 + (answer === "불참" ? 1 : 0), 미응답: 6 - (answer ? 1 : 0) };

  return (
    <MyShell>
      <MyTitle eyebrow="CALENDAR" title="2026년 10월" sub="일정을 누르면 상세와 참석 응답이 열려요." />
      <div className="pf-cal-layout">
        <div className="wd-cal" style={{ borderRadius: 14, overflow: "hidden" }}>
          {["일", "월", "화", "수", "목", "금", "토"].map((h) => (
            <div key={h} className="head">{h}</div>
          ))}
          {LEAD_DAYS.map((d) => (
            <div key={`p${d}`} className="dim" style={{ minHeight: 82 }}>
              <span>{d}</span>
            </div>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <div key={d} className={d === TODAY ? "today" : ""} style={{ minHeight: 82 }}>
              <span>{d}</span>
              {EVENTS.filter((e) => e.day === d).map((e) => (
                <button
                  type="button"
                  key={e.title}
                  className={`ev ${selected.title === e.title ? "sel" : e.tone}`}
                  style={{ border: 0, width: "100%", textAlign: "left" }}
                  onClick={() => setSelected(e)}
                >
                  {e.title}
                </button>
              ))}
            </div>
          ))}
        </div>
        <section className="wd-card" style={{ borderColor: "#cfe0fd" }}>
          <span className="wd-badge blue">{selected.rsvp ? "전체 일정" : "팀 일정"}</span>
          <h3 style={{ margin: "12px 0 6px", fontSize: 18 }}>{selected.title}</h3>
          <dl className="wd-kv one" style={{ margin: "14px 0 18px" }}>
            <div><dt>일시</dt><dd>{selected.time ?? `10.${String(selected.day).padStart(2, "0")} 종일`}</dd></div>
            {selected.place && <div><dt>장소</dt><dd>{selected.place}</dd></div>}
            {selected.host && <div><dt>주최</dt><dd>{selected.host}</dd></div>}
            {selected.agenda && <div><dt>안건</dt><dd style={{ fontWeight: 500 }}>{selected.agenda}</dd></div>}
          </dl>
          {selected.rsvp ? (
            <>
              <div className="wd-between wd-t10" style={{ marginBottom: 8 }}>
                <b>참석 응답</b>
                <span className="wd-faint">
                  참석 {counts.참석} · 불참 {counts.불참} · 미응답 {counts.미응답}
                </span>
              </div>
              <div className="wd-seg" style={{ marginBottom: 10 }}>
                {RSVP.map((r) => (
                  <button type="button" key={r} aria-pressed={answer === r} className={answer === r ? "on" : ""} onClick={() => respond(r)}>
                    {r}
                  </button>
                ))}
              </div>
              {answer === "불참" && (
                <input
                  className="wd-input"
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  onBlur={() => saveLocal(KEY, { ...loadLocal(KEY, {}), [selected.title]: { answer, why } })}
                  placeholder="불참 사유 (선택)"
                />
              )}
            </>
          ) : (
            <p className="wd-t10 wd-faint" style={{ margin: 0 }}>참석 응답이 필요 없는 일정이에요.</p>
          )}
        </section>
      </div>
      {toast.node}
    </MyShell>
  );
}
