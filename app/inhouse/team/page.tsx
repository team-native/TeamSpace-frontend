"use client";

import Image from "next/image";
import PortalShell from "@/components/inhouse/PortalShell";
import { useProfilePhoto } from "@/components/inhouse/useProfilePhoto";
import { useRevealOnScroll } from "@/components/inhouse/useRevealOnScroll";
import { useInhouseData } from "@/lib/inhouse";
import TeamFinder from "@/components/inhouse/TeamFinder";

const FOUNDER = {
  name: "김준표",
  department: "Core Platform",
  major: "iOS",
  cohort: "25기",
  studentId: "25038",
  github: "GitHub 미등록",
};

export default function TeamPage() {
  const { data, error } = useInhouseData();
  const photo = useProfilePhoto(data?.member.email ?? "");

  useRevealOnScroll(".np-reveal", { threshold: 0.1, rootMargin: "0px 0px -24px" }, [data]);

  return (
    <PortalShell data={data} error={error} active="team">
      {data && (
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
