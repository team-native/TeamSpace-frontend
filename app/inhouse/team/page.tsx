"use client";

import Image from "next/image";
import { useMemo, useState, type CSSProperties } from "react";
import PortalShell from "@/components/inhouse/PortalShell";
import { useProfilePhoto } from "@/components/inhouse/useProfilePhoto";
import { useRevealOnScroll } from "@/components/inhouse/useRevealOnScroll";
import { useInhouseData } from "@/lib/inhouse";
import TeamFinder from "@/components/inhouse/TeamFinder";

type Division = "Native" | "NativeLab";

type Member = {
  id: number;
  division: Division;
  name: string;
  department: string;
  major: string;
  cohort: string;
  studentId: string;
  github: string;
};

const FOUNDER = {
  name: "김준표",
  department: "Core Platform",
  major: "iOS",
  cohort: "25기",
  studentId: "25038",
  github: "GitHub 미등록",
};

const MEMBERS: Member[] = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  division: i < 9 ? "Native" : "NativeLab",
  name: "이름 미등록",
  department: "무소속",
  major: "전공 미등록",
  cohort: "기수 미등록",
  studentId: "학번 미등록",
  github: "GitHub 미등록",
}));

const TEAMS: Record<Division, { logo: string; label: string; copy: string; count: number }> = {
  Native: {
    logo: "/inhouse/native-mark.png",
    label: "Native",
    copy: "서비스를 설계하고 만드는 제품 팀",
    count: 10,
  },
  NativeLab: {
    logo: "/inhouse/nativelab-mark.png",
    label: "NativeLab",
    copy: "새로운 가능성을 검증하는 실험 팀",
    count: 10,
  },
};

export default function TeamPage() {
  const { data, error } = useInhouseData();
  const [division, setDivision] = useState<Division>("Native");
  const photo = useProfilePhoto(data?.member.email ?? "");
  const members = useMemo(() => MEMBERS.filter((m) => m.division === division), [division]);

  useRevealOnScroll(".np-reveal", { threshold: 0.1, rootMargin: "0px 0px -24px" }, [data, division]);

  return (
    <PortalShell data={data} error={error} active="team">
      {data && (
        <div className={`np-team-page ${division === "NativeLab" ? "lab" : "native"}`}>
          <section className="np-team-hero">
            <div className="np-team-copy">
              <span>
                <i /> NATIVE PEOPLE
              </span>
              <h1>
                브랜드를 만드는
                <br />
                사람들을 소개해요.
              </h1>
              <p>
                Native와 NativeLab은 같은 방향에서 출발해
                <br />
                서로 다른 방식으로 제품의 가능성을 만듭니다.
              </p>
              <div className="np-team-metrics">
                <span>
                  <b>19</b>
                  <small>People</small>
                </span>
                <i />
                <span>
                  <b>2</b>
                  <small>Teams</small>
                </span>
                <i />
                <span>
                  <b>1</b>
                  <small>Founder</small>
                </span>
              </div>
            </div>
            <FounderCard photo={photo} />
          </section>

          <TeamFinder />

          <section className="np-team-directory">
            <header className="np-directory-head np-reveal">
              <div>
                <span>TEAM SELECT</span>
                <h2>팀을 선택해 보세요</h2>
              </div>
              <p>NativeLab을 선택하면 팀의 다크 아이덴티티로 전환돼요.</p>
            </header>
            <nav className="np-team-switch np-reveal" aria-label="팀 선택">
              {(Object.keys(TEAMS) as Division[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={division === key ? "active" : ""}
                  aria-pressed={division === key}
                  onClick={() => setDivision(key)}
                >
                  <span className="np-brand-mark">
                    <Image src={TEAMS[key].logo} alt="" fill style={{ objectFit: "cover" }} sizes="52px" unoptimized />
                  </span>
                  <span>
                    <b>{TEAMS[key].label}</b>
                    <small>{TEAMS[key].copy}</small>
                  </span>
                  <em>{TEAMS[key].count}명</em>
                </button>
              ))}
            </nav>
            <div className="np-current-team np-reveal">
              <div>
                <span className="np-brand-mark small">
                  <Image src={TEAMS[division].logo} alt="" fill style={{ objectFit: "cover" }} sizes="38px" unoptimized />
                </span>
                <div>
                  <span>CURRENT TEAM</span>
                  <h2>{division}</h2>
                </div>
              </div>
              <p>{TEAMS[division].copy}</p>
            </div>
            <LeaderCard division={division} photo={photo} />
            <div className="np-members-head np-reveal">
              <div>
                <span>MEMBERS</span>
                <h2>{division} 팀원</h2>
              </div>
              <strong>{members.length}명</strong>
            </div>
            <div className="np-member-grid np-reveal">
              {members.map((member, i) => (
                <MemberCard key={member.id} member={member} index={i} />
              ))}
            </div>
          </section>
        </div>
      )}
    </PortalShell>
  );
}

