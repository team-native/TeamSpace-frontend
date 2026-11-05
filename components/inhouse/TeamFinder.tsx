"use client";

import { useMemo, useState } from "react";
import { departmentsOf, founderOf, personLine, type Person } from "@/lib/people";
import { Av, Eyebrow, Modal, useToast } from "./ui";
import EmptyState from "@/components/inhouse/EmptyState";

const TEAMS = ["전체", "Native", "NativeLab"] as const;
type Team = (typeof TEAMS)[number];
const teamOf = (p: Person): Team => (p.dept === "NativeLab" ? "NativeLab" : "Native");
// 팀원 찾기: 팀 탭 · 검색 · 부서 필터 · 새 멤버 배너 · 조직도 · 팀원 상세 (GET /people)
export default function TeamFinder({ people: PEOPLE }: { people: Person[] }) {
  const [team, setTeam] = useState<Team>("전체");
  const [view, setView] = useState<"list" | "org">("list");
  const [dept, setDept] = useState<string>("전체");
  const [query, setQuery] = useState("");
  const [openDept, setOpenDept] = useState<string>("Core Platform");
  const [selected, setSelected] = useState<Person | null>(null);
  const toast = useToast();

  const DEPARTMENTS = departmentsOf(PEOPLE);
  // 소개 · 전공을 아직 안 채운 사람
  const unregistered = PEOPLE.filter((p) => !p.bio && !p.role).length;
  const newbies = PEOPLE.filter((p) => p.isNew);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PEOPLE.filter(
      (p) =>
        (team === "전체" || teamOf(p) === team) &&
        (dept === "전체" || p.dept === dept) &&
        (!q || `${p.name} ${p.dept} ${p.role} ${p.email}`.toLowerCase().includes(q)),
    );
  }, [PEOPLE, team, dept, query]);
  const leader = founderOf(PEOPLE);

  return (
    <section className="wd-scope np-team-finder">
      <div className="wd-wrap" style={{ paddingBottom: 90 }}>
        <div className="wd-sec-title" style={{ alignItems: "flex-end" }}>
          <div>
            <Eyebrow>FIND PEOPLE</Eyebrow>
            <h2>함께 일하는 사람 찾기</h2>
          </div>
          <div className="wd-row">
          <div className="wd-tabs">
            {TEAMS.map((t) => (
              <button type="button" key={t} className={team === t ? "on" : ""} onClick={() => setTeam(t)}>
                {t}
                <small>{t === "전체" ? PEOPLE.length : PEOPLE.filter((p) => teamOf(p) === t).length}</small>
              </button>
            ))}
          </div>
          <div className="wd-tabs">
            <button type="button" className={view === "list" ? "on" : ""} onClick={() => setView("list")}>
              목록
            </button>
            <button type="button" className={view === "org" ? "on" : ""} onClick={() => setView("org")}>
              조직도
            </button>
          </div>
          </div>
        </div>

        {newbies.length > 0 && (
          <div className="wd-banner" style={{ marginBottom: 22 }}>
            <span className="ico">+{newbies.length}</span>
            <div>
              <b>이번 주 새 멤버가 합류했어요</b>
              <p>{newbies.map((p) => `${p.name} (${personLine(p)})`).join(", ")} — 반갑게 맞아주세요.</p>
            </div>
            <div className="wd-avs" style={{ marginLeft: "auto" }}>
              {newbies.map((p) => (
                <button type="button" key={p.id} style={{ border: 0, background: "none", padding: 0 }} onClick={() => setSelected(p)}>
                  <Av name={p.name} tone={p.tone} />
                </button>
              ))}
            </div>
          </div>
        )}

        {view === "list" ? (
          <>
            <div className="wd-between" style={{ marginBottom: 18, flexWrap: "wrap" }}>
              <div className="wd-chips">
                {["전체", ...DEPARTMENTS].map((d) => (
                  <button type="button" key={d} className={`wd-chip ${dept === d ? "on" : ""}`} onClick={() => setDept(d)}>
                    {d} <small style={{ opacity: 0.6 }}>{d === "전체" ? PEOPLE.length : PEOPLE.filter((p) => p.dept === d).length}</small>
                  </button>
                ))}
              </div>
              <label className="wd-search" style={{ width: 300 }}>
                <i>⌕</i>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름 · 부서 · 역할 검색" />
              </label>
            </div>
            <div className="wd-grid g4">
              {filtered.map((p) => (
                <button type="button" key={p.id} className="wd-card" style={{ padding: 18, textAlign: "left" }} onClick={() => setSelected(p)}>
                  <div className="wd-between">
                    <Av name={p.name} tone={p.tone} size="lg" />
                    {p.isNew && <span className="wd-badge blue">NEW</span>}
                  </div>
                  <b style={{ display: "block", marginTop: 16, fontSize: 14 }}>{p.name}</b>
                  <span className="wd-t10 wd-faint" style={{ display: "block", marginTop: 4 }}>
                    {personLine(p)}
                  </span>
                </button>
              ))}
            </div>
            {filtered.length === 0 && (
              <EmptyState
                icon="⌕"
                title="검색 결과가 없어요"
                description="다른 단어로 찾아보거나 필터를 풀어보세요."
                actionLabel="필터 초기화"
                onAction={() => {
                  setQuery("");
                  setDept("전체");
                }}
              />
            )}
            {unregistered > 0 && (
              <div className="wd-banner gray" style={{ marginTop: 18 }}>
                <span className="ico">+{unregistered}</span>
                <div>
                  <b>아직 프로필을 채우지 않은 팀원이 {unregistered}명 있어요</b>
                  <p>내 프로필은 프로필 수정에서 전공 · 한 줄 소개를 채울 수 있어요.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", overflowX: "auto" }}>
            {leader && (
            <>
            <button type="button" className="wd-card" style={{ width: 240, textAlign: "center", borderColor: "#cdd9f5", background: "linear-gradient(110deg,#fff,#f7f9ff)" }} onClick={() => setSelected(leader)}>
              <span style={{ display: "flex", justifyContent: "center" }}>
                <Av name={leader.name} tone="dark" size="lg" />
              </span>
              <b style={{ display: "block", marginTop: 12, fontSize: 14 }}>{leader.name}</b>
              <span className="wd-t10 wd-faint">{leader.dept} · Founder</span>
            </button>
            <div style={{ width: 2, height: 30, background: "var(--wd-line)" }} />
            </>
            )}
            <div className="wd-grid" style={{ gridTemplateColumns: `repeat(${Math.max(DEPARTMENTS.filter((d) => d !== "Leader").length, 1)},minmax(150px,1fr))`, width: "100%", minWidth: 900, borderTop: "2px solid var(--wd-line)", paddingTop: 22 }}>
              {DEPARTMENTS.filter((d) => d !== "Leader").map((d) => {
                const members = PEOPLE.filter((p) => p.dept === d);
                const lead = members.find((p) => p.lead) ?? members[0];
                const isOpen = openDept === d;
                return (
                  <div key={d}>
                    <button
                      type="button"
                      className="wd-card"
                      aria-expanded={isOpen}
                      style={{ width: "100%", padding: 16, textAlign: "left", borderColor: isOpen ? "#3182f6" : undefined }}
                      onClick={() => setOpenDept(isOpen ? "" : d)}
                    >
                      <div className="wd-between">
                        <b style={{ fontSize: 12 }}>{d}</b>
                        <span className="wd-t9 wd-faint">{members.length}명</span>
                      </div>
                      {lead && (
                        <div className="wd-row" style={{ marginTop: 12, gap: 8 }}>
                          <Av name={lead.name} tone={lead.tone} size="sm" />
                          <span className="wd-t10">{lead.name}</span>
                          <span className="wd-badge" style={{ marginLeft: "auto" }}>리드</span>
                        </div>
                      )}
                    </button>
                    {isOpen && (
                      <div className="wd-card soft" style={{ marginTop: 8, padding: 12 }}>
                        {members.map((m) => (
                          <button type="button" key={m.id} className="wd-row wd-t10" style={{ padding: "6px 0", gap: 8, border: 0, background: "none", width: "100%" }} onClick={() => setSelected(m)}>
                            <Av name={m.name} tone={m.tone} size="sm" />
                            {m.name}{m.role ? ` · ${m.role}` : ""}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <Modal
          eyebrow="MEMBER"
          title={selected.name}
          sub={personLine(selected)}
          onClose={() => setSelected(null)}
          footer={
            <>
              <button
                type="button"
                className="wd-btn ghost"
                onClick={async () => {
                  await navigator.clipboard?.writeText(selected.email).catch(() => undefined);
                  toast.show("메일 주소를 복사했어요");
                }}
              >
                메일 복사
              </button>
              <a className="wd-btn" href={`mailto:${selected.email}`}>
                메일 보내기
              </a>
            </>
          }
        >
          <div className="wd-row" style={{ gap: 16, marginBottom: 22 }}>
            {selected.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.photo} alt="" width={64} height={64} style={{ borderRadius: "50%", objectFit: "cover", flex: "none" }} />
            ) : (
              <Av name={selected.name} tone={selected.tone} size="xl" />
            )}
            <div>
              <p className="wd-t12" style={{ margin: 0, lineHeight: 1.7 }}>
                {selected.bio ? `“${selected.bio}”` : "아직 한 줄 소개가 없어요."}
              </p>
              {selected.interests.length > 0 && (
                <div className="wd-chips" style={{ marginTop: 10 }}>
                  {selected.interests.map((c) => (
                    <span key={c} className="wd-chip">#{c}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <dl className="wd-kv" style={{ marginBottom: 22 }}>
            <div><dt>이메일</dt><dd>{selected.email}</dd></div>
            <div><dt>GitHub</dt><dd>{selected.github || "미등록"}</dd></div>
            <div><dt>합류일</dt><dd>{selected.joined || "-"}</dd></div>
            <div><dt>부서</dt><dd>{selected.dept || "미등록"}</dd></div>
            {selected.cohort && <div><dt>기수</dt><dd>{selected.cohort}</dd></div>}
          </dl>
          {selected.projects.length > 0 && (
            <>
              <b className="wd-t10" style={{ color: "#4e5968" }}>참여 프로젝트</b>
              <div className="wd-stack" style={{ marginTop: 10, gap: 8 }}>
                {selected.projects.map(([p, r]) => (
                  <a key={p} className="wd-file" href={`/inhouse/my/projects/${p.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                    <span className="wd-av sm blue">{p.slice(0, 1)}</span>
                    <div>
                      <b>{p}</b>
                      <small>{r}</small>
                    </div>
                    <span className="end">→</span>
                  </a>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}
      {toast.node}
    </section>
  );
}
