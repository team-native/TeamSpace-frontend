"use client";

// 팀원: GET /people (커서로 끝까지 받아 화면에서 거른다. 팀 규모가 작아서)
import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { DEPARTMENTS, type Tone } from "./demo";

export type Person = {
  id: string;
  name: string;
  dept: string;
  role: string;
  tone: Tone;
  email: string;
  github: string;
  photo: string;
  joined: string;
  cohort: string;
  bio: string;
  interests: string[];
  projects: [string, string][];
  isNew: boolean;
  lead: boolean;
  roles: string[];
};

type ServerPerson = {
  id: string | number;
  name?: string;
  email?: string;
  dept?: string;
  role?: string;
  major?: string;
  cohort?: string;
  github?: string;
  photo?: string;
  joined?: string | null;
  bio?: string;
  interests?: string[];
  projects?: [string, string][];
  isNew?: boolean;
  lead?: boolean;
  roles?: string[];
};

const DEPT_TONE: Record<string, Tone> = {
  Leader: "dark",
  NativeOps: "blue",
  PMO: "violet",
  FA: "green",
  "Core Platform": "blue",
  Design: "violet",
  NativeLab: "orange",
};

export function formatJoined(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function toPerson(s: ServerPerson): Person {
  const dept = s.dept || "";
  return {
    id: String(s.id),
    name: s.name || "이름 없음",
    dept,
    role: s.role || s.major || "",
    tone: DEPT_TONE[dept] ?? "",
    email: s.email || "",
    github: s.github || "",
    photo: s.photo || "",
    joined: formatJoined(s.joined),
    cohort: s.cohort || "",
    bio: s.bio || "",
    interests: s.interests ?? [],
    projects: (s.projects ?? []).filter((p) => Array.isArray(p) && p[0]),
    isNew: !!s.isNew,
    lead: !!s.lead,
    roles: s.roles ?? [],
  };
}

// 데모에 있던 부서 순서를 먼저, 그 밖의 부서는 뒤에 이름순
export function departmentsOf(people: Person[]): string[] {
  const known = DEPARTMENTS.filter((d) => people.some((p) => p.dept === d)) as string[];
  const extra = [...new Set(people.map((p) => p.dept).filter((d) => d && !known.includes(d)))].sort();
  return [...known, ...extra];
}

export const founderOf = (people: Person[]) =>
  people.find((p) => p.roles.includes("Leader")) ?? people.find((p) => p.dept === "Leader") ?? null;

export const personLine = (p: Person) => [p.dept, p.role].filter(Boolean).join(" · ") || "소속 미등록";

type Page = { items: ServerPerson[]; nextCursor: string | null };

export function usePeople() {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const all: Person[] = [];
      let cursor: string | null = null;
      // 혹시 모를 무한 반복을 막으려고 최대 20페이지(2,000명)
      for (let i = 0; i < 20; i++) {
        const page: Page = await api<Page>("/people", { query: { limit: 100, cursor } });
        all.push(...page.items.map(toPerson));
        cursor = page.nextCursor;
        if (!cursor) break;
      }
      setPeople(all);
    } catch (e) {
      setError(e instanceof Error ? e.message : "팀원을 불러오지 못했어요.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { people, error, reload: load };
}
