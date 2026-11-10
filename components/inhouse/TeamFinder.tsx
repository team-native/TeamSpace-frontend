"use client";

import { useEffect, useMemo, useState } from "react";
import type { OrgMember, Organization } from "@/lib/organization";
import { Av, Eyebrow, Modal, useToast } from "./ui";
import EmptyState from "@/components/inhouse/EmptyState";

const memberLine = (m: OrgMember) => m.displaySubtitle || [m.primaryDepartment, m.role].filter(Boolean).join(" · ") || "소속 미등록";

// 팀원 찾기: 조직 탭 · 검색 · 부서 필터 · 새 멤버 배너 · 조직도 · 팀원 상세 (GET /organization/tree)
export default function TeamFinder({ org }: { org: Organization }) {
  const PEOPLE = org.members;
  const TEAMS = ["전체", ...Object.keys(org.meta.organizationCounts).filter((k) => k !== "all")];
  if (TEAMS.length === 1) TEAMS.push(...new Set(PEOPLE.flatMap((p) => p.organizations)));
  const [team, setTeam] = useState<string>("전체");
  const [view, setView] = useState<"list" | "org">("list");
  const [dept, setDept] = useState<string>("전체");
  const [query, setQuery] = useState("");
  const [openDept, setOpenDept] = useState<string>("");
  const [selected, setSelected] = useState<OrgMember | null>(null);
  const toast = useToast();

  const byId = useMemo(() => new Map(PEOPLE.map((p) => [p.id, p])), [PEOPLE]);
  const groupOf = (name: string) => org.groups.find((g) => g.name === name);
  const inGroup = (p: OrgMember, name: string) => !!groupOf(name)?.members.some((m) => m.memberId === p.id);
  const teamCount = (t: string) =>
    t === "전체" ? org.meta.organizationCounts.all ?? PEOPLE.length : org.meta.organizationCounts[t] ?? PEOPLE.filter((p) => p.organizations.includes(t)).length;
  const open = (id: string) => {
    const p = byId.get(id);
    if (p) setSelected(p);
  };

  // /inhouse/team?member=member-02 로 들어오면 그 사람 상세를 바로 연다
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("member");
    if (id) open(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byId]);

  const DEPARTMENTS = org.groups.map((g) => g.name);
  const newbies = PEOPLE.filter((p) => p.isNew);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PEOPLE.filter(
      (p) =>
        (team === "전체" || p.organizations.includes(team)) &&
        (dept === "전체" || inGroup(p, dept)) &&
        (!q || `${p.name} ${p.departments.join(" ")} ${p.role} ${p.displaySubtitle} ${p.email}`.toLowerCase().includes(q)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PEOPLE, team, dept, query]);
  const founder = org.founder;

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
                <small>{teamCount(t)}</small>
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
              <p>{newbies.map((p) => `${p.name} (${memberLine(p)})`).join(", ")} — 반갑게 맞아주세요.</p>
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
                    {d} <small style={{ opacity: 0.6 }}>{d === "전체" ? PEOPLE.length : groupOf(d)?.memberCount ?? 0}</small>
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
                    {memberLine(p)}
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
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", overflowX: "auto" }}>
            {founder && (
            <>
            <button type="button" className="wd-card" style={{ width: 240, textAlign: "center", borderColor: "var(--t-blue-line)", background: "var(--t-card)" }} onClick={() => open(founder.memberId)}>
              <span style={{ display: "flex", justifyContent: "center" }}>
                <Av name={founder.name} tone="dark" size="lg" />
              </span>
              <b style={{ display: "block", marginTop: 12, fontSize: 14 }}>{founder.name}</b>
              <span className="wd-t10 wd-faint">{founder.title}</span>
            </button>
            <div style={{ width: 2, height: 30, background: "var(--wd-line)" }} />
            </>
            )}
            <div className="wd-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", width: "100%", borderTop: "2px solid var(--wd-line)", paddingTop: 22, alignItems: "start" }}>
              {org.groups.map((g) => {
                const isOpen = openDept === g.id;
                return (
                  <div key={g.id}>
                    <button
                      type="button"
                      className="wd-card"
                      aria-expanded={isOpen}
                      style={{ width: "100%", padding: 16, textAlign: "left", borderColor: isOpen ? "var(--t-cobalt)" : undefined }}
                      onClick={() => setOpenDept(isOpen ? "" : g.id)}
                    >
                      <div className="wd-between">
                        <b style={{ fontSize: 12 }}>{g.name}</b>
                        <span className="wd-t9 wd-faint">{g.memberCount}명</span>
                      </div>
                      {g.description && <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 4 }}>{g.description}</span>}
                      {g.lead && (
                        <div className="wd-row" style={{ marginTop: 12, gap: 8 }}>
                          <Av name={g.lead.name} tone={byId.get(g.lead.memberId)?.tone ?? ""} size="sm" />
                          <span className="wd-t10">{g.lead.name}</span>
                          <span className="wd-badge" style={{ marginLeft: "auto" }}>리드</span>
                        </div>
                      )}
                    </button>
                    {isOpen && (
                      <div className="wd-card soft" style={{ marginTop: 8, padding: 12 }}>
                        {g.members.map((m) => (
                          <button type="button" key={m.memberId} className="wd-row wd-t10" style={{ padding: "6px 0", gap: 8, border: 0, background: "none", width: "100%", textAlign: "left" }} onClick={() => open(m.memberId)}>
                            <Av name={m.name} tone={byId.get(m.memberId)?.tone ?? ""} size="sm" />
                            <span>{m.name}{m.role ? ` · ${m.role}` : ""}</span>
                            {m.isLead && <span className="wd-badge" style={{ marginLeft: "auto" }}>리드</span>}
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
          sub={memberLine(selected)}
          onClose={() => setSelected(null)}
          footer={
            selected.email ? (
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
            ) : undefined
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
            <div><dt>소속</dt><dd>{selected.organizations.join(" · ") || "-"}</dd></div>
            <div><dt>부서</dt><dd>{selected.departments.join(" · ") || selected.primaryDepartment || "미등록"}</dd></div>
            <div><dt>역할</dt><dd>{selected.role || "-"}</dd></div>
            {selected.majorLead && <div><dt>전공 리더</dt><dd>{selected.majorLead}</dd></div>}
            {selected.pmPoRoles.length > 0 && (
              <div><dt>PM · PO</dt><dd>{selected.pmPoRoles.map((r) => `${r.role} (${r.project})`).join(", ")}</dd></div>
            )}
            {selected.email && <div><dt>이메일</dt><dd>{selected.email}</dd></div>}
            {selected.github && <div><dt>GitHub</dt><dd>{selected.github}</dd></div>}
            {selected.joined && <div><dt>합류일</dt><dd>{selected.joined}</dd></div>}
            {selected.cohort && <div><dt>기수</dt><dd>{selected.cohort}</dd></div>}
          </dl>
          {selected.projects.length > 0 && (
            <>
              <b className="wd-t10" style={{ color: "var(--t-muted)" }}>참여 프로젝트</b>
              <div className="wd-stack" style={{ marginTop: 10, gap: 8 }}>
                {selected.projects.map(({ project: p, role: r }) => (
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
