// 운영 관리: /admin/inquiries · /admin/reports · 공지 미확인자 · 입금 대기
import { api, ApiError } from "./api";
import { toInquiry, type Inquiry } from "./inquiries";
import { fetchPost, type PostDetail } from "./board";
import { fetchReceipts, type ReceiptRow } from "./finance";
import { fetchNotices, type Notice } from "./notices";

type Raw = Record<string, unknown>;
type Page = { items: Raw[]; nextCursor: string | null };
const str = (v: unknown) => (typeof v === "string" ? v : v === undefined || v === null ? "" : String(v));

// 권한이 없는 카드는 숫자 대신 '권한 없음'으로 보여주려고 403 은 null 로 바꾼다
export async function orForbidden<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof ApiError && e.status === 403) return null;
    throw e;
  }
}

// ---- 문의 ----

export async function fetchAdminInquiries(status?: string, max = 200): Promise<Inquiry[]> {
  const all: Inquiry[] = [];
  let cursor: string | null = null;
  do {
    const page: Page = await api<Page>("/admin/inquiries", { query: { status, cursor: cursor ?? undefined, limit: 100 } });
    all.push(...page.items.map((q) => toInquiry(q as Parameters<typeof toInquiry>[0])));
    cursor = page.nextCursor;
  } while (cursor && all.length < max);
  return all;
}

// 답변이 필요한 문의 = 접수 + 검토 중
export async function fetchWaitingInquiries(): Promise<Inquiry[]> {
  const [a, b] = await Promise.all([fetchAdminInquiries("접수"), fetchAdminInquiries("검토 중")]);
  return [...a, ...b].sort((x, y) => (x.steps[0] || "").localeCompare(y.steps[0] || ""));
}

// ---- 신고 ----

export const REPORT_DECISIONS = ["숨김", "삭제", "반려"] as const;
export type ReportDecision = (typeof REPORT_DECISIONS)[number];

export type Report = {
  id: string;
  postId: string;
  reason: string;
  detail: string;
  status: string;
  handledBy: string;
  handledAt: string;
  note: string;
  createdAt: string;
};

export function toReport(r: Raw): Report {
  return {
    id: str(r.id),
    postId: str(r.postId),
    reason: str(r.reason) || "기타",
    detail: str(r.detail),
    status: str(r.status) || "PENDING",
    handledBy: str(r.handledBy),
    handledAt: str(r.handledAt),
    note: str(r.note),
    createdAt: str(r.createdAt),
  };
}

export async function fetchReports(status: string, limit = 100): Promise<Report[]> {
  const page = await api<Page>("/admin/reports", { query: { status, limit } });
  return page.items.map(toReport);
}

// 같은 글에 들어온 신고는 한 건으로 묶는다
export type ReportGroup = { postId: string; reports: Report[]; reasons: string[] };
export function groupReports(list: Report[]): ReportGroup[] {
  const map = new Map<string, Report[]>();
  for (const r of list) map.set(r.postId, [...(map.get(r.postId) ?? []), r]);
  return [...map.entries()]
    .map(([postId, reports]) => ({ postId, reports, reasons: [...new Set(reports.map((r) => r.reason))] }))
    .sort((a, b) => b.reports.length - a.reports.length);
}

// 처리 기록: 서버가 상태별로만 걸러 줘서 세 번 나눠 받는다
export async function fetchHandledReports(limit = 10): Promise<Report[]> {
  const lists = await Promise.all(REPORT_DECISIONS.map((s) => fetchReports(s, limit)));
  return lists.flat().sort((a, b) => b.handledAt.localeCompare(a.handledAt)).slice(0, limit);
}

export const decideReport = (id: string, decision: ReportDecision, note = "") =>
  api<{ id: string; status: string }>(`/admin/reports/${encodeURIComponent(id)}/decision`, { method: "POST", body: { decision, note } });

