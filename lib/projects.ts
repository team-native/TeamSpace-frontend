// 참여 프로젝트 · 내 공간: /me/projects · /projects/{id} · apply · /me/summary · /me/activity
import { api } from "./api";
import type { Tone } from "./demo";

const TONES: Tone[] = ["blue", "violet", "green", "orange", "red", "dark", ""];
type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : v === undefined || v === null ? "" : String(v));

export type Member = { key: string; role: string };
export type Opening = { role: string; title: string; headcount: number; detail: string };

export type Project = {
  id: string;
  name: string;
  desc: string;
  role: string;
  progress: number;
  status: string;
  tone: Tone;
  due: string;
  milestone: string;
  pm: string;
  members: Member[];
  openings: Opening[];
};

// 멤버: [key, role] · {id|name, role}
function toMember(m: unknown): Member | null {
  if (Array.isArray(m)) return m[0] === undefined ? null : { key: str(m[0]), role: str(m[1]) };
  if (typeof m === "string" || typeof m === "number") return { key: str(m), role: "" };
  const o = (m ?? {}) as Raw;
  const key = str(o.name ?? o.id ?? o.userId);
  return key ? { key, role: str(o.role ?? o.major) } : null;
}

// 모집 자리: ["역할", "1명 · 설명"] · {role|position, title, count|headcount|remaining, period, description|detail}
function toOpening(o: unknown): Opening | null {
  if (Array.isArray(o)) {
    const role = str(o[0]);
    if (!role) return null;
    const parts = str(o[1]).split(" · ");
    const n = parts[0]?.endsWith("명") ? parseInt(parts[0].replace(/\D/g, ""), 10) : NaN;
    return Number.isNaN(n)
      ? { role, title: role, headcount: 1, detail: str(o[1]) }
      : { role, title: role, headcount: n, detail: parts.slice(1).join(" · ") };
  }
  const r = (o ?? {}) as Raw;
  if (r.closed || ["모집 마감", "마감", "완료"].includes(str(r.status))) return null;
  // 서버 목록처럼 남은 인원(remaining)이 0이면 마감으로 본다
  if (r.remaining !== undefined && r.remaining !== null && !(parseInt(str(r.remaining), 10) > 0)) return null;
  const role = str(r.role ?? r.position);
  if (!role) return null;
  const count = [r.remaining, r.count, r.headcount].map((v) => parseInt(str(v), 10)).find((v) => v > 0);
  return {
    role,
    title: str(r.title) || role,
    headcount: count ?? 1,
    detail: [str(r.period), str(r.description ?? r.detail)].filter(Boolean).join(" · "),
  };
}

export function toProject(p: Raw): Project {
  const tone = str(p.tone) as Tone;
  const progress = Math.max(0, Math.min(100, Number(p.progress ?? 0) || 0));
  return {
    // 상세 주소는 slug 가 있으면 slug, 없으면 레코드 id (서버가 둘 다 받아 줌)
    id: str(p.slug) || str(p.id),
    name: str(p.name) || "이름 없는 프로젝트",
    desc: str(p.description ?? p.desc),
    role: str(p.role),
    progress,
    status: str(p.status) || "진행 중",
    tone: TONES.includes(tone) ? tone : "blue",
    due: str(p.due),
    milestone: str(p.nextMilestone ?? p.milestone),
    pm: str(p.pm),
    members: (Array.isArray(p.members) ? p.members : []).map(toMember).filter((m): m is Member => !!m),
    openings: (Array.isArray(p.openings) ? p.openings : []).map(toOpening).filter((o): o is Opening => !!o),
  };
}

type Page = { items: Raw[]; nextCursor: string | null };

export const fetchMyProjects = async () => (await api<Page>("/me/projects")).items.map(toProject);
export const fetchProject = async (id: string) => toProject(await api<Raw>(`/projects/${encodeURIComponent(id)}`));
export const applyProject = (id: string, body: { position: string; hours: string; note: string }) =>
  api<{ applicationId: string; status: string }>(`/projects/${encodeURIComponent(id)}/apply`, { method: "POST", body });

// ---- 내 공간 요약 · 활동 ----

export type Summary = {
  unreadNotifications: number;
  submittedApprovals: number;
  myPosts: number;
  myProposals: number;
  myInquiries: number;
  receivedApprovals: number;
};

export async function fetchSummary(): Promise<Summary> {
  const s = await api<Raw>("/me/summary");
  const n = (k: string) => Number(s[k] ?? 0) || 0;
  return {
    unreadNotifications: n("unreadNotifications"),
    submittedApprovals: n("submittedApprovals"),
    myPosts: n("myPosts"),
    myProposals: n("myProposals"),
    myInquiries: n("myInquiries"),
    receivedApprovals: n("receivedApprovals"),
  };
}

export type Activity = { id: string; kind: string; label: string; tone: Tone; title: string; href: string; at: string };

const KIND: Record<string, [string, Tone]> = {
  approval: ["결재", "blue"],
  post: ["게시글", ""],
  comment: ["댓글", ""],
  inquiry: ["문의", "violet"],
  proposal: ["제안", "violet"],
  todo: ["할 일", "green"],
  application: ["지원", "orange"],
  event_rsvp: ["일정", "orange"],
};

// 서버가 href 를 비워 주는 종류는 화면 주소를 직접 만든다
function activityHref(kind: string, id: string, href: string): string {
  if (href.startsWith("/inhouse/")) return href;
  switch (kind) {
    case "approval":
      return `/inhouse/requests/${id}`;
    case "post":
      return `/inhouse/community/${id}`;
    case "inquiry":
    case "proposal":
      return "/inhouse/community/inquiry?tab=mine";
    case "event_rsvp":
      return "/inhouse/my/calendar";
    case "application":
      return "/inhouse/my/projects";
    default:
      return "";
  }
}

export function toActivity(a: Raw): Activity {
  const kind = str(a.kind);
  const [label, tone] = KIND[kind] ?? ["활동", ""];
  const id = str(a.id);
  const title = kind === "comment" && a.postTitle ? `${str(a.postTitle)}에 댓글` : str(a.title) || "활동";
  return { id, kind, label, tone, title, href: activityHref(kind, id, str(a.href)), at: str(a.createdAt) };
}

export async function fetchActivity(cursor?: string | null) {
  const page = await api<Page>("/me/activity", { query: { cursor: cursor ?? undefined, limit: 20 } });
  return { items: page.items.map(toActivity), nextCursor: page.nextCursor };
}
