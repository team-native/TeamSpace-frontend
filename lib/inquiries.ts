// 문의 · 건의: GET /inquiries · POST /inquiries · resolve · comments
import { api } from "./api";
import type { Tone } from "./shared";

export const INQUIRY_TYPES = ["문의", "건의", "불편 신고"] as const;
export const INQUIRY_STEPS = ["접수", "검토 중", "답변 완료"] as const;
export type InquiryStatus = "접수" | "검토 중" | "답변 완료" | "해결됨";
export const INQUIRY_TONE: Record<InquiryStatus, Tone> = { 접수: "", "검토 중": "blue", "답변 완료": "green", 해결됨: "dark" };

export type Reply = { who: string; at: string; text: string };
export type Inquiry = {
  id: string;
  type: string;
  dept: string;
  title: string;
  body: string;
  anonymous: boolean;
  status: InquiryStatus;
  date: string;
  steps: string[];
  answer: (Reply & { whoId?: string }) | null;
  replies: Reply[];
};

type ServerReply = { who?: string; whoId?: string; at?: string; text?: string };
type ServerInquiry = {
  id: string | number;
  type?: string;
  dept?: string;
  title?: string;
  body?: string;
  anonymous?: boolean;
  status?: string;
  steps?: string[];
  answer?: ServerReply | null;
  replies?: ServerReply[];
  createdAt?: string;
};

export function stamp(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const toReply = (r: ServerReply): Reply => ({ who: r.who || "알 수 없음", at: stamp(r.at), text: r.text ?? "" });

export function toInquiry(q: ServerInquiry): Inquiry {
  const status = (["접수", "검토 중", "답변 완료", "해결됨"] as const).find((s) => s === q.status) ?? "접수";
  const steps = (q.steps ?? []).map((s) => stamp(s));
  return {
    id: String(q.id),
    type: q.type || "문의",
    dept: q.dept || "",
    title: q.title ?? "",
    body: q.body ?? "",
    anonymous: !!q.anonymous,
    status,
    date: (steps[0] || stamp(q.createdAt)).split(" ")[0],
    steps: [steps[0] ?? "", steps[1] ?? "", steps[2] ?? ""],
    answer: q.answer && q.answer.text ? { ...toReply(q.answer), whoId: q.answer.whoId } : null,
    replies: (q.replies ?? []).map(toReply),
  };
}

type Page = { items: ServerInquiry[]; nextCursor: string | null };

export async function fetchInquiries(cursor?: string | null) {
  const page = await api<Page>("/inquiries", { query: { cursor: cursor ?? undefined, limit: 50 } });
  return { items: page.items.map(toInquiry), nextCursor: page.nextCursor };
}

export type InquiryInput = { type: string; dept: string; title: string; body: string; anonymous: boolean };
export const createInquiry = (input: InquiryInput) => api<{ id: string; status: string }>("/inquiries", { method: "POST", body: input });
export const resolveInquiry = (id: string) => api<{ id: string; status: string }>(`/inquiries/${encodeURIComponent(id)}/resolve`, { method: "POST" });
export const addInquiryReply = async (id: string, text: string) =>
  toReply(await api<ServerReply>(`/inquiries/${encodeURIComponent(id)}/comments`, { method: "POST", body: { text } }));
