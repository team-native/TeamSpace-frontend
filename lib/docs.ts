// 문서함: GET /docs · /docs/{slug} · /docs/{slug}/history · POST /docs/{slug}/read
import { api, toAttachment, type Attachment } from "./api";

export type DocType = "RULE" | "FINANCE" | "TEMPLATE" | "GUIDE";
export type DocLine = { text: string; was?: string; now?: string; after?: string };
export type DocSection = { title: string; revised?: boolean; lines: DocLine[] };

export type DocItem = {
  slug: string;
  category: string;
  type: DocType | string;
  title: string;
  copy: string;
  date: string;
  version: string;
  effective: string;
  owner: string;
  revised: boolean;
  read: boolean;
  readAt: string;
  approvalTypes: string[];
  usageThisMonth: number;
};

export type DocDetail = DocItem & {
  sections: DocSection[];
  fields: [string, string][];
  file: Attachment | null;
};

export type DocVersion = { ver: string; date: string; who: string; note: string };

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : v === undefined || v === null ? "" : String(v));

// "2026-10-22T..." 같은 값은 2026.10.22 로, 이미 점으로 된 날짜는 그대로
export function docDate(v: unknown): string {
  const s = str(v);
  if (!s) return "";
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : s;
}

export function toDocItem(d: Raw): DocItem {
  return {
    slug: str(d.slug),
    category: str(d.category) || "기타",
    type: str(d.type).toUpperCase() || "GUIDE",
    title: str(d.title) || "제목 없는 문서",
    copy: str(d.copy),
    date: docDate(d.date),
    version: str(d.version),
    effective: docDate(d.effective),
    owner: str(d.owner),
    revised: !!d.revised,
    read: !!d.read,
    readAt: str(d.readAt),
    approvalTypes: Array.isArray(d.approvalTypes) ? d.approvalTypes.map(str) : [],
    usageThisMonth: Number(d.usageThisMonth ?? 0) || 0,
  };
}

// 본문은 관리자가 넣은 그대로 내려와서 문자열 · {text} · {title, lines|body} 모두 받아 준다
function toLine(l: unknown): DocLine {
  if (typeof l === "string") return { text: l };
  const o = (l ?? {}) as Raw;
  return { text: str(o.text), was: o.was ? str(o.was) : undefined, now: o.now ? str(o.now) : undefined, after: o.after ? str(o.after) : undefined };
}

function toSections(d: Raw): DocSection[] {
  const raw = Array.isArray(d.sections) ? d.sections : [];
  const sections = raw.map((s: unknown, i: number) => {
    if (typeof s === "string") return { title: `${i + 1}`, lines: [{ text: s }] };
    const o = (s ?? {}) as Raw;
    const lines = Array.isArray(o.lines) ? o.lines.map(toLine) : str(o.body ?? o.text).split("\n").filter(Boolean).map((text) => ({ text }));
    return { title: str(o.title) || `${i + 1}`, revised: !!o.revised, lines };
  });
  if (sections.length) return sections;
  const body = str(d.body ?? d.content);
  if (body) return [{ title: "본문", lines: body.split("\n").filter(Boolean).map((text) => ({ text })) }];
  return d.copy ? [{ title: "본문", lines: [{ text: str(d.copy) }] }] : [];
}

// 템플릿 항목: [이름, 안내] · {label|name|title, hint|placeholder|description} · "이름"
function toFields(v: unknown): [string, string][] {
  if (!Array.isArray(v)) return [];
  return v
    .map((f): [string, string] => {
      if (Array.isArray(f)) return [str(f[0]), str(f[1])];
      if (typeof f === "string") return [f, ""];
      const o = (f ?? {}) as Raw;
      return [str(o.label ?? o.name ?? o.title ?? o.key), str(o.hint ?? o.placeholder ?? o.description ?? o.value)];
    })
    .filter(([k]) => !!k);
}

export function toDocDetail(d: Raw): DocDetail {
  const fileId = str(d.fileId) || str(d.downloadUrl).replace(/^.*\/uploads\//, "");
  return {
    ...toDocItem(d),
    sections: toSections(d),
    fields: toFields(d.fields),
    file: fileId ? toAttachment({ id: fileId, name: str(d.fileName ?? d.filename) || `${str(d.title) || "양식"} 원본` }) : null,
  };
}

type Page<T> = { items: T[]; nextCursor: string | null };

// 문서 수가 많지 않아서 분류 숫자를 위해 한 번에 받는다
export async function fetchDocs(max = 300): Promise<DocItem[]> {
  const all: DocItem[] = [];
  let cursor: string | null = null;
  do {
    const page: Page<Raw> = await api<Page<Raw>>("/docs", { query: { cursor: cursor ?? undefined, limit: 100 } });
    all.push(...page.items.map(toDocItem));
    cursor = page.nextCursor;
  } while (cursor && all.length < max);
  return all;
}

export const fetchDoc = async (slug: string, version?: string) =>
  toDocDetail(await api<Raw>(`/docs/${encodeURIComponent(slug)}`, { query: { version } }));

export async function fetchDocHistory(slug: string): Promise<DocVersion[]> {
  const page = await api<Page<Raw>>(`/docs/${encodeURIComponent(slug)}/history`, { query: { limit: 100 } });
  return page.items.map((v) => ({ ver: str(v.ver), date: docDate(v.date), who: str(v.who), note: str(v.note) }));
}

export const markDocRead = (slug: string) =>
  api<{ read: boolean; readAt: string; confirmed: number }>(`/docs/${encodeURIComponent(slug)}/read`, { method: "POST" });

export const TYPE_LABEL: Record<string, string> = { RULE: "규칙", FINANCE: "재무", TEMPLATE: "템플릿", GUIDE: "가이드" };

// ---- 관리자: 등록 · 개정 (POST /admin/docs, Admin만) ----

export type DocInput = {
  slug: string;
  title: string;
  category: string;
  type: string;
  copy: string;
  sections: DocSection[];
  note: string;
  effective: string;
  notify: boolean;
  version?: string;
};

export const saveDoc = (input: DocInput) =>
  api<{ slug: string; version?: string }>("/admin/docs", { method: "POST", body: input });

// 줄 단위로 앞뒤 같은 부분을 빼고 바뀐 가운데만 was → now 로 표시한다
export function diffLines(before: string, after: string): { lines: DocLine[]; changed: boolean } {
  const a = before.split("\n");
  const b = after.split("\n").filter((l, i, all) => l.trim() || i < all.length - 1);
  let changed = false;
  const lines = b.map((now, i): DocLine => {
    const was = a[i];
    if (was === undefined) {
      changed = true;
      return { text: "", was: "", now };
    }
    if (was === now) return { text: now };
    changed = true;
    let p = 0;
    while (p < was.length && p < now.length && was[p] === now[p]) p++;
    let s = 0;
    while (s < was.length - p && s < now.length - p && was[was.length - 1 - s] === now[now.length - 1 - s]) s++;
    return { text: now.slice(0, p), was: was.slice(p, was.length - s), now: now.slice(p, now.length - s), after: now.slice(now.length - s) };
  });
  if (a.length > b.length) changed = true;
  return { lines, changed };
}

// 화면에 보이는 현재 본문 (개정 표시가 있으면 바뀐 뒤 글자로)
export const sectionText = (s: DocSection) => s.lines.map((l) => (l.now !== undefined ? `${l.text}${l.now}${l.after ?? ""}` : l.text)).join("\n");
