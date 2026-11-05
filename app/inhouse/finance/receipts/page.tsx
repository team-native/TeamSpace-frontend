"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import WdPage from "@/components/inhouse/WdPage";
import EmptyState from "@/components/inhouse/EmptyState";
import { won } from "@/lib/inhouse";
import { Eyebrow, useOutside } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import {
  RECEIPT_STATUSES,
  RECEIPT_TONE,
  fetchReceipts,
  type ReceiptRow,
  type ReceiptTotals,
} from "@/lib/finance";
import ReceiptDetailModal from "@/components/inhouse/ReceiptDetailModal";

type ReceiptStatus = (typeof RECEIPT_STATUSES)[number];
const STATUSES: ("전체" | ReceiptStatus)[] = ["전체", ...RECEIPT_STATUSES];

const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthsAgo = (n: number) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  return ym(d);
};
// "2026-10" 의 마지막 날
const lastDay = (m: string) => {
  const [y, mo] = m.split("-").map(Number);
  return `${m}-${String(new Date(y, mo, 0).getDate()).padStart(2, "0")}`;
};

function presets() {
  const year = new Date().getFullYear();
  return [
    ["이번 달", monthsAgo(0), monthsAgo(0)],
    ["최근 3개월", monthsAgo(2), monthsAgo(0)],
    ["올해", `${year}-01`, `${year}-12`],
  ] as const;
}
const defaultRange = () => ({ label: "최근 3개월", from: monthsAgo(2), to: monthsAgo(0) });

