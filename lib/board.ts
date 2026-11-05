// 게시판: /posts · /posts/{id} · like · comments · report
import { api } from "./api";

export const WRITE_CATEGORIES = ["자유", "질문", "정보 공유", "모집", "칭찬", "제안", "팀 소식"] as const;
export const FILTER_CATEGORIES = ["전체", ...WRITE_CATEGORIES, "공지"] as const;
export const REPORT_REASONS = ["욕설·비하", "개인정보 노출", "도배·광고", "사실과 다른 내용", "기타"] as const;

export type Post = {
  id: string;
  category: string;
  title: string;
  body: string;
  author: string;
  anonymous: boolean;
  anonComments: boolean;
  views: number;
  likes: number;
  when: string;
  createdAt: string | null;
  pinned: boolean;
  mine: boolean;
  commentCount: number;
};

export type Comment = {
  id: string;
  postId: string;
  author: string;
  anonymous: boolean;
  text: string;
  when: string;
  likes: number;
  liked: boolean;
  replyTo: string | null;
  mine: boolean;
};

export type PostDetail = Post & { comments: Comment[] };

type ServerComment = {
  id: string | number;
  postId?: string;
  author?: string;
  anonymous?: boolean;
  text?: string;
  createdAt?: string | null;
  likes?: number;
  liked?: boolean;
  replyTo?: string | number | null;
  mine?: boolean;
};

type ServerPost = {
  id: string | number;
  category?: string;
  title?: string;
  body?: string;
  author?: string;
  anonymous?: boolean;
  anonComments?: boolean;
  views?: number;
  likes?: number;
  createdAt?: string | null;
  pinned?: boolean;
  mine?: boolean;
  commentCount?: number;
  comments?: ServerComment[];
};

export function relTime(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const min = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`;
  const days = Math.floor(min / (60 * 24));
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  const md = `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  return d.getFullYear() === now.getFullYear() ? md : `${d.getFullYear()}.${md}`;
}

export function toComment(c: ServerComment): Comment {
  const anonymous = !!c.anonymous;
  return {
    id: String(c.id),
    postId: String(c.postId ?? ""),
    // 서버는 익명 댓글에 작성자를 주지 않고, 익명 글의 글쓴이 댓글엔 "글쓴이"를 준다
    author: c.author || (anonymous ? "익명" : "알 수 없음"),
    anonymous,
    text: c.text ?? "",
    when: relTime(c.createdAt),
    likes: c.likes ?? 0,
    liked: !!c.liked,
    replyTo: c.replyTo == null || c.replyTo === "" ? null : String(c.replyTo),
    mine: !!c.mine,
  };
}

export function toPost(p: ServerPost): Post {
  const anonymous = !!p.anonymous;
  return {
    id: String(p.id),
    category: p.category || "자유",
    title: p.title ?? "",
    body: p.body ?? "",
    author: anonymous ? "익명" : p.author || "알 수 없음",
    anonymous,
    anonComments: !!p.anonComments,
    views: p.views ?? 0,
    likes: p.likes ?? 0,
    when: relTime(p.createdAt),
    createdAt: p.createdAt ?? null,
    pinned: !!p.pinned,
    mine: !!p.mine,
    commentCount: p.commentCount ?? p.comments?.length ?? 0,
  };
}

export const SORTS = { 최신순: "latest", 공감순: "likes", 댓글순: "comments" } as const;
export type SortLabel = keyof typeof SORTS;

type Page = { items: ServerPost[]; nextCursor: string | null };

export async function fetchPosts(opts: { category?: string; sort: SortLabel; q?: string; mine?: boolean; cursor?: string | null; limit?: number }) {
  const page = await api<Page>("/posts", {
    query: {
      category: opts.category && opts.category !== "전체" ? opts.category : undefined,
      sort: SORTS[opts.sort],
      q: opts.q?.trim() || undefined,
      mine: opts.mine ? true : undefined,
      cursor: opts.cursor ?? undefined,
      limit: opts.limit ?? 20,
    },
  });
  return { items: page.items.map(toPost), nextCursor: page.nextCursor };
}

export async function fetchPost(id: string): Promise<PostDetail> {
  const p = await api<ServerPost>(`/posts/${encodeURIComponent(id)}`);
  return { ...toPost(p), comments: (p.comments ?? []).map(toComment) };
}

export type PostInput = { category: string; title: string; body: string; anonymous: boolean; anonComments: boolean };

export async function createPost(input: PostInput) {
  return api<{ id: string }>("/posts", { method: "POST", body: { ...input, status: "published" } });
}

export async function updatePost(id: string, input: Partial<PostInput>) {
  return api<{ id: string }>(`/posts/${encodeURIComponent(id)}`, { method: "PATCH", body: input });
}

export const deletePost = (id: string) => api(`/posts/${encodeURIComponent(id)}`, { method: "DELETE" });

export const likePost = (id: string) => api<{ liked: boolean; likes: number }>(`/posts/${encodeURIComponent(id)}/like`, { method: "POST" });

export async function addComment(postId: string, body: { text: string; anonymous: boolean; replyTo?: string | null }) {
  const c = await api<ServerComment>(`/posts/${encodeURIComponent(postId)}/comments`, {
    method: "POST",
    body: { text: body.text, anonymous: body.anonymous, replyTo: body.replyTo ?? null },
  });
  return toComment(c);
}

export const likeComment = (postId: string, commentId: string) =>
  api<{ liked: boolean; likes: number }>(`/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/like`, { method: "POST" });

export const reportPost = (postId: string, reason: string, detail = "") =>
  api<{ id: string; status: string }>(`/posts/${encodeURIComponent(postId)}/report`, { method: "POST", body: { reason, detail } });
