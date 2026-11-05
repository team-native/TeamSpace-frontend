// 공지: GET /notices · GET /notices/{id} · POST /notices/{id}/confirm
import { api, toAttachments, type Attachment } from "./api";
import type { Tone } from "./demo";

export const NOTICE_FILTERS = ["전체", "필독", "제도", "일정", "일반"] as const;
export type NoticeFilter = (typeof NOTICE_FILTERS)[number];

const KIND_TONE: Record<string, Tone> = { 필독: "red", 제도: "orange", 일정: "violet", 일반: "" };
export const kindTone = (kind: string): Tone => KIND_TONE[kind] ?? "blue";

export type Notice = {
  id: string;
  kind: string;
  tone: Tone;
  title: string;
  body: string;
  author: string;
  date: string;
  pinned: boolean;
  mustRead: boolean;
  confirmed: number;
  total: number;
  confirmedByMe: boolean;
  views: number;
  related: [string, string][];
  attachments: Attachment[];
};

type ServerNotice = {
  id: string | number;
  kind?: string;
  title?: string;
  body?: string;
  author?: string;
  authorRole?: string;
  createdAt?: string | null;
  publishedAt?: string | null;
  publishAt?: string | null;
  pinned?: boolean;
  mustRead?: boolean;
  confirmed?: number;
  total?: number;
  confirmedByMe?: boolean;
  views?: number;
  linkedDocuments?: unknown;
  attachments?: unknown;
};

export function noticeDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// 관련 문서는 문자열(slug) 또는 {slug|id, title} 로 올 수 있다
function related(list: unknown): [string, string][] {
  if (!Array.isArray(list)) return [];
  return list
    .map((x): [string, string] | null => {
      if (typeof x === "string") return x ? [x, x] : null;
      if (x && typeof x === "object") {
        const o = x as { slug?: string; id?: string | number; title?: string; name?: string };
        const slug = o.slug ?? (o.id !== undefined ? String(o.id) : "");
        return slug ? [slug, o.title || o.name || slug] : null;
      }
      return null;
    })
    .filter(Boolean) as [string, string][];
}

export function toNotice(n: ServerNotice): Notice {
  const mustRead = !!n.mustRead || n.kind === "필독";
  const kind = n.kind || "일반";
  return {
    id: String(n.id),
    kind,
    tone: kindTone(kind),
    title: n.title ?? "",
    body: n.body ?? "",
    author: [n.authorRole && n.authorRole !== "Member" ? n.authorRole : "", n.author].filter(Boolean).join(" ") || "운영진",
    date: noticeDate(n.publishedAt ?? n.publishAt ?? n.createdAt),
    pinned: !!n.pinned,
    mustRead,
    confirmed: n.confirmed ?? 0,
    total: n.total ?? 0,
    confirmedByMe: !!n.confirmedByMe,
    views: n.views ?? 0,
    related: related(n.linkedDocuments),
    attachments: toAttachments(n.attachments),
  };
}

type Page = { items: ServerNotice[]; nextCursor: string | null };

export async function fetchNotices(filter: NoticeFilter, cursor?: string | null) {
  const page = await api<Page>("/notices", {
    query: {
      kind: filter === "전체" || filter === "필독" ? undefined : filter,
      mustRead: filter === "필독" ? true : undefined,
      cursor: cursor ?? undefined,
      limit: 20,
    },
  });
  return { items: page.items.map(toNotice), nextCursor: page.nextCursor };
}

export const fetchNotice = async (id: string) => toNotice(await api<ServerNotice>(`/notices/${encodeURIComponent(id)}`));

export const confirmNotice = (id: string) =>
  api<{ id: string; confirmedByMe: boolean; confirmed: number }>(`/notices/${encodeURIComponent(id)}/confirm`, { method: "POST" });
