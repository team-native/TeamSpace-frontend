"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CommunityShell from "@/components/inhouse/CommunityShell";
import { Eyebrow } from "@/components/inhouse/ui";
import { NOTICES, NOTICE_READ_KEY, loadLocal } from "@/lib/demo";


const KINDS = ["전체", "필독", "제도", "일정", "일반"];

export default function NoticesPage() {
  const [kind, setKind] = useState("전체");
  const [confirmed, setConfirmed] = useState<string[]>([]);
  useEffect(() => setConfirmed(loadLocal<string[]>(NOTICE_READ_KEY, [])), []);
  const list = NOTICES.filter((n) => kind === "전체" || n.kind === kind);
  const sorted = [...list.filter((n) => n.pinned), ...list.filter((n) => !n.pinned)];

  return (
    <CommunityShell>
      <section className="wd-hero sm">
        <div>
          <Eyebrow>NOTICE</Eyebrow>
          <h1>공지</h1>
          <p>필독 공지는 확인하면 체크돼요.</p>
        </div>
      </section>
      <div className="wd-chips" style={{ marginBottom: 14 }}>
        {KINDS.map((c) => (
          <button type="button" key={c} className={`wd-chip ${kind === c ? "on" : ""}`} onClick={() => setKind(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="wd-card" style={{ padding: "4px 20px" }}>
        <div className="wd-list">
          {sorted.map((n) => {
            const mine = confirmed.includes(n.id);
            return (
              <Link key={n.id} href={`/inhouse/community/notices/${n.id}`} className="wd-li link" style={{ gridTemplateColumns: "56px 1fr auto auto" }}>
                <span className={`wd-badge ${n.tone}`} style={{ justifySelf: "start" }}>{n.kind}</span>
                <div>
                  <b>
                    {n.pinned && <span className="wd-badge dark" style={{ marginRight: 8, height: 18 }}>고정</span>}
                    {n.title}
                  </b>
                  <p>
                    {n.author} · {n.date}
                  </p>
                </div>
                <span className="wd-t9 wd-faint">
                  {n.mustRead ? (mine ? "✓ 확인함" : `${n.confirmed}/${n.total} 확인`) : ""}
                </span>
                <span className="wd-faint">→</span>
              </Link>
            );
          })}
          {sorted.length === 0 && <div className="pf-empty" style={{ padding: 30 }}>이 분류의 공지가 없어요.</div>}
        </div>
      </div>
    </CommunityShell>
  );
}