// 이미 숨긴 글은 작성자만 열 수 있어 404 가 날 수 있다
export async function fetchReportedPost(postId: string): Promise<PostDetail | null> {
  try {
    return await fetchPost(postId);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

// ---- 필독 공지 확인 · 입금 대기 ----

export async function fetchMustReadNotices(): Promise<Notice[]> {
  return (await fetchNotices("필독")).items;
}

export type Unconfirmed = { id: string; name: string; email: string };
export async function fetchUnconfirmed(noticeId: string): Promise<Unconfirmed[]> {
  const page = await api<Page>(`/admin/notices/${encodeURIComponent(noticeId)}/unconfirmed`);
  return page.items.map((p) => ({ id: str(p.id), name: str(p.name) || "이름 없음", email: str(p.email) }));
}

// 최근 6개월 수금 중 입금 대기
export async function fetchPendingIncome(): Promise<ReceiptRow[]> {
  const d = new Date();
  const to = d.toISOString().slice(0, 10);
  d.setMonth(d.getMonth() - 6);
  const from = d.toISOString().slice(0, 10);
  const { rows } = await fetchReceipts(from, to);
  return rows.filter((r) => r.status === "입금 대기" || r.status === "청구 완료");
}

// 메뉴 숫자: 실패하거나 권한이 없으면 숫자를 빼고 보여준다
export async function fetchAdminCounts(): Promise<{ inquiries?: number; reports?: number; income?: number; signups?: number }> {
  const [q, r, i, s] = await Promise.allSettled([fetchWaitingInquiries(), fetchReports("PENDING"), fetchPendingIncome(), fetchSignupRequests()]);
  return {
    inquiries: q.status === "fulfilled" ? q.value.length : undefined,
    reports: r.status === "fulfilled" ? groupReports(r.value).length : undefined,
    income: i.status === "fulfilled" ? i.value.length : undefined,
    signups: s.status === "fulfilled" ? s.value.filter((x) => x.status === "PENDING").length : undefined,
  };
}

export const answerInquiry = (id: string, text: string) =>
  api<{ id: string; status: string; answer: { who: string; at: string; text: string } }>(`/admin/inquiries/${encodeURIComponent(id)}/answer`, {
    method: "POST",
    body: { text },
  });

export const setInquiryStatus = (id: string, status: string) =>
  api<{ id: string; status: string }>(`/admin/inquiries/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } });

// ---- 공지 작성 · 수정 ----

export type NoticeInput = {
  kind: string;
  title: string;
  body: string;
  pinned: boolean;
  mustRead: boolean;
  status: "PUBLISHED" | "SCHEDULED" | "DRAFT";
  publishAt: string | null;
  sendPush: boolean;
  attachments: string[];
  linkedDocuments: { slug: string; title: string }[];
};

export const createNotice = (input: NoticeInput) => api<{ id: string }>("/admin/notices", { method: "POST", body: input });
export const updateNotice = (id: string, input: Partial<NoticeInput>) =>
  api<{ id: string }>(`/admin/notices/${encodeURIComponent(id)}`, { method: "PATCH", body: input });

// ---- 재정 권한 (Admin만) ----

export type FinanceMember = { id: string; name: string; email: string; roles: string[]; canView: boolean };

export async function fetchFinancePermissions(): Promise<FinanceMember[]> {
  const page = await api<Page>("/admin/finance/permissions");
  return page.items.map((p) => ({
    id: str(p.id),
    name: str(p.name) || "이름 없음",
    email: str(p.email),
    roles: Array.isArray(p.roles) ? p.roles.map(str) : [],
    canView: !!p.canViewFinance,
  }));
}

// 켜면 FA 역할을 주고, 끄면 FA 만 뺀다 (Admin · Leader 는 그대로 열람 가능)
export const setFinancePermission = (userId: string, canViewFinance: boolean) =>
  api<{ id: string; roles: string[]; canViewFinance: boolean }>(`/admin/finance/permissions/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: { canViewFinance },
  });

// ---- 가입 요청 ----

export type SignupRequest = {
  id: string;
  email: string;
  name: string;
  dept: string;
  major: string;
  cohort: string;
  message: string;
  status: string; // PENDING · APPROVED · REJECTED
  createdAt: string;
};

export async function fetchSignupRequests(max = 300): Promise<SignupRequest[]> {
  const all: SignupRequest[] = [];
  let cursor: string | null = null;
  do {
    const page: Page = await api<Page>("/admin/signup-requests", { query: { cursor: cursor ?? undefined, limit: 100 } });
    all.push(
      ...page.items.map((r) => ({
        id: str(r.id),
        email: str(r.email),
        name: str(r.name),
        dept: str(r.dept),
        major: str(r.major),
        cohort: str(r.cohort),
        message: str(r.message),
        status: str(r.status).toUpperCase() || "PENDING",
        createdAt: str(r.createdAt),
      })),
    );
    cursor = page.nextCursor;
  } while (cursor && all.length < max);
  return all;
}

export const approveSignupRequest = (id: string) =>
  api<Raw>(`/admin/signup-requests/${encodeURIComponent(id)}/approve`, { method: "POST", body: {} });
