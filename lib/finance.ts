// 재무: GET /finance/summary · /finance/receipts · /finance/contracts/{project}
import { useCallback, useEffect, useRef, useState } from "react";
import { api, toAttachment, type Attachment } from "./api";
import type { InhouseData, Pool, PoolId, Receipt } from "./inhouse";
import type { Tone } from "./demo";

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : v === undefined || v === null ? "" : String(v));
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseInt(str(v).replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

export type FinanceSummary = InhouseData & { month: string; lastSyncedAt: string | null; detailed: boolean };

const POOL_IDS: PoolId[] = ["operation", "reserve", "dividend"];

// 서버 설정에 새 풀이 생겨도 그대로 보여준다 (색은 poolColor 기본값)
function toPool(p: Raw, i: number): Pool {
  const id = (str(p.id) || POOL_IDS[i] || `pool-${i}`) as PoolId;
  return {
    id,
    label: str(p.label) || id,
    amount: num(p.amount),
    ratio: num(p.ratio),
    color: str(p.color),
    note: str(p.note),
  };
}

export function toReceipt(r: Raw): Receipt & { id: string } {
  return { id: str(r.id), client: str(r.client) || "거래처 미입력", project: str(r.project), amount: num(r.amount), status: str(r.status), date: str(r.date) };
}

export function toSummary(d: Raw): FinanceSummary {
  const s = (d.summary ?? {}) as Raw;
  const member = (d.member ?? {}) as Raw;
  return {
    period: str(d.period),
    month: str(d.month),
    demo: !!d.demo,
    lastSyncedAt: d.lastSyncedAt ? str(d.lastSyncedAt) : null,
    // 재정 권한이 있을 때만 서버가 최근 수금(receipts)을 내려준다
    detailed: Array.isArray(d.receipts),
    summary: {
      available: num(s.available),
      monthlyRevenue: num(s.monthlyRevenue),
      monthlyExpense: num(s.monthlyExpense),
      externalReceipts: num(s.externalReceipts),
      reserveBalance: num(s.reserveBalance),
    },
    pools: (Array.isArray(d.pools) ? d.pools : []).map((p, i) => toPool(p as Raw, i)),
    flow: (Array.isArray(d.flow) ? d.flow : []).map((f) => {
      const o = f as Raw;
      return { month: str(o.month), income: num(o.income), expense: num(o.expense) };
    }),
    receipts: (Array.isArray(d.receipts) ? d.receipts : []).map((r) => toReceipt(r as Raw)),
    notices: (Array.isArray(d.notices) ? d.notices : []).map((n) => {
      const o = n as Raw;
      return { category: str(o.category), title: str(o.title), meta: str(o.meta) };
    }),
    member: { email: str(member.email), name: str(member.name) },
  };
}

export const fetchFinanceSummary = async (month?: string) => toSummary(await api<Raw>("/finance/summary", { query: { month } }));

export function useFinanceSummary(month?: string) {
  const [data, setData] = useState<FinanceSummary | null>(null);
  const [error, setError] = useState("");
  const req = useRef(0);
  const load = useCallback(async () => {
    const id = ++req.current;
    setError("");
    try {
      const d = await fetchFinanceSummary(month);
      if (id === req.current) setData(d);
    } catch (e) {
      if (id === req.current) setError(e instanceof Error ? e.message : "재무 현황을 불러오지 못했어요.");
    }
  }, [month]);
  useEffect(() => {
    load();
  }, [load]);
  return { data, error, reload: load };
}

// ---- 수금 내역 ----

export const RECEIPT_STATUSES = ["청구 완료", "입금 대기", "입금 완료", "연체"] as const;
export const RECEIPT_TONE: Record<string, Tone> = { "청구 완료": "blue", "입금 대기": "orange", "입금 완료": "green", 연체: "red" };

export type ReceiptRow = Receipt & { id: string; month: string };
export type ReceiptTotals = { totalOrder: number; paid: number; pending: number; overdue: number };

// 기간 안 수금은 많지 않아서 끝까지 받아 상태 칩 숫자를 맞춘다 (최대 1,000건)
export async function fetchReceipts(from: string, to: string): Promise<{ rows: ReceiptRow[]; totals: ReceiptTotals }> {
  const rows: ReceiptRow[] = [];
  let totals: ReceiptTotals = { totalOrder: 0, paid: 0, pending: 0, overdue: 0 };
  let cursor: string | null = null;
  for (let i = 0; i < 10; i++) {
    const page: { items: Raw[]; nextCursor: string | null; totals?: Raw } = await api("/finance/receipts", {
      query: { from, to, cursor: cursor ?? undefined, limit: 100 },
    });
    if (i === 0 && page.totals) {
      totals = { totalOrder: num(page.totals.totalOrder), paid: num(page.totals.paid), pending: num(page.totals.pending), overdue: num(page.totals.overdue) };
    }
    rows.push(...page.items.map((r) => ({ ...toReceipt(r), month: str(r.date).slice(0, 7) })));
    cursor = page.nextCursor;
    if (!cursor) break;
  }
  return { rows, totals };
}

// ---- 계약 ----

export const CONTRACT_STEPS = ["상담", "견적", "계약", "제작", "납품", "수금"];

export type Contract = {
  pm: string;
  signed: string;
  total: number;
  collected: number;
  step: number;
  stepDates: string[];
  staff: string;
  split: string;
  next: string;
  file: Attachment | null;
  fileName: string;
};

export function toContract(c: Raw): Contract {
  const fileName = str(c.fileName ?? c.file);
  const fileId = str(c.fileId);
  return {
    pm: str(c.pm),
    signed: str(c.signed ?? c.signedAt),
    total: num(c.total ?? c.totalAmount ?? c.amount),
    collected: num(c.collected ?? c.collectedAmount),
    step: Math.max(0, Math.min(CONTRACT_STEPS.length, num(c.step))),
    stepDates: Array.isArray(c.stepDates) ? c.stepDates.map(str) : [],
    staff: str(c.staff),
    split: str(c.split),
    next: str(c.next),
    file: fileId ? toAttachment({ id: fileId, name: fileName || "계약서" }) : null,
    fileName,
  };
}

// 계약이 없으면 null (404)
export async function fetchContract(project: string): Promise<Contract | null> {
  try {
    return toContract(await api<Raw>(`/finance/contracts/${encodeURIComponent(project)}`));
  } catch (e) {
    if (e && typeof e === "object" && "status" in e && (e as { status: number }).status === 404) return null;
    throw e;
  }
}

// ---- 수금·계약 등록 (Admin · FA) ----

export const canWriteFinance = (roles: string[] | undefined) => !!roles?.some((r) => r === "Admin" || r === "FA");

export type ReceiptInput = { client: string; project: string; amount: number; status: string; date: string };

export const createReceipt = async (input: ReceiptInput) => toReceipt(await api<Raw>("/admin/finance/receipts", { method: "POST", body: input }));

export const updateReceipt = async (id: string, changes: Partial<ReceiptInput>) =>
  toReceipt(await api<Raw>(`/admin/finance/receipts/${encodeURIComponent(id)}`, { method: "PATCH", body: changes }));

export type ContractInput = { pm: string; signed: string; total: number; collected: number; step: number; staff: string; split: string; next: string };

export const contractInput = (c: Contract | null): ContractInput => ({
  pm: c?.pm ?? "",
  signed: c?.signed ?? "",
  total: c?.total ?? 0,
  collected: c?.collected ?? 0,
  step: c?.step ?? 0,
  staff: c?.staff ?? "",
  split: c?.split ?? "",
  next: c?.next ?? "",
});

// 서버는 projectId 로 중복을 막고 project 로도 찾는다 → 둘 다 같은 값으로 보낸다
export const createContract = async (project: string, input: ContractInput) =>
  toContract(await api<Raw>("/admin/finance/contracts", { method: "POST", body: { project, projectId: project, ...input } }));

export const updateContract = async (project: string, changes: Partial<ContractInput>) =>
  toContract(await api<Raw>(`/admin/finance/contracts/${encodeURIComponent(project)}`, { method: "PATCH", body: changes }));
