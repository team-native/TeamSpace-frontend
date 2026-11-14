"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import WdPage from "./WdPage";

const TABS: [string, string][] = [
  ["게시판", "/inhouse/community"],
  ["운영 제안", "/inhouse/community/proposals"],
  ["문의·건의", "/inhouse/community/inquiry"],
  ["공지", "/inhouse/community/notices"],
];

export default function CommunityShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // 가장 길게 맞는 주소의 탭 (게시판은 나머지 전부)
  const current = TABS.slice(1).find(([, href]) => pathname.startsWith(href))?.[1] ?? TABS[0][1];
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
