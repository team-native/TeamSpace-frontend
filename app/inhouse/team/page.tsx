"use client";

import PortalShell from "@/components/inhouse/PortalShell";
import { useOrganization } from "@/lib/organization";
import TeamFinder from "@/components/inhouse/TeamFinder";

export default function TeamPage() {
  // 실패하면 PortalShell 이 오류 화면(다시 불러오기)을 보여준다
  const { org, error } = useOrganization();


  return (
    <PortalShell error={error} active="team">
      {!error && !org && (
        <div className="wd-scope wd-muted wd-t11" aria-busy="true" style={{ padding: "120px 20px", textAlign: "center" }}>
          팀원을 불러오는 중…
        </div>
      )}
      {org && (
        <div className="np-team-page native">
          <section className="np-team-hero">
            <div className="np-team-copy">
              <h1>
                브랜드를 만드는 사람들을 소개해요.
              </h1>
              <p>
                Native와 NativeLab은 같은 방향에서 출발해 서로 다른 방식으로 제품의 가능성을 만듭니다.
              </p>
              <p className="np-team-count">
                {org.meta.title && `${org.meta.title} · `}구성원 {org.meta.totalMembers}명 · {org.meta.teamCount}개 팀
              </p>
            </div>
          </section>

          <TeamFinder org={org} />

        </div>
      )}
    </PortalShell>
  );
}
