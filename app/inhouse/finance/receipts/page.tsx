"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import WdPage from "@/components/inhouse/WdPage";
import { Eyebrow, Modal, useOutside } from "@/components/inhouse/ui";
import { CONTRACTS, CONTRACT_STEPS, RECEIPT_ROWS, RECEIPT_TONE, type ReceiptRow, type ReceiptStatus } from "@/lib/demo";
import { won } from "@/lib/inhouse";

const STATUSES: ("전체" | ReceiptStatus)[] = ["전체", "청구 완료", "입금 대기", "입금 완료", "연체"];
const PRESETS = [
  ["이번 달", "2026-10", "2026-10"],
  ["최근 3개월", "2026-08", "2026-10"],
  ["올해", "2026-01", "2026-12"],
] as const;

// 데모: 재정 정보 전체 열람은 FA · Leader 만. 지금 계정은 Leader
const CAN_SEE_ALL = true;

export default function ReceiptsPage() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("전체");
  const [range, setRange] = useState<{ label: string; from: string; to: string }>({ label: "최근 3개월", from: "2026-08", to: "2026-10" });
  const [draft, setDraft] = useState(range);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<ReceiptRow | null>(null);
  const pickerRef = useOutside<HTMLDivElement>(pickerOpen, () => setPickerOpen(false));

  const inRange = useMemo(() => RECEIPT_ROWS.filter((r) => r.month >= range.from && r.month <= range.to), [range]);
  const rows = inRange.filter((r) => status === "전체" || r.status === status);
  const sum = (s?: ReceiptStatus) => inRange.filter((r) => !s || r.status === s).reduce((a, r) => a + r.amount, 0);
  const months = [...new Set(rows.map((r) => r.month))].sort().reverse();
  const contract = selected ? CONTRACTS[selected.project] : undefined;

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
            <button type="button" className="wd-btn line sm" aria-expanded={pickerOpen} onClick={() => setPickerOpen((v) => !v)}>
              {range.from.replace("-", ".")} – {range.to.replace("-", ".")} ▾
            </button>
            {pickerOpen && (
              <div className="wd-pop" style={{ top: 42, right: 0, width: 340, padding: 18 }}>
                <b className="wd-t11">기간 선택</b>
                <div className="wd-seg" style={{ margin: "12px 0 14px" }}>
                  {PRESETS.map(([label, from, to]) => (
                    <button type="button" key={label} className={draft.label === label ? "on" : ""} onClick={() => setDraft({ label, from, to })}>
                      {label}
                    </button>
                  ))}
                  <button type="button" className={draft.label === "직접" ? "on" : ""} onClick={() => setDraft({ ...draft, label: "직접" })}>
                    직접
                  </button>
                </div>
                <div className="wd-row" style={{ gap: 8 }}>
                  <input className="wd-input" type="month" value={draft.from} onChange={(e) => setDraft({ ...draft, label: "직접", from: e.target.value })} />
                  <span className="wd-faint">~</span>
                  <input className="wd-input" type="month" value={draft.to} onChange={(e) => setDraft({ ...draft, label: "직접", to: e.target.value })} />
                </div>
                <button
                  type="button"
                  className="wd-btn full"
                  style={{ marginTop: 14 }}
                  onClick={() => {
                    setRange(draft.from <= draft.to ? draft : { ...draft, from: draft.to, to: draft.from });
                    setPickerOpen(false);
                  }}
                >
                  적용
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="wd-grid g4" style={{ marginBottom: 24 }}>
          {[
            ["누적 수주", sum(), `${inRange.length}건`],
            ["입금 완료", sum("입금 완료"), `${Math.round((sum("입금 완료") / (sum() || 1)) * 100)}%`],
            ["입금 대기", sum("입금 대기"), `${inRange.filter((r) => r.status === "입금 대기").length}건`],
            ["연체", sum("연체"), `${inRange.filter((r) => r.status === "연체").length}건`],
          ].map(([k, v, s], i) => (
            <div className="wd-card wd-stat" key={k as string}>
              <small>{k}</small>
              <strong style={{ color: i === 3 && (v as number) > 0 ? "#f04452" : undefined }}>
                {CAN_SEE_ALL ? `${won.format(v as number)}원` : "권한 필요"}
              </strong>
              <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 5 }}>{s}</span>
            </div>
          ))}
        </div>

        <div className="wd-between" style={{ marginBottom: 12, flexWrap: "wrap" }}>
          <div className="wd-tabs">
            {STATUSES.map((s) => (
              <button type="button" key={s} className={status === s ? "on" : ""} onClick={() => setStatus(s)}>
                {s}
                <small>{s === "전체" ? inRange.length : inRange.filter((r) => r.status === s).length}</small>
              </button>
            ))}
          </div>
          <span className="wd-t9 wd-faint">FA · Leader 권한으로 전체 금액이 보여요</span>
        </div>

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
                        <td><span className={`wd-badge ${RECEIPT_TONE[r.status]}`}>{r.status}</span></td>
                        <td className="wd-faint">{r.date}</td>
                        <td className="num">{won.format(r.amount)}원</td>
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="pf-empty" style={{ padding: 30 }}>이 기간에 해당하는 내역이 없어요.</div>}
        </div>
      </div>

      {selected && (
        <Modal
          eyebrow="CONTRACT"
          title={selected.project}
          sub={`${selected.client}${contract ? ` · 계약 ${contract.signed}` : ""}`}
          size="lg"
          onClose={() => setSelected(null)}
          footer={
            <button type="button" className="wd-btn" onClick={() => setSelected(null)}>
              닫기
            </button>
          }
        >
          {contract ? (
            <>
              <div className="wd-between" style={{ marginBottom: 20, flexWrap: "wrap" }}>
                <div className="wd-stat">
                  <small>총 계약 금액</small>
                  <strong>{won.format(contract.total)}원</strong>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="wd-t9 wd-faint">
                    수금 {won.format(contract.collected)}원 / {won.format(contract.total)}원
                  </span>
                  <div className="wd-bar" style={{ width: 220, marginTop: 8 }}>
                    <i style={{ width: `${(contract.collected / contract.total) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="wd-card soft" style={{ padding: "18px 10px", marginBottom: 20 }}>
                <div className="wd-line">
                  {CONTRACT_STEPS.map((s, i) => (
                    <div key={s} className={i < contract.step ? "done" : i === contract.step ? "now" : ""}>
                      <span className="wd-av">{i < contract.step ? "✓" : i + 1}</span>
                      <b>{s}</b>
                      <small>{contract.stepDates[i]}</small>
                    </div>
                  ))}
                </div>
              </div>
              <dl className="wd-kv" style={{ marginBottom: 20 }}>
                <div><dt>담당 PM</dt><dd>{contract.pm}</dd></div>
                <div><dt>참여 인원</dt><dd>{contract.staff}</dd></div>
                <div><dt>배분 기준</dt><dd>{contract.split}</dd></div>
                <div><dt>다음 청구</dt><dd>{contract.next}</dd></div>
              </dl>
              <div className="wd-file">
                <span className="ext">PDF</span>
                <div>
                  <b>{contract.file}</b>
                  <small>계약서 · {contract.signed} 업로드</small>
                </div>
                <span className="end">↓</span>
              </div>
            </>
          ) : (
            <dl className="wd-kv">
              <div><dt>금액</dt><dd>{won.format(selected.amount)}원</dd></div>
              <div><dt>상태</dt><dd>{selected.status}</dd></div>
              <div><dt>일자</dt><dd>{selected.date}</dd></div>
              <div><dt>계약 정보</dt><dd>아직 등록되지 않았어요</dd></div>
            </dl>
          )}
        </Modal>
      )}
    </WdPage>
  );
}