export default function ReceiptsPage() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("전체");
  const [range, setRange] = useState<{ label: string; from: string; to: string }>(defaultRange);
  const [draft, setDraft] = useState(range);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<ReceiptRow | null>(null);
  const [inRange, setInRange] = useState<ReceiptRow[] | null>(null);
  const [totals, setTotals] = useState<ReceiptTotals | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const req = useRef(0);
  const pickerRef = useOutside<HTMLDivElement>(pickerOpen, () => setPickerOpen(false));

  const load = useCallback(async () => {
    const id = ++req.current;
    setError(null);
    setInRange(null);
    try {
      const r = await fetchReceipts(`${range.from}-01`, lastDay(range.to));
      if (id !== req.current) return;
      setInRange(r.rows);
      setTotals(r.totals);
    } catch (e) {
      if (id === req.current)
        setError({ status: e instanceof ApiError ? e.status : 0, message: e instanceof Error ? e.message : "수금 내역을 불러오지 못했어요." });
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const all = inRange ?? [];
  const rows = all.filter((r) => status === "전체" || r.status === status);
  const count = (s: ReceiptStatus) => all.filter((r) => r.status === s).length;
  const months = [...new Set(rows.map((r) => r.month))].sort().reverse();
  const t = totals ?? { totalOrder: 0, paid: 0, pending: 0, overdue: 0 };

  if (error?.status === 403) {
    return (
      <WdPage active="finance">
        <div className="wd-wrap wd-pb">
          <EmptyState
            icon="🔒"
            title="수금 내역은 재정 권한이 필요해요"
            description="Admin · FA · Leader만 볼 수 있어요. 필요하면 운영진에게 요청해 주세요."
            actionLabel="재무 현황으로"
            onAction={() => (window.location.href = "/inhouse/finance")}
          />
        </div>
      </WdPage>
    );
  }

  return (
    <WdPage active="finance">
      <div className="wd-wrap wd-pb">
        <div className="wd-crumb">
          <Link href="/inhouse/finance">재무</Link> › <b>수금 내역</b>
        </div>

        <section className="wd-hero sm">
          <div>
            <Eyebrow>RECEIPTS</Eyebrow>
            <h1>수금 내역</h1>
            <p>외주 수주부터 입금까지, 들어온 돈을 프로젝트별로 확인해요.</p>
          </div>

          <div style={{ position: "relative" }} ref={pickerRef}>
            <button
              type="button"
              className="wd-btn line sm"
              aria-expanded={pickerOpen}
              onClick={() => setPickerOpen((v) => !v)}
            >
              {range.from.replace("-", ".")} – {range.to.replace("-", ".")} ▾
            </button>

            {pickerOpen && (
              <div className="wd-pop" style={{ top: 42, right: 0, width: 340, padding: 18 }}>
                <b className="wd-t11">기간 선택</b>

                <div className="wd-seg" style={{ margin: "12px 0 14px" }}>
                  {presets().map(([label, from, to]) => (
                    <button
                      type="button"
                      key={label}
                      className={draft.label === label ? "on" : ""}
                      onClick={() => setDraft({ label, from, to })}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={draft.label === "직접" ? "on" : ""}
                    onClick={() => setDraft({ ...draft, label: "직접" })}
                  >
                    직접
                  </button>
                </div>

                <div className="wd-row" style={{ gap: 8 }}>
                  <input
                    className="wd-input"
                    type="month"
                    value={draft.from}
                    onChange={(e) => setDraft({ ...draft, label: "직접", from: e.target.value })}
                  />
                  <span className="wd-faint">~</span>
                  <input
                    className="wd-input"
                    type="month"
                    value={draft.to}
                    onChange={(e) => setDraft({ ...draft, label: "직접", to: e.target.value })}
                  />
                </div>

                <button
                  type="button"
                  className="wd-btn full"
                  style={{ marginTop: 14 }}
                  onClick={() => {
                    setRange(
                      draft.from <= draft.to
                        ? draft
                        : { ...draft, from: draft.to, to: draft.from },
                    );
                    setPickerOpen(false);
                  }}
                >
                  적용
                </button>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="wd-banner danger" style={{ marginBottom: 18 }}>
            <span className="ico">!</span>
            <div>
              <b>{error.message}</b>
            </div>
            <button type="button" className="wd-btn sm" onClick={load}>
              다시 시도
            </button>
          </div>
        )}

        <div className="wd-grid g4" style={{ marginBottom: 24 }} aria-busy={!inRange && !error}>
          {[
            ["누적 수주", t.totalOrder, `${all.length}건`],
            ["입금 완료", t.paid, `${Math.round((t.paid / (t.totalOrder || 1)) * 100)}%`],
            ["입금 대기", t.pending, `${count("입금 대기") + count("청구 완료")}건`],
            ["연체", t.overdue, `${count("연체")}건`],
          ].map(([k, v, s], i) => (
            <div className="wd-card wd-stat" key={k as string}>
              <small>{k}</small>
              <strong style={{ color: i === 3 && (v as number) > 0 ? "#f04452" : undefined }}>
                {inRange ? `${won.format(v as number)}원` : "–"}
              </strong>
              <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 5 }}>
                {s}
              </span>
            </div>
          ))}
        </div>

        <div className="wd-between" style={{ marginBottom: 12, flexWrap: "wrap" }}>
          <div className="wd-tabs">
            {STATUSES.map((s) => (
              <button
                type="button"
                key={s}
                className={status === s ? "on" : ""}
                onClick={() => setStatus(s)}
              >
                {s}
                <small>
                  {s === "전체" ? all.length : count(s)}
                </small>
              </button>
            ))}
          </div>
          <span className="wd-t9 wd-faint">재정 권한으로 전체 금액이 보여요</span>
        </div>

        {!inRange && !error ? (
          <p className="wd-t11 wd-faint" aria-busy="true">
            수금 내역을 불러오는 중이에요…
          </p>
        ) : rows.length > 0 ? (
          <div className="wd-card" style={{ padding: "18px 22px 6px", overflowX: "auto" }}>
            <table className="wd-table" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th>고객사</th>
                  <th>프로젝트</th>
                  <th>상태</th>
                  <th>일자</th>
                  <th className="num">금액</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m) => (
                  <Fragment key={m}>
                    <tr className="group">
                      <td colSpan={5}>
                        {m.slice(0, 4)}년 {Number(m.slice(5))}월
                      </td>
                    </tr>
                    {rows
                      .filter((r) => r.month === m)
                      .map((r) => (
                        <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setSelected(r)}>
                          <td><b>{r.client}</b></td>
                          <td>{r.project}</td>
                          <td>
                            <span className={`wd-badge ${RECEIPT_TONE[r.status] ?? ""}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="wd-faint">{r.date.replace(/-/g, ".")}</td>
                          <td className="num">{won.format(r.amount)}원</td>
                        </tr>
                      ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? null : (
          <EmptyState
            icon="⌕"
              title="수금 내역이 없어요"
              description="기간이나 상태를 바꿔서 다시 확인해보세요."
              actionLabel="필터 초기화"
              onAction={() => {
                const next = defaultRange();
                setStatus("전체");
                setRange(next);
                setDraft(next);
                setPickerOpen(false);
              }}
            />
        )}
      </div>

      {selected && (
        <ReceiptDetailModal
          type="contract"
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </WdPage>
  );
}