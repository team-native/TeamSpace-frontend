// 일정: GET /events?month · /events/{id} · rsvp · reminders
import { api } from "./api";
import type { Tone } from "./demo";

export const RSVP_OPTIONS = ["참석", "불참", "미정"] as const;
export type RsvpAnswer = (typeof RSVP_OPTIONS)[number];
export const SCOPES = ["전체", "팀", "프로젝트", "개인"] as const;
export const SCOPE_TONE: Record<string, Tone> = { 팀: "blue", 프로젝트: "violet", 개인: "green" };

export type CalEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  day: number;
  start: string;
  end: string;
  scope: string;
  tone: Tone;
  place: string;
  host: string;
  agenda: string;
  audience: string;
  rsvp: boolean;
  myRsvp: RsvpAnswer | "";
  rsvpCount: number;
};

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : v === undefined || v === null ? "" : String(v));

export function toEvent(e: Raw): CalEvent {
  const date = str(e.date).slice(0, 10);
  const scope = str(e.scope ?? e.kind) || "팀";
  const my = str(e.myRsvp);
  return {
    id: str(e.id),
    title: str(e.title) || "제목 없는 일정",
    date,
    day: Number(date.slice(8, 10)) || 0,
    start: str(e.start ?? e.time),
    end: str(e.end),
    scope,
    tone: SCOPE_TONE[scope] ?? "orange",
    place: str(e.place),
    host: str(e.host),
    agenda: str(e.agenda),
    audience: str(e.audience ?? e.target),
    rsvp: !!e.rsvp,
    myRsvp: (RSVP_OPTIONS as readonly string[]).includes(my) ? (my as RsvpAnswer) : "",
    rsvpCount: Number(e.rsvpCount ?? 0) || 0,
  };
}

export const monthKey = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}`;

export async function fetchEvents(month: string, scope = "전체"): Promise<CalEvent[]> {
  const all: CalEvent[] = [];
  let cursor: string | null = null;
  // 한 달 일정은 많아도 몇백 개라서 최대 5페이지까지만
  for (let i = 0; i < 5; i++) {
    const page: { items: Raw[]; nextCursor: string | null } = await api("/events", {
      query: { month, scope: scope === "전체" ? undefined : scope, cursor: cursor ?? undefined, limit: 200 },
    });
    all.push(...page.items.map(toEvent));
    cursor = page.nextCursor;
    if (!cursor) break;
  }
  return all;
}

export const sendRsvp = (id: string, rsvp: RsvpAnswer, reason?: string) =>
  api<{ eventId: string; rsvp: RsvpAnswer; respondedAt: string }>(`/events/${encodeURIComponent(id)}/rsvp`, {
    method: "POST",
    body: { rsvp, reason: reason?.trim() || null },
  });

export type Reminders = { oneDayBefore: boolean; oneHourBefore: boolean; tenMinutesBefore: boolean };
export const REMINDER_LABELS: [keyof Reminders, string][] = [
  ["oneDayBefore", "하루 전"],
  ["oneHourBefore", "1시간 전"],
  ["tenMinutesBefore", "10분 전"],
];

export const fetchReminders = (id: string) => api<Reminders>(`/events/${encodeURIComponent(id)}/reminders`);
export const saveReminders = (id: string, patch: Partial<Reminders>) =>
  api<Reminders>(`/events/${encodeURIComponent(id)}/reminders`, { method: "PATCH", body: patch });

export function whenText(e: CalEvent): string {
  const md = e.date ? `${e.date.slice(5, 7)}.${e.date.slice(8, 10)}` : "";
  if (!e.start) return `${md} 종일`;
  return `${md} ${e.start}${e.end ? ` – ${e.end}` : ""}`;
}
