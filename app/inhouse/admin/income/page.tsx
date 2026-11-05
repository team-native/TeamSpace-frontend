"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminShell from "@/components/inhouse/AdminShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { Modal, useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import {
  CONTRACT_STEPS,
  RECEIPT_STATUSES,
  RECEIPT_TONE,
  canWriteFinance,
  contractInput,
  createContract,
  createReceipt,
  fetchContract,
  fetchReceipts,
  updateContract,
  updateReceipt,
  type Contract,
  type ContractInput,
  type ReceiptInput,
  type ReceiptRow,
  type ReceiptTotals,
} from "@/lib/finance";
import { useMe } from "@/lib/session";

const won = (n: number) => n.toLocaleString("ko-KR");
const digits = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const EMPTY_RECEIPT: ReceiptInput = { client: "", project: "", amount: 0, status: "청구 완료", date: "" };

export default function AdminIncome() {
  const toast = useToast();
  const { me } = useMe();
  const canWrite = canWriteFinance(me?.roles);
  const [rows, setRows] = useState<ReceiptRow[] | null>(null);
  const [totals, setTotals] = useState<ReceiptTotals | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [busy, setBusy] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ReceiptInput>(EMPTY_RECEIPT);
  const [contractOf, setContractOf] = useState("");
  const req = useRef(0);

  const load = useCallback(async () => {
    const id = ++req.current;
    setError(null);
    try {
      const r = await fetchReceipts("", "");
      if (id !== req.current) return;
      setRows(r.rows);
      setTotals(r.totals);
    } catch (e) {
      if (id === req.current) setError({ status: e instanceof ApiError ? e.status : 0, message: e instanceof Error ? e.message : "수금 내역을 불러오지 못했어요." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const projects = useMemo(() => [...new Set((rows ?? []).map((r) => r.project).filter(Boolean))], [rows]);
  const clients = useMemo(() => [...new Set((rows ?? []).map((r) => r.client).filter(Boolean))], [rows]);
  const canAdd = !!form.client.trim() && !!form.project.trim() && form.amount > 0 && !!form.date && !busy;

  const changeStatus = async (r: ReceiptRow, status: string) => {
    if (busy || r.status === status) return;
    setBusy(r.id);
    try {
      await updateReceipt(r.id, { status });
      toast.show(`'${r.project}' 수금 상태를 '${status}'(으)로 바꿨어요`);
      load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "상태를 바꾸지 못했어요.");
    } finally {
      setBusy("");
    }
  };

  const add = async () => {
    if (!canAdd) return;
    setBusy("new");
    try {
      await createReceipt({ ...form, client: form.client.trim(), project: form.project.trim() });
      toast.show(`${won(form.amount)}원 수금을 등록했어요`);
      setForm(EMPTY_RECEIPT);
      setAdding(false);
      load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "수금을 등록하지 못했어요.");
    } finally {
      setBusy("");
    }
  };

  if (error?.status === 403) {
    return (
      <AdminShell title="수주 · 입금">
        <EmptyState icon="!" title="재정 권한이 있어야 볼 수 있어요" description="Admin · Leader · FA 역할만 수금 내역을 볼 수 있어요." />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="수주 · 입금"
      sub="외주 수금 내역과 프로젝트별 계약 정보를 관리해요."
      right={
        <button
          type="button"
          className="wd-btn"
          disabled={!canWrite}
          onClick={() => {
            setForm({ ...EMPTY_RECEIPT, date: today() });
            setAdding(true);
          }}
        >
          + 수금 등록
        </button>
      }
    >
      {me && !canWrite && (
        <div className="wd-banner warn" style={{ marginBottom: 18 }}>
          <span className="ico" style={{ color: "#9a6b00" }}>!</span>
          <div>
            <b>수금·계약 등록은 Admin · FA만 할 수 있어요</b>
            <p>Leader는 내역을 볼 수만 있어요.</p>
          </div>
        </div>
      )}
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
      {!rows && !error && (
        <p className="wd-t11 wd-faint" aria-busy="true">
          수금 내역을 불러오는 중이에요…
        </p>
      )}
      {rows && totals && (
        <>
          <div className="wd-grid g4" style={{ marginBottom: 18 }}>
            {(
              [
                ["전체", totals.totalOrder, ""],
                ["입금 완료", totals.paid, "green"],
                ["청구 · 입금 대기", totals.pending, "orange"],
                ["연체", totals.overdue, "red"],
              ] as const
            ).map(([label, value, tone]) => (
              <div key={label} className="wd-card soft" style={{ padding: 16 }}>
                <span className="wd-t9 wd-faint" style={{ display: "block" }}>{label}</span>
                <b className={tone ? `wd-badge ${tone}` : ""} style={{ display: "inline-flex", marginTop: 6, fontSize: 14 }}>
                  {won(value)}원
                </b>
              </div>
            ))}
          </div>
          {rows.length === 0 ? (
            <EmptyState icon="₩" title="아직 등록된 수금이 없어요" description="수금 등록으로 첫 내역을 추가해 보세요." />
          ) : (
            <div className="wd-card" style={{ padding: "18px 22px 6px", overflowX: "auto" }}>
              <table className="wd-table">
                <thead>
                  <tr>
                    <th>프로젝트</th>
                    <th>고객사</th>
                    <th>날짜</th>
                    <th>상태</th>
                    <th className="num">금액</th>
                    <th className="num">계약</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <b>{r.project || "-"}</b>
                      </td>
                      <td>{r.client}</td>
                      <td>{r.date}</td>
                      <td>
                        {canWrite ? (
                          <select
                            className={`wd-badge ${RECEIPT_TONE[r.status] ?? ""}`}
                            style={{ border: 0, font: "inherit", cursor: "pointer" }}
                            aria-label={`${r.project} 수금 상태`}
                            value={r.status}
                            disabled={busy === r.id}
                            onChange={(e) => changeStatus(r, e.target.value)}
                          >
                            {!RECEIPT_STATUSES.includes(r.status as (typeof RECEIPT_STATUSES)[number]) && <option value={r.status}>{r.status}</option>}
                            {RECEIPT_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`wd-badge ${RECEIPT_TONE[r.status] ?? ""}`}>{r.status}</span>
                        )}
                      </td>
                      <td className="num">{won(r.amount)}</td>
                      <td className="num">
                        {r.project && (
                          <button type="button" className="wd-btn ghost sm" onClick={() => setContractOf(r.project)}>
                            보기
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {adding && (
        <Modal
          eyebrow="RECEIPT"
          title="수금 등록"
          sub="청구하거나 입금된 외주 금액을 적어주세요."
          onClose={() => setAdding(false)}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => setAdding(false)}>
                취소
              </button>
              <button type="submit" form="receipt-form" className="wd-btn" disabled={!canAdd} aria-busy={busy === "new"}>
                {busy === "new" ? "등록 중…" : "등록"}
              </button>
            </>
          }
        >
          <form
            id="receipt-form"
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
          >
            <div className="wd-grid g2">
              <label className="wd-field">
                <span>프로젝트</span>
                <input className="wd-input" required list="income-projects" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} placeholder="예: Book-on 앱 개발" />
                <datalist id="income-projects">
                  {projects.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </label>
              <label className="wd-field">
                <span>고객사</span>
                <input className="wd-input" required list="income-clients" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
                <datalist id="income-clients">
                  {clients.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>
            </div>
            <div className="wd-grid g2">
              <label className="wd-field">
                <span>날짜</span>
                <input className="wd-input" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </label>
              <label className="wd-field">
                <span>금액</span>
                <input
                  className="wd-input"
                  inputMode="numeric"
                  required
                  value={form.amount ? won(form.amount) : ""}
                  onChange={(e) => setForm({ ...form, amount: digits(e.target.value) })}
                  placeholder="0"
                />
              </label>
            </div>
            <div className="wd-field" style={{ marginBottom: 0 }}>
              <span>상태</span>
              <div className="wd-seg" role="radiogroup" aria-label="상태">
                {RECEIPT_STATUSES.map((s) => (
                  <button type="button" key={s} role="radio" aria-checked={form.status === s} className={form.status === s ? "on" : ""} onClick={() => setForm({ ...form, status: s })}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </Modal>
      )}

      {contractOf && <ContractEditor project={contractOf} canWrite={canWrite} onClose={() => setContractOf("")} onSaved={(m) => toast.show(m)} />}
      {toast.node}
    </AdminShell>
  );
}

function ContractEditor({ project, canWrite, onClose, onSaved }: { project: string; canWrite: boolean; onClose: () => void; onSaved: (msg: string) => void }) {
  const [original, setOriginal] = useState<Contract | null | undefined>(undefined);
  const [form, setForm] = useState<ContractInput>(contractInput(null));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof ContractInput>(k: K, v: ContractInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    let alive = true;
    fetchContract(project)
      .then((c) => {
        if (!alive) return;
        setOriginal(c);
        setForm(contractInput(c));
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "계약 정보를 불러오지 못했어요."));
    return () => {
      alive = false;
    };
  }, [project]);

  const isNew = original === null;
  const overCollected = form.total > 0 && form.collected > form.total;

  const save = async () => {
    if (saving || overCollected || original === undefined) return;
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        await createContract(project, form);
        onSaved("계약 정보를 등록했어요");
      } else {
        const before = contractInput(original);
        const changes = Object.fromEntries(Object.entries(form).filter(([k, v]) => before[k as keyof ContractInput] !== v)) as Partial<ContractInput>;
        if (Object.keys(changes).length === 0) {
          onSaved("바뀐 내용이 없어요");
          onClose();
          return;
        }
        await updateContract(project, changes);
        onSaved("계약 정보를 저장했어요");
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "계약 정보를 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      eyebrow="CONTRACT"
      title={project}
      sub={original === undefined ? "계약 정보를 불러오는 중이에요…" : isNew ? "아직 계약 정보가 없어요. 등록할 수 있어요." : undefined}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="wd-btn ghost" onClick={onClose}>
            닫기
          </button>
          {canWrite && original !== undefined && (
            <button type="submit" form="contract-form" className="wd-btn" disabled={saving || overCollected} aria-busy={saving}>
              {saving ? "저장 중…" : isNew ? "계약 등록" : "저장"}
            </button>
          )}
        </>
      }
    >
      {error && (
        <div className="wd-banner danger" role="alert" style={{ marginBottom: 14 }}>
          <span className="ico">!</span>
          <div>
            <b>{error}</b>
          </div>
        </div>
      )}
      {original !== undefined && (
        <form
          id="contract-form"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <fieldset disabled={!canWrite} style={{ border: 0, padding: 0, margin: 0 }}>
            <div className="wd-grid g2">
              <label className="wd-field">
                <span>담당 PM</span>
                <input className="wd-input" value={form.pm} onChange={(e) => set("pm", e.target.value)} />
              </label>
              <label className="wd-field">
                <span>계약일</span>
                <input className="wd-input" type="date" value={form.signed} onChange={(e) => set("signed", e.target.value)} />
              </label>
            </div>
            <div className="wd-grid g2">
              <label className="wd-field">
                <span>계약 금액</span>
                <input className="wd-input" inputMode="numeric" value={form.total ? won(form.total) : ""} onChange={(e) => set("total", digits(e.target.value))} placeholder="0" />
              </label>
              <label className="wd-field">
                <span>
                  수금한 금액 {overCollected && <em style={{ color: "#f04452" }}>계약 금액보다 커요</em>}
                </span>
                <input className="wd-input" inputMode="numeric" value={form.collected ? won(form.collected) : ""} onChange={(e) => set("collected", digits(e.target.value))} placeholder="0" />
              </label>
            </div>
            <div className="wd-field">
              <span>
                지금 단계 <em>앞 단계는 끝난 것으로 보여요</em>
              </span>
              <div className="wd-seg" role="radiogroup" aria-label="진행 단계">
                {CONTRACT_STEPS.map((s, i) => (
                  <button type="button" key={s} role="radio" aria-checked={form.step === i} className={form.step === i ? "on" : ""} onClick={() => set("step", i)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="wd-grid g2">
              <label className="wd-field">
                <span>참여 인원</span>
                <input className="wd-input" value={form.staff} onChange={(e) => set("staff", e.target.value)} placeholder="예: iOS 2 · 디자인 1" />
              </label>
              <label className="wd-field">
                <span>배분</span>
                <input className="wd-input" value={form.split} onChange={(e) => set("split", e.target.value)} placeholder="예: 운영 60 · 적립 25 · 배당 15" />
              </label>
            </div>
            <label className="wd-field" style={{ marginBottom: 0 }}>
              <span>다음 할 일</span>
              <input className="wd-input" value={form.next} onChange={(e) => set("next", e.target.value)} placeholder="예: 2차 중도금 청구 (12.10)" />
            </label>
          </fieldset>
        </form>
      )}
    </Modal>
  );
}
