"use client";

import type { ReactNode } from "react";
import PortalShell from "./PortalShell";

// 추가 기능 화면 공통 틀: 기존 헤더 + wd- 스타일 범위
export default function WdPage({ active, children }: { active?: string; children: ReactNode }) {
  return (
    <PortalShell active={active}>
      <div className="wd-scope">{children}</div>
    </PortalShell>
  );
}
