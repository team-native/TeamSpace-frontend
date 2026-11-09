"use client";

// 팀원 화면: GET /organization (조직도 · 구성원 · 프로젝트를 한 번에) + GET /people (메일 · 소개 같은 상세)
import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { toneOf, type Tone } from "./shared";
import { formatJoined } from "./people";

type Ref = { memberId: string; name: string; avatarInitial?: string };

export type OrgGroup = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  lead: (Ref & { role: string }) | null;
  members: (Ref & { role: string; isLead: boolean })[];
};

export type OrgProject = {
  id: string;
  name: string;
  leader: (Ref & { type: string }) | null;
  members: (Ref & { role: string })[];
};

export type OrgMember = {
  id: string;
  name: string;
  avatarInitial: string;
  primaryOrg: string;
  organizations: string[];
  primaryDepartment: string;
  departments: string[];
  role: string;
  displaySubtitle: string;
  majorLead: string | null;
  isLead: boolean;
  isNew: boolean;
  pmPoRoles: { project: string; role: string }[];
  projects: { project: string; role: string }[];
  tone: Tone;
  // /people 에서 같은 사람을 찾았을 때만 채워진다
  email: string;
  github: string;
  photo: string;
  joined: string;
  cohort: string;
  bio: string;
  interests: string[];
};

export type Organization = {
  meta: { title: string; totalMembers: number; teamCount: number; organizationCounts: Record<string, number> };
  founder: (Ref & { title: string }) | null;
  groups: OrgGroup[];
  members: OrgMember[];
  projects: OrgProject[];
};

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));

function toMember(m: Raw, detail: Raw | undefined): OrgMember {
  const id = str(m.id);
  return {
    id,
    name: str(m.name) || "이름 없음",
    avatarInitial: str(m.avatarInitial),
    primaryOrg: str(m.primaryOrg) || "Native",
    organizations: arr<string>(m.organizations),
    primaryDepartment: str(m.primaryDepartment),
    departments: arr<string>(m.departments),
    role: str(m.role),
    displaySubtitle: str(m.displaySubtitle),
    majorLead: m.majorLead ? str(m.majorLead) : null,
    isLead: !!m.isLead,
    isNew: !!m.isNew,
    pmPoRoles: arr(m.pmPoRoles),
    projects: arr(m.projects),
    tone: toneOf(id),
    email: str(detail?.email),
    github: str(detail?.github),
    photo: str(detail?.photo),
    joined: formatJoined(detail?.joined),
    cohort: str(detail?.cohort),
    bio: str(detail?.bio),
    interests: arr<string>(detail?.interests),
  };
}

async function loadPeopleDetail(): Promise<Raw[]> {
  const all: Raw[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < 20; i++) {
    const page: { items: Raw[]; nextCursor: string | null } = await api("/people", { query: { limit: 100, cursor } });
    all.push(...page.items);
    cursor = page.nextCursor;
    if (!cursor) break;
  }
  return all;
}

export function useOrganization() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      // 상세는 못 받아도 조직도는 보여준다
      const [tree, people] = await Promise.all([api<Raw>("/organization"), loadPeopleDetail().catch(() => [] as Raw[])]);
      const byId = new Map(people.map((p) => [str(p.id), p]));
      const byName = new Map(people.map((p) => [str(p.name), p]));
      const chart = (tree.organizationChart ?? {}) as Raw;
      const members = arr<Raw>(tree.members).map((m) => toMember(m, byId.get(str(m.id)) ?? byName.get(str(m.name))));
      const meta = (tree.meta ?? {}) as Raw;
      setOrg({
        meta: {
          title: str(meta.title),
          totalMembers: Number(meta.totalMembers) || members.length,
          teamCount: Number(meta.teamCount) || new Set(members.flatMap((m) => m.organizations)).size,
          organizationCounts: (meta.organizationCounts ?? {}) as Record<string, number>,
        },
        founder: (chart.founder as Organization["founder"]) ?? null,
        groups: arr<OrgGroup>(chart.groups).map((g) => ({ ...g, members: arr(g.members) })),
        members,
        projects: arr<OrgProject>(tree.projects).map((p) => ({ ...p, members: arr(p.members) })),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "팀원을 불러오지 못했어요.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { org, error, reload: load };
}
