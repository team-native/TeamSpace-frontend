// 전자결재: /approvals · approve · reject · cancel · comments · /uploads · /projects
import { api, toAttachments, type Attachment } from "./api";
import type { Tone } from "./demo";

export type ApprovalStatus = "작성 중" | "결재 대기" | "검토 중" | "승인" | "반려" | "취소";
export const APPROVAL_STATUSES: ApprovalStatus[] = ["작성 중", "결재 대기", "검토 중", "승인", "반려", "취소"];
export const APPROVAL_TONE: Record<ApprovalStatus, Tone> = { "작성 중": "", "결재 대기": "orange", "검토 중": "blue", 승인: "green", 반려: "red", 취소: "" };
export const EXPENSE_TYPES = ["물품 구매", "도구·구독", "외부 비용", "교육·행사", "기타"] as const;
export const STAFF_ROLES = ["iOS", "Web", "Design", "PM", "Backend", "Android"] as const;

export type LineStep = { who: string; userId: string; role: string; state: "done" | "now" | "wait"; at: string };
export type ApprovalComment = { id: string; who: string; whoId: string; meta: string; text: string };

export type Approval = {
  id: string;
  kind: string;
  type: string;
  title: string;
  amount: string;
  amountValue: number;
  status: ApprovalStatus;
  date: string;
  author: string;
  authorId: string;
  project: string;
  useDate: string;
  reason: string;
  period: string;
  staff: Record<string, number>;
  line: LineStep[];
  files: Attachment[];
  comments: ApprovalComment[];
  received: boolean;
  rejectReason: string;
};

type ServerApproval = Record<string, unknown> & { id: string | number };

const p2 = (n: number) => String(n).padStart(2, "0");

export function shortTime(v: unknown): string {
  if (typeof v !== "string" || !v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v; // "대기" · "검토 중" 같은 글자는 그대로
  return `${p2(d.getMonth() + 1)}.${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

const str = (v: unknown) => (typeof v === "string" ? v : v === undefined || v === null ? "" : String(v));

export function toApproval(a: ServerApproval): Approval {
  const status = (APPROVAL_STATUSES as string[]).includes(str(a.status)) ? (str(a.status) as ApprovalStatus) : "결재 대기";
  const line = (Array.isArray(a.line) ? a.line : []).map((s: Record<string, unknown>) => ({
    who: str(s.who) || "담당자",
    userId: str(s.userId),
    role: str(s.role),
    state: (["done", "now", "wait"].includes(str(s.state)) ? str(s.state) : "wait") as LineStep["state"],
    at: shortTime(s.at),
  }));
  const comments = (Array.isArray(a.comments) ? a.comments : []).map((c: Record<string, unknown>, i: number) => ({
    id: str(c.id) || String(i),
    who: str(c.who) || "알 수 없음",
    whoId: str(c.whoId),
    meta: [str(c.meta), shortTime(c.createdAt)].filter(Boolean).join(" · "),
    text: str(c.text),
  }));
  const staff = a.staff && typeof a.staff === "object" ? (a.staff as Record<string, number>) : {};
  return {
    id: str(a.id),
    kind: str(a.kind) || "비용 승인",
    type: str(a.type),
    title: str(a.title) || "제목 없는 결재",
    amount: str(a.amount),
    amountValue: Number(a.amountValue ?? 0) || 0,
    status,
    date: status === "작성 중" ? "임시 저장" : shortTime(a.date).split(" ")[0],
    author: str(a.author),
    authorId: str(a.authorId),
    project: str(a.project),
    useDate: str(a.useDate),
    reason: str(a.reason),
    period: str(a.period),
    staff,
    line,
    files: toAttachments(a.files),
    comments,
    received: !!a.received,
    rejectReason: str(a.rejectReason),
  };
}

type Page = { items: ServerApproval[]; nextCursor: string | null };
export type Box = "mine" | "received" | "handled";

// 결재함은 사람마다 많지 않아서 상태 칩 숫자를 위해 최대 300건까지 받아 둔다
export async function fetchBox(box: Box, max = 300): Promise<Approval[]> {
  const all: Approval[] = [];
  let cursor: string | null = null;
  do {
    const page: Page = await api<Page>("/approvals", { query: { box, cursor: cursor ?? undefined, limit: 100 } });
    all.push(...page.items.map(toApproval));
    cursor = page.nextCursor;
  } while (cursor && all.length < max);
  return all;
}

export const fetchApproval = async (id: string) => toApproval(await api<ServerApproval>(`/approvals/${encodeURIComponent(id)}`));

export const approve = (id: string) => api<{ id: string; status: string }>(`/approvals/${encodeURIComponent(id)}/approve`, { method: "POST" });
export const reject = (id: string, reason: string) =>
  api<{ id: string; status: string }>(`/approvals/${encodeURIComponent(id)}/reject`, { method: "POST", body: { reason } });
export const cancelApproval = (id: string) => api<{ id: string; status: string }>(`/approvals/${encodeURIComponent(id)}/cancel`, { method: "POST" });

export async function addApprovalComment(id: string, text: string): Promise<ApprovalComment> {
  const c = await api<Record<string, unknown>>(`/approvals/${encodeURIComponent(id)}/comments`, { method: "POST", body: { text } });
  return { id: str(c.id), who: str(c.who), whoId: str(c.whoId), meta: [str(c.meta), shortTime(c.createdAt)].filter(Boolean).join(" · "), text: str(c.text) };
}

export type ApprovalInput = {
  kind: "비용 승인" | "인력 지원";
  type: string;
  title: string;
  amount: number;
  useDate: string;
  project: string;
  reason: string;
  files: string[];
  staff: Record<string, number>;
  period: string;
  templateSlug?: string;
};

export const createApproval = (input: ApprovalInput, draft: boolean) =>
  api<{ id: string; status: string }>("/approvals", { method: "POST", body: { ...input, status: draft ? "작성 중" : "결재 대기" } });

// 작성 중 · 반려 결재만 고칠 수 있다. 제출하면 결재선을 서버가 다시 만든다
export const updateApproval = (id: string, input: Omit<ApprovalInput, "kind">, draft: boolean) =>
  api<ServerApproval>(`/approvals/${encodeURIComponent(id)}`, { method: "PATCH", body: { ...input, status: draft ? "작성 중" : "결재 대기" } });

// ---- 업로드 · 프로젝트 ----

export type Uploaded = Attachment;

// POST /uploads (10MB 이하)
export async function uploadFile(file: File): Promise<Uploaded> {
  const form = new FormData();
  form.append("file", file);
  const b = await api<{ id: string; filename?: string; size?: number }>("/uploads", { method: "POST", form });
  return { id: String(b.id), name: b.filename || file.name, size: b.size ?? file.size, contentType: file.type };
}

export async function fetchProjectNames(): Promise<string[]> {
  const page = await api<{ items: { name?: string; title?: string }[] }>("/projects", { query: { limit: 100 } });
  return [...new Set(page.items.map((p) => p.name || p.title || "").filter(Boolean))];
}
