// 운영 제안: /proposals · /proposals/{id} · recommend · comments · 관리 PATCH /admin/proposals/{id}
import { api } from "./api";
import { relTime } from "./board";

// 제안은 담당 부서로 보낸다 (서버에는 category 로 들어간다)
export const PROPOSAL_DEPTS = ["NativeOps", "FA", "PM / PO", "전공 리더", "NativeLab", "Design & Client"] as const;

// 서버 상태 이름 그대로
export const PROPOSAL_STATUSES = ["접수", "검토 중", "협업 중", "답변 완료", "반려"] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number] | string;

export const STATUS_TONE: Record<string, string> = { 접수: "", "검토 중": "blue", "협업 중": "violet", "답변 완료": "green", 반려: "red" };

export const PROPOSAL_SORTS = { 최신순: "latest", 추천순: "likes", 댓글순: "comments" } as const;
export type ProposalSortLabel = keyof typeof PROPOSAL_SORTS;

export type ProposalComment = { id: string; author: string; anonymous: boolean; text: string; when: string; mine: boolean };

export type Proposal = {
  id: string;
  dept: string;
  title: string;
  body: string;
  status: ProposalStatus;
  anonymous: boolean;
  author: string;
  recommendCount: number;
  commentCount: number;
  createdAt: string;
  when: string;
  mine: boolean;
  views: number;
  recommended: boolean;
  answer: { who: string; text: string; when: string } | null;
  history: { status: string; at: string }[];
  comments: ProposalComment[];
};

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
const arr = (v: unknown): Raw[] => (Array.isArray(v) ? v : []);

function toComment(c: Raw): ProposalComment {
  const anonymous = !!c.anonymous;
  const n = c.anonymousNumber;
  const author = str(c.author);
  return {
    id: str(c.id),
    anonymous,
    author: author === "글쓴이" ? "글쓴이" : anonymous ? (author || (n ? `익명 ${n}` : "익명")) : author || "알 수 없음",
    text: str(c.text),
    when: relTime(c.createdAt),
    mine: !!c.mine,
  };
}

export function toProposal(p: Raw): Proposal {
  const anonymous = !!p.anonymous;
  return {
    id: str(p.id),
    dept: str(p.category),
    title: str(p.title),
    body: str(p.body ?? p.content),
    status: str(p.status) || "접수",
    anonymous,
    author: anonymous ? "익명" : str(p.author) || "알 수 없음",
    recommendCount: Number(p.recommendCount ?? p.likes) || 0,
    commentCount: Number(p.commentCount) || arr(p.comments).length,
    createdAt: str(p.createdAt),
    when: relTime(p.createdAt),
    mine: !!p.mine,
    views: Number(p.views) || 0,
    recommended: !!p.recommended,
    answer: p.answer && p.answer.text ? { who: str(p.answer.who) || "운영진", text: str(p.answer.text), when: relTime(p.answer.at) } : null,
    history: arr(p.history).map((h) => ({ status: str(h.status), at: str(h.at) })),
    comments: arr(p.comments).map(toComment),
  };
}

type Page = { items: Raw[]; nextCursor: string | null };

export async function fetchProposals(opts: { sort: ProposalSortLabel; q?: string; mine?: boolean; cursor?: string | null }) {
  const page = await api<Page>("/proposals", {
    query: { sort: PROPOSAL_SORTS[opts.sort], q: opts.q?.trim() || undefined, mine: opts.mine ? true : undefined, cursor: opts.cursor ?? undefined, limit: 100 },
  });
  return { items: page.items.map(toProposal), nextCursor: page.nextCursor };
}

export const fetchProposal = async (id: string) => toProposal(await api<Raw>(`/proposals/${encodeURIComponent(id)}`));

export const createProposal = (input: { title: string; body: string; dept: string; anonymous: boolean }) =>
  api<{ id: string | number; status?: string }>("/proposals", {
    method: "POST",
    body: { title: input.title, body: input.body, category: input.dept, anonymous: input.anonymous },
  });

export const recommendProposal = (id: string) =>
  api<{ recommended: boolean; recommendCount?: number; likes?: number }>(`/proposals/${encodeURIComponent(id)}/recommend`, { method: "POST" });

export const commentProposal = async (id: string, body: { text: string; anonymous: boolean }) =>
  toComment(await api<Raw>(`/proposals/${encodeURIComponent(id)}/comments`, { method: "POST", body }));

// 상태를 바꾸거나 답변을 단다. 답변을 달면 반려가 아닌 한 서버가 답변 완료로 바꾼다
export const manageProposal = (id: string, body: { status: string; answer?: string }) =>
  api(`/admin/proposals/${encodeURIComponent(id)}`, { method: "PATCH", body });