function FounderCard({ photo }: { photo: string }) {
  return (
    <article className="np-founder-card np-reveal">
      <div className="np-founder-top">
        <span>FOUNDER</span>
        <i>01</i>
      </div>
      <div className="np-founder-profile">
        <Avatar large photo={photo} />
        <div>
          <small>Native Founder</small>
          <h2>{FOUNDER.name}</h2>
          <p>
            {FOUNDER.cohort} · {FOUNDER.studentId}
          </p>
        </div>
      </div>
      <div className="np-founder-info">
        <span>ABOUT</span>
        <p>Native를 시작하고 두 팀의 제품 방향과 기술 기반을 함께 이끌고 있어요.</p>
        <dl>
          <div>
            <dt>전공</dt>
            <dd>{FOUNDER.major}</dd>
          </div>
          <div>
            <dt>소속</dt>
            <dd>{FOUNDER.department}</dd>
          </div>
        </dl>
      </div>
      <div className="np-role-tags">
        <span>Founder</span>
        <span>Native Lead</span>
        <span>NativeLab Lead</span>
      </div>
    </article>
  );
}

function LeaderCard({ division, photo }: { division: Division; photo: string }) {
  return (
    <article className="np-leader-card np-reveal">
      <div className="np-leader-brand">
        <span className="np-brand-mark">
          <Image src={TEAMS[division].logo} alt="" fill style={{ objectFit: "cover" }} sizes="52px" unoptimized />
        </span>
        <small>{division} LEAD</small>
      </div>
      <Avatar large photo={photo} />
      <div className="np-leader-person">
        <span>LEADER</span>
        <h2>{FOUNDER.name}</h2>
        <p>
          {FOUNDER.cohort} · {FOUNDER.studentId}
        </p>
      </div>
      <dl>
        <div>
          <dt>전공</dt>
          <dd>{FOUNDER.major}</dd>
        </div>
        <div>
          <dt>소속 부서</dt>
          <dd>{FOUNDER.department}</dd>
        </div>
      </dl>
      <div className="np-leader-role">
        <span>Founder</span>
        <b>{division} Lead</b>
      </div>
    </article>
  );
}

function MemberCard({ member, index }: { member: Member; index: number }) {
  return (
    <article className="np-member-card" style={{ "--row-delay": `${Math.min(index, 8) * 55}ms` } as CSSProperties}>
      <Avatar />
      <div className="np-member-person">
        <h3>{member.name}</h3>
        <p>
          {member.cohort} · {member.studentId}
        </p>
      </div>
      <dl>
        <div>
          <dt>전공</dt>
          <dd>{member.major}</dd>
        </div>
        <div>
          <dt>부서</dt>
          <dd>{member.department}</dd>
        </div>
      </dl>
      <span className="np-member-github">{member.github}</span>
    </article>
  );
}

function Avatar({ large = false, photo = "" }: { large?: boolean; photo?: string }) {
  return (
    <span
      className={`np-avatar ${large ? "large" : ""} ${photo ? "has-photo" : ""}`}
      aria-label={photo ? "김준표 증명사진" : "프로필 이미지 없음"}
    >
      {photo ? (
        <Image src={photo} alt="" fill style={{ objectFit: "cover" }} sizes={large ? "180px" : "64px"} unoptimized />
      ) : (
        <>
          <i />
          <b />
        </>
      )}
    </span>
  );
}
