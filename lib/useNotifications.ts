"use client";

import { useCallback, useEffect, useState } from "react";
import { NOTIFICATIONS, loadLocal, saveLocal, type Noti } from "./demo";

const KEY = "native-inhouse-notifications";
const EVENT = "native-inhouse:notifications";

type Saved = { read: string[]; done: string[] };

// 헤더 벨과 알림 페이지가 같은 읽음 상태를 보도록 저장소 + 이벤트로 동기화
export function useNotifications() {
  const [saved, setSaved] = useState<Saved>({ read: [], done: [] });

  useEffect(() => {
    const sync = () => setSaved(loadLocal<Saved>(KEY, { read: [], done: [] }));
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const update = useCallback((next: Saved) => {
    saveLocal(KEY, next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const items: Noti[] = NOTIFICATIONS.map((n) => ({
    ...n,
    unread: n.unread && !saved.read.includes(n.id),
    action: n.action && !saved.done.includes(n.id),
  }));

  return {
    items,
    unreadCount: items.filter((n) => n.unread).length,
    markRead: (id: string) => update({ ...saved, read: [...new Set([...saved.read, id])] }),
    markAllRead: () => update({ ...saved, read: NOTIFICATIONS.map((n) => n.id) }),
    later: (id: string) => update({ read: [...new Set([...saved.read, id])], done: [...saved.done, id] }),
  };
}
