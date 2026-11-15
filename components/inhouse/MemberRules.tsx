"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MEMBER_RULES } from "@/lib/member-rules";

// 문서함 위의 기본 규칙. 처음엔 접혀 있고, 누르면 펼쳐져서 정해진 높이 안에서 스크롤한다
export default function MemberRules() {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const r = MEMBER_RULES;

  // 칸 안에서 보고 있는 장을 목차에 표시한다
  const sync = useCallback(() => {
    const b = box.current;
    if (!b) return;
    const top = b.getBoundingClientRect().top + 24;
    const secs = [...b.querySelectorAll<HTMLElement>("[data-sec]")];
    let cur = 0;
    secs.forEach((el, i) => {
      if (el.getBoundingClientRect().top <= top) cur = i;
    });
    if (b.scrollTop + b.clientHeight >= b.scrollHeight - 2) cur = secs.length - 1;
    setActive(cur);
  }, []);

  useEffect(() => {
    if (expanded) sync();
  }, [expanded, sync]);

  const jump = (i: number) => {
    const b = box.current;
    const el = b?.querySelector<HTMLElement>(`[data-sec="${i}"]`);
    if (!b || !el) return;
    setActive(i);
    b.scrollTo({ top: b.scrollTop + el.getBoundingClientRect().top - b.getBoundingClientRect().top - 12, behavior: "smooth" });
  };

  return (
    <section className="wd-scope" aria-labelledby="member-rules-title" style={{ margin: "18px 0 16px", minWidth: 0 }}>
      <div className="wd-card" style={{ padding: 0, overflow: "hidden" }}>
        <button
          type="button"
          className="t-rule-head"
          aria-expanded={expanded}
          aria-controls="member-rules-panel"
          onClick={() => setExpanded((v) => !v)}
        >
          <span style={{ minWidth: 0 }}>
            <span className="wd-badge orange">기본 규칙</span>
            <b id="member-rules-title" style={{ display: "block", margin: "8px 0 4px", fontSize: 16, fontWeight: 680, letterSpacing: "-.03em", color: "var(--t-ink)" }}>
              Native {r.title}
            </b>
            <span className="wd-t9 wd-faint" style={{ display: "block", lineHeight: 1.5 }}>모든 구성원이 숙지하고 지켜야 하는 기준이에요 · {r.updated} 기준</span>
          </span>
          <span className="t-rule-toggle">
            {expanded ? "접기" : "펼쳐 보기"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
        <div id="member-rules-panel" className={`t-rule-panel ${expanded ? "on" : ""}`} hidden={!expanded}>
        <nav aria-label="규칙 목차" style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 22px 14px" }}>
          {r.sections.map((s, i) => (
            <button key={s.title} type="button" className={`t-rule-chip ${active === i ? "on" : ""}`} aria-current={active === i ? "true" : undefined} onClick={() => jump(i)}>
              {i + 1}. {s.title}
            </button>
          ))}
        </nav>
        <div
          id="member-rules-body"
          ref={box}
          onScroll={sync}
          tabIndex={0}
          aria-label={`${r.title} 본문`}
          style={{
            position: "relative",
            maxHeight: 360,
            overflowY: "auto",
            overscrollBehavior: "contain",
            borderTop: "1px solid var(--t-line)",
            padding: "16px 22px 22px",
            background: "var(--t-soft)",
          }}
        >
          <p className="wd-t11" style={{ margin: "0 0 18px", lineHeight: 1.75, color: "var(--t-text)" }}>
            {r.intro}
          </p>
          {r.sections.map((s, i) => (
            <div key={s.title} data-sec={i} style={{ marginBottom: 22 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 680, color: "var(--t-ink)" }}>
                {i + 1}. {s.title}
              </h3>
              <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                {s.items.map((it, j) => (
                  <li key={it.title} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 4 }}>
                    <span className="wd-t10 wd-faint" style={{ fontWeight: 650 }}>
                      {i + 1}.{j + 1}
                    </span>
                    <div>
                      <b className="wd-t11" style={{ display: "block", fontWeight: 650, color: "var(--t-ink)" }}>
                        {it.title}
                      </b>
                      {it.text.map((t) => (
                        <p key={t.slice(0, 20)} className="wd-t10" style={{ margin: "3px 0 0", lineHeight: 1.75, color: "var(--t-text)" }}>
                          {t}
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
