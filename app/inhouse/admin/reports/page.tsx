"use client";

import { useState } from "react";
import AdminShell from "@/components/inhouse/AdminShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { useToast } from "@/components/inhouse/ui";
import { REPORTS, REPORT_LOG, type ReportAction } from "@/lib/admin";
import type { Tone } from "@/lib/demo";

const ACTIONS: [ReportAction, string, string, Tone][] = [
  ["가림", "문제 부분만 가리기", "해당 문장을 ••• 로 가리고 글은 유지", "orange"],
  ["숨김", "글 숨김", "작성자에게만 보이고 사유 알림", "red"],
  ["반려", "신고 반려", "문제없음 · 신고자에게 결과 알림", ""],
];

export default function AdminReports() {
  const toast = useToast();
  const [queue, setQueue] = useState(REPORTS);
  const [log, setLog] = useState(REPORT_LOG);
  const [pick, setPick] = useState<ReportAction>("가림");
  const report = queue[0];

  return (
    <AdminShell title="신고 처리" sub="신고자는 운영진에게도 공개되지 않아요.">
      <div className="wd-side">
        {report ? (
          <section className="wd-card" style={{ padding: 28 }}>
            <div className="wd-row" style={{ gap: 6, marginBottom: 14 }}>
              <span className="wd-badge red">{report.reason}</span>
              <span className="wd-badge">신고 {report.count}회</span>
              <span className="wd-t9 wd-faint">
                {report.target} · {report.when}
              </span>
            </div>
            <div className="wd-card soft" style={{ padding: 18, marginBottom: 18 }}>
              <span className="wd-badge">{report.category}</span>
              <b style={{ display: "block", margin: "10px 0 6px", fontSize: 14 }}>{report.title}</b>
              <p className="wd-t11" style={{ margin: 0, lineHeight: 1.7, color: "var(--wd-text)" }}>
                {report.body}
                <mark style={{ background: "#fff0f1", color: "#d83442" }}>{pick === "가림" ? "•••" : report.flagged}</mark>
              </p>
              <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 10 }}>
                작성자 익명 · 운영진은 신고 처리 시에만 작성자 확인 가능
              </span>
            </div>
            <b className="wd-t10" style={{ color: "var(--wd-sub)" }}>처리 방법</b>
            <div className="wd-stack" role="radiogroup" aria-label="처리 방법" style={{ gap: 8, marginTop: 10 }}>
              {ACTIONS.map(([key, t, d]) => (
                <button
                  type="button"
                  key={key}
                  role="radio"
                  aria-checked={pick === key}
                  className="wd-row wd-t11"
                  style={{ padding: "12px 14px", border: `1px solid ${pick === key ? "#3182f6" : "var(--wd-line)"}`, borderRadius: 12, gap: 10, background: "transparent", textAlign: "left", color: "inherit" }}
                  onClick={() => setPick(key)}
                >
                  <span className={`wd-radio ${pick === key ? "on" : ""}`} />
                  <span>
                    <b style={{ fontWeight: 620 }}>{t}</b>
                    <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 3 }}>{d}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="wd-row" style={{ justifyContent: "flex-end", marginTop: 18 }}>
              <button
                type="button"
                className="wd-btn"
                onClick={() => {
                  const tone = ACTIONS.find(([k]) => k === pick)![3];
                  setLog((l) => [{ action: pick, tone, title: report.title, date: "방금" }, ...l]);
                  setQueue((q) => q.slice(1));
                  toast.show(pick === "반려" ? "신고를 반려하고 결과를 알렸어요" : "처리했어요. 작성자에게 사유를 알렸어요");
                }}
              >
                처리 완료
              </button>
            </div>
          </section>
        ) : (
          <EmptyState icon="✓" title="처리할 신고가 없어요" description="새 신고가 들어오면 여기에 보여요." />
        )}
        <aside className="wd-card">
          <div className="wd-card-head">
            <h3>처리 기록</h3>
          </div>
          {log.map(({ action, tone, title, date }) => (
            <div key={title + date} className="wd-between wd-t10" style={{ padding: "9px 0" }}>
              <span className="wd-row" style={{ gap: 8 }}>
                <span className={`wd-badge ${tone}`}>{action}</span>
                {title}
              </span>
              <span className="wd-faint wd-t9">{date}</span>
            </div>
          ))}
        </aside>
      </div>
      {toast.node}
    </AdminShell>
  );
}
