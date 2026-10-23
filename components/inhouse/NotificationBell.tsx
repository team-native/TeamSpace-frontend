"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useNotifications } from "@/lib/useNotifications";
import { useOutside } from "./ui";

export default function NotificationBell() {
  const router = useRouter();
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const ref = useOutside<HTMLDivElement>(open, () => setOpen(false));

  useEffect(() => {
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, [open]);

  return (
    <div className="pf-bell-wrap wd-scope" ref={ref}>
      <button
        type="button"
        className={`wd-bell ${open ? "on" : ""}`}
        aria-label={`알림 ${unreadCount}개`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && <b>{unreadCount}</b>}
      </button>
      {open && (
        <div className="wd-pop pf-bell-pop" role="dialog" aria-label="알림">
          <div className="wd-between" style={{ padding: "18px 18px 12px" }}>
            <b style={{ fontSize: 14 }}>알림</b>
            <button type="button" className="wd-link" style={{ border: 0, background: "none" }} onClick={markAllRead}>
              모두 읽음
            </button>
          </div>
          {permission === "default" && (
            <div className="wd-banner" style={{ margin: "0 12px 8px", padding: "12px 14px", borderRadius: 13 }}>
              <span className="ico" style={{ width: 28, height: 28, fontSize: 12 }}>!</span>
              <div>
                <b style={{ fontSize: 11 }}>브라우저 알림 켜기</b>
                <p style={{ fontSize: 9 }}>탭을 닫아도 결재·공지를 바로 받아요</p>
              </div>
              <button
                type="button"
                className="wd-btn blue sm"
                onClick={async () => setPermission(await Notification.requestPermission())}
              >
                허용
              </button>
            </div>
          )}
          <div className="wd-list" style={{ maxHeight: 330, overflow: "auto" }}>
            {items.slice(0, 5).map((n) => (
              <button
                type="button"
                key={n.id}
                className={`wd-li link ${n.unread ? "unread" : ""}`}
                style={{ padding: "12px 16px", gridTemplateColumns: "auto 1fr", border: 0, borderBottom: "1px solid #e5e8eb", textAlign: "left", background: n.unread ? undefined : "#fff" }}
                onClick={() => {
                  markRead(n.id);
                  setOpen(false);
                  router.push(n.href);
                }}
              >
                <span className={`ico ${n.tone}`} style={{ width: 30, height: 30, fontSize: 10 }}>{n.ico}</span>
                <div>
                  <b style={{ fontSize: 11 }}>{n.title}</b>
                  <p>{n.meta}</p>
                </div>
              </button>
            ))}
          </div>
          <Link href="/inhouse/notifications" onClick={() => setOpen(false)} style={{ display: "block", padding: 12, textAlign: "center" }}>
            <span className="wd-t10 wd-muted" style={{ fontWeight: 650 }}>알림 전체 보기 →</span>
          </Link>
        </div>
      )}
    </div>
  );
}
