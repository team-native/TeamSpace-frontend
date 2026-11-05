// 홈: GET /dashboard/home
import { api } from "./api";
import { toApproval, type Approval } from "./approvals";
import { toEvent, type CalEvent } from "./events";

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : v === undefined || v === null ? "" : String(v));

export type Todo = { id: string; title: string; category: string; dueDate: string; href: string; project: string; fromApproval: boolean };

export type HomeEvent = CalEvent & { needsReply: boolean };

export type Dashboard = {
  todoCount: number;
  todayTodoCount: number;
  unreadNotifications: number;
  receivedApprovalCount: number;
  todos: Todo[];
  approvals: Approval[];
  events: HomeEvent[];
};

function toTodo(t: Raw): Todo {
  const href = str(t.href);
  return {
    id: str(t.id),
    title: str(t.title) || "할 일",
    category: str(t.category) || "개인 업무",
    dueDate: str(t.dueDate),
    href: href.startsWith("/inhouse/") ? href : "",
    project: str(t.projectName),
    fromApproval: str(t.sourceType) === "approval" || str(t.id).startsWith("approval:"),
  };
}

// 홈 일정은 저장된 원본이 그대로 와서 내 응답은 rsvpByUser 에서 찾는다
function toHomeEvent(e: Raw, meId: string): HomeEvent {
  const base = toEvent(e);
  const replies = (e.rsvpByUser ?? {}) as Record<string, unknown>;
  const mine = replies[meId];
  const answered = !!(mine && (typeof mine === "string" || (typeof mine === "object" && (mine as Raw).rsvp)));
  return { ...base, needsReply: base.rsvp && !answered };
}

export async function fetchDashboard(meId: string): Promise<Dashboard> {
  const d = await api<Raw>("/dashboard/home");
  const s = (d.summary ?? {}) as Raw;
  const n = (k: string) => Number(s[k] ?? 0) || 0;
  return {
    todoCount: n("todoCount"),
    todayTodoCount: n("todayTodoCount"),
    unreadNotifications: n("unreadNotifications"),
    receivedApprovalCount: n("receivedApprovalCount"),
    todos: (Array.isArray(d.todos) ? d.todos : []).map((t) => toTodo(t as Raw)),
    approvals: (Array.isArray(d.approvals) ? d.approvals : []).map((a) => toApproval(a as Raw & { id: string })),
    events: (Array.isArray(d.events) ? d.events : []).map((e) => toHomeEvent(e as Raw, meId)),
  };
}
