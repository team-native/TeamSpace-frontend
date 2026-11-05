"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import WdPage from "./WdPage";

const TABS: [string, string][] = [
  ["게시판", "/inhouse/community"],
  ["문의·건의", "/inhouse/community/inquiry"],
  ["공지", "/inhouse/community/notices"],
];

export default function CommunityShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = pathname.startsWith("/inhouse/community/inquiry")
    ? TABS[1][1]
    : pathname.startsWith("/inhouse/community/notices")
      ? TABS[2][1]
      : TABS[0][1];
  return (
    <WdPage>
      <div className="wd-wrap wd-pb">
        <nav className="wd-row pf-community-tabs" aria-label="커뮤니티">
          {TABS.map(([label, href]) => (
            <Link key={href} href={href} aria-current={current === href ? "page" : undefined} className={current === href ? "on" : ""}>
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </WdPage>
  );
}
