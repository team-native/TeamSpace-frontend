"use client";

import type { ReactNode } from "react";
import type { InhouseData } from "@/lib/inhouse";
import PortalHeader from "./PortalHeader";

type Props = {
  data: InhouseData | null;
  error: string;
  active?: string;
  children: ReactNode;
};

export default function PortalShell({ data, error, active, children }: Props) {
  if (error) {
    return (
      <main className="pf-state">
        <b>!</b>
        <h1>잠시 문제가 생겼어요</h1>
        <p>{error}</p>
        <button onClick={() => location.reload()}>다시 불러오기</button>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="pf-state">
        <div className="pf-loading">
          <i />
          <i />
          <i />
        </div>
        <p>Native 인하우스를 준비하고 있어요</p>
      </main>
    );
  }

  return (
    <main className={`pf-shell ${active ? `pf-${active}` : ""}`}>
      <PortalHeader member={data.member} />
      {children}
    </main>
  );
}
