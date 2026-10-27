"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import WdPage from "@/components/inhouse/WdPage";
import { Eyebrow } from "@/components/inhouse/ui";
import type { Noti, NotiKind } from "@/lib/demo";
import { useNotifications } from "@/lib/useNotifications";
import EmptyState from "@/components/inhouse/EmptyState";

const TABS: ("전체" | NotiKind)[] = ["전체", "내 업무", "재정", "일정", "공지"];

export default function NotificationsPage() {
  const router = useRouter();
  const { items, unreadCount, markRead, markAllRead, later } = useNotifications();
  const [tab, setTab] = useState<(typeof TABS)[number]>("전체");
  const shown = items.filter((n) => tab === "전체" || n.kind === tab);

  const open = (n: Noti) => {
    markRead(n.id);
    router.push(n.href);
  };

  return (
    <WdPage>
      <div className="wd-narrow wd-pb">
        <section className="wd-hero sm">
          <div>
            <Eyebrow>NOTIFICATIONS</Eyebrow>
            <h1>알림</h1>
            <p>안 읽은 알림 {unreadCount}개 · 항목을 누르면 해당 화면으로 이동해요.</p>
          </div>
          <div className="wd-row">
            <Link className="wd-btn line sm" href="/inhouse/my/settings">
              알림 설정
            </Link>
            <button type="button" className="wd-btn ghost sm" onClick={markAllRead} disabled={unreadCount === 0}>
              ✓ 모두 읽음
            </button>
          </div>
        </section>
        <div className="wd-tabs" style={{ marginBottom: 18 }}>
          {TABS.map((t) => (
            <button type="button" key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
              {t}
              <small>{t === "전체" ? items.length : items.filter((n) => n.kind === t).length}</small>
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
  <EmptyState
    icon="✓"
    title="새 알림이 없어요"
    description="결재나 공지가 오면 여기에 모여요."
  />
) : (
        <div className="wd-card" style={{ padding: 0, overflow: "hidden" }}>
          {(["오늘", "이번 주"] as const).map((when, gi) => {
            const group = shown.filter((n) => n.when === when);
            if (!group.length) return null;

            return (
              <div key={when}>
                <div
                  className="wd-group-label"
                  style={{
                    padding: "16px 18px 6px",
                    borderTop: gi ? "1px solid #e5e8eb" : undefined,
                  }}
                >
                  {when}
                </div>

                <div className="wd-list">
                  {group.map((n) => (
                    <div
                      key={n.id}
                      className={`wd-li link ${n.unread ? "unread" : ""}`}
                      style={{ padding: "16px 14px" }}
                      role="link"
                      tabIndex={0}
                      onClick={() => open(n)}
                      onKeyDown={(e) => e.key === "Enter" && open(n)}
                    >
                      <span className={`ico ${n.tone}`}>{n.ico}</span>

                      <div>
                        <b>
                          {n.unread && (
                            <span
                              className="wd-dot"
                              style={{ marginRight: 7, verticalAlign: 2 }}
                            />
                          )}
                          {n.title}
                        </b>
                        <p>{n.meta}</p>

                        {n.action && (
                          <div
                            className="wd-row"
                            style={{ marginTop: 10, gap: 6 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="wd-btn blue sm"
                              onClick={() => open(n)}
                            >
                              바로 검토
                            </button>
                            <button
                              type="button"
                              className="wd-btn ghost sm"
                              onClick={() => later(n.id)}
                            >
                              나중에
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="wd-badge">{n.kind}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </WdPage>
  );
}
