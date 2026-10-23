"use client";

import type { ReactNode } from "react";
import { useInhouseData } from "@/lib/inhouse";
import PortalShell from "./PortalShell";

// 추가 기능 화면 공통 틀: 기존 헤더 + wd- 스타일 범위
export default function WdPage({ active, children }: { active?: string; children: ReactNode }) {
  const { data, error } = useInhouseData();
  return (
    <PortalShell data={data} error={error} active={active}>
      {data && <div className="wd-scope">{children}</div>}
    </PortalShell>
  );
}
