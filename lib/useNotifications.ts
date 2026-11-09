"use client";

// 알림: GET /notifications · POST /notifications/read
// 헤더 벨과 알림 화면이 같은 목록 · 읽음 상태를 보도록 한곳에서 불러 나눠 쓴다
import { useCallback, useEffect, useState } from "react";
import { api, hasSession } from "./api";
import { loadLocal, saveLocal, type NotiKind, type Tone } from "./shared";

export type NotiWhen = "오늘" | "이번 주" | "이전";
export type Noti = {
  id: string;
  kind: NotiKind;
  ico: string;
  tone: Tone;
  title: string;
  meta: string;
  when: NotiWhen;
  href: string;
  unread: boolean;
  action: boolean;
};

type ServerNoti = {
  id: string;
  kind?: string;
  title?: string;
  message?: string;
  meta?: string;
  href?: string;
  unread?: boolean;
  action?: boolean;
  createdAt?: string | null;
};
type Page = { items: ServerNoti[]; nextCursor: string | null };

const KINDS: NotiKind[] = ["내 업무", "재정", "일정", "공지"];
const LOOK: Record<NotiKind, [string, Tone]> = {
  "내 업무": ["결", "blue"],
  재정: ["₩", "green"],
  일정: ["일", "orange"],
  공지: ["공", "violet"],
};
const DONE_KEY = "native-inhouse-notifications-later";
const PAGE = 30;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

function ago(date: Date, now: Date): string {
  const min = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  if (min < 60 * 24 && startOfDay(date) === startOfDay(now)) return `${Math.floor(min / 60)}시간 전`;
  return `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")}`;
}

export function toNoti(s: ServerNoti, now = new Date()): Noti {
  const kind = (KINDS as string[]).includes(s.kind ?? "") ? (s.kind as NotiKind) : "공지";
  const [ico, tone] = LOOK[kind];
  const created = s.createdAt ? new Date(s.createdAt) : null;
  const valid = created && !Number.isNaN(created.getTime());
  const days = valid ? (startOfDay(now) - startOfDay(created)) / 86400000 : 99;
  const title = s.title || "알림";
  const body = s.message || s.meta || "";
  return {
    id: String(s.id),
    kind,
    ico,
    tone,
    title,
    meta: [body !== title ? body : "", valid ? ago(created, now) : ""].filter(Boolean).join(" · "),
    when: days <= 0 ? "오늘" : days < 7 ? "이번 주" : "이전",
    // 서버가 웹 주소(/inhouse/...)를 준다. 다른 값이면 알림 화면에 머문다
    href: s.href?.startsWith("/inhouse") ? s.href : "/inhouse/notifications",
    unread: s.unread !== false,
    action: !!s.action,
  };
}

type Store = { items: Noti[]; nextCursor: string | null; unreadCount: number; unreadMore: boolean; loading: boolean; error: string; loaded: boolean };
let store: Store = { items: [], nextCursor: null, unreadCount: 0, unreadMore: false, loading: false, error: "", loaded: false };
const listeners = new Set<(s: Store) => void>();
const emit = (next: Partial<Store>) => {
  store = { ...store, ...next };
  listeners.forEach((l) => l(store));
};

let inflight: Promise<void> | null = null;
async function refresh() {
  if (!hasSession()) return;
  inflight ??= (async () => {
    emit({ loading: true, error: "" });
    try {
      const [page, unread] = await Promise.all([
        api<Page>("/notifications", { query: { limit: PAGE } }),
        api<Page>("/notifications", { query: { unread: true, limit: 100 } }),
      ]);
      emit({
        items: page.items.map((s) => toNoti(s)),
        nextCursor: page.nextCursor,
        unreadCount: unread.items.length,
        unreadMore: !!unread.nextCursor,
        loaded: true,
      });
    } catch (e) {
      emit({ error: e instanceof Error ? e.message : "알림을 불러오지 못했어요." });
    } finally {
      emit({ loading: false });
      inflight = null;
    }
  })();
  return inflight;
}

async function loadMore() {
  if (!store.nextCursor || store.loading) return;
  emit({ loading: true });
  try {
    const page = await api<Page>("/notifications", { query: { limit: PAGE, cursor: store.nextCursor } });
    const seen = new Set(store.items.map((n) => n.id));
    emit({ items: [...store.items, ...page.items.map((s) => toNoti(s)).filter((n) => !seen.has(n.id))], nextCursor: page.nextCursor });
  } catch (e) {
    emit({ error: e instanceof Error ? e.message : "알림을 더 불러오지 못했어요." });
  } finally {
    emit({ loading: false });
  }
}

async function read(body: { id: string } | { all: true }) {
  // 화면은 먼저 바꾸고, 실패하면 서버 상태로 다시 맞춘다
  const before = store;
  const ids = "id" in body ? [body.id] : store.items.map((n) => n.id);
  const changed = store.items.filter((n) => n.unread && ids.includes(n.id)).length;
  emit({
    items: store.items.map((n) => (ids.includes(n.id) ? { ...n, unread: false } : n)),
    unreadCount: "all" in body ? 0 : Math.max(0, store.unreadCount - changed),
    unreadMore: "all" in body ? false : store.unreadMore,
  });
  if (changed === 0 && "id" in body) return;
  try {
    await api("/notifications/read", { method: "POST", body });
  } catch (e) {
    emit({ ...before, error: e instanceof Error ? e.message : "읽음 처리를 못 했어요." });
  }
}

export function useNotifications() {
  const [s, setS] = useState(store);
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    listeners.add(setS);
    setS(store);
    setDone(loadLocal<string[]>(DONE_KEY, []));
    if (!store.loaded) void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      listeners.delete(setS);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const later = useCallback((id: string) => {
    const next = [...new Set([...loadLocal<string[]>(DONE_KEY, []), id])].slice(-200);
    saveLocal(DONE_KEY, next);
    setDone(next);
    void read({ id });
  }, []);

  const items = s.items.map((n) => (n.action && done.includes(n.id) ? { ...n, action: false } : n));
  return {
    items,
    unreadCount: s.unreadCount,
    unreadLabel: s.unreadMore ? "99+" : String(s.unreadCount),
    loading: s.loading,
    loaded: s.loaded,
    error: s.error,
    hasMore: !!s.nextCursor,
    loadMore,
    reload: refresh,
    markRead: (id: string) => void read({ id }),
    markAllRead: () => void read({ all: true }),
    later,
  };
}
