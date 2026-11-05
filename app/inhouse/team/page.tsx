"use client";

import Image from "next/image";
import PortalShell from "@/components/inhouse/PortalShell";
import { useRevealOnScroll } from "@/components/inhouse/useRevealOnScroll";
import { useInhouseData } from "@/lib/inhouse";
import { departmentsOf, founderOf, usePeople, type Person } from "@/lib/people";
import TeamFinder from "@/components/inhouse/TeamFinder";

export default function TeamPage() {
  const { data } = useInhouseData();
  // 실패하면 PortalShell 이 오류 화면(다시 불러오기)을 보여준다
  const { people, error } = usePeople();
  const founder = people ? founderOf(people) : null;
  const teams = people ? new Set(people.map((p) => (p.dept === "NativeLab" ? "NativeLab" : "Native"))).size : 0;

  useRevealOnScroll(".np-reveal", { threshold: 0.1, rootMargin: "0px 0px -24px" }, [people]);

  return (
    <PortalShell data={data} error={error} active="team">
      {!error && !people && (
        <div className="wd-scope wd-muted wd-t11" aria-busy="true" style={{ padding: "120px 20px", textAlign: "center" }}>
          팀원을 불러오는 중…
        </div>
      )}
      {people && (
        <div className="np-team-page native">
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
                  <b>{people.length}</b>
                  <small>People</small>
                </span>
                <i />
                <span>
                  <b>{teams}</b>
                  <small>Teams</small>
                </span>
                <i />
                <span>
                  <b>{founder ? 1 : 0}</b>
                  <small>Founder</small>
                </span>
              </div>
            </div>
            {founder && <FounderCard person={founder} depts={departmentsOf(people).length} />}
          </section>

          <TeamFinder people={people} />

        </div>
      )}
    </PortalShell>
  );
}

function FounderCard({ person, depts }: { person: Person; depts: number }) {
  return (
    <article className="np-founder-card np-reveal">
      <div className="np-founder-top">
        <span>FOUNDER</span>
        <i>01</i>
      </div>
      <div className="np-founder-profile">
        <Avatar large photo={person.photo} name={person.name} />
        <div>
          <small>Native Founder</small>
          <h2>{person.name}</h2>
          <p>{[person.cohort, person.joined && `${person.joined} 합류`].filter(Boolean).join(" · ") || person.email}</p>
        </div>
      </div>
      <div className="np-founder-info">
        <span>ABOUT</span>
        <p>{person.bio || `Native를 시작하고 ${depts}개 부서의 제품 방향과 기술 기반을 함께 이끌고 있어요.`}</p>
        <dl>
          <div>
            <dt>전공</dt>
            <dd>{person.role || "미등록"}</dd>
          </div>
          <div>
            <dt>소속</dt>
            <dd>{person.dept || "미등록"}</dd>
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

function Avatar({ large = false, photo = "", name }: { large?: boolean; photo?: string; name: string }) {
  return (
    <span
      className={`np-avatar ${large ? "large" : ""} ${photo ? "has-photo" : ""}`}
      aria-label={photo ? `${name} 증명사진` : "프로필 이미지 없음"}
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
