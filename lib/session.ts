"use client";

// 로그인한 사람 정보(GET /me). 화면 여러 곳이 같은 값을 쓰도록 한 번만 불러서 나눠 쓴다
import { useEffect, useState } from "react";
import { ApiError, api, clearSession, hasSession } from "./api";

export type Me = {
  id: string;
  name: string;
  email: string;
  dept: string;
  role: string;
  major: string;
  cohort: string;
  github: string;
  photo: string;
  joined: string | null;
  bio: string;
  interests: string[];
  projects: [string, string][];
  isNew: boolean;
  lead: boolean;
  roles: string[];
};

type State = { me: Me | null; error: string; loading: boolean };

let state: State = { me: null, error: "", loading: false };
let pending: Promise<void> | null = null;
const listeners = new Set<(s: State) => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l(state));
}

export function loadMe(force = false): Promise<void> {
  if (!hasSession()) {
    set({ me: null, loading: false, error: "" });
    return Promise.resolve();
  }
  if (state.me && !force) return Promise.resolve();
  pending ??= (async () => {
    set({ loading: true, error: "" });
    try {
      set({ me: await api<Me>("/me"), loading: false });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) clearSession();
      set({ me: null, loading: false, error: e instanceof Error ? e.message : "내 정보를 불러오지 못했어요." });
    } finally {
      pending = null;
    }
  })();
  return pending;
}

export function resetMe() {
  set({ me: null, error: "", loading: false });
}

export function useMe(): State {
  const [s, setS] = useState(state);
  useEffect(() => {
    listeners.add(setS);
    setS(state);
    void loadMe();
    return () => {
      listeners.delete(setS);
    };
  }, []);
  return s;
}

// 운영 관리: 서버 기준 공지 작성(Admin · FA · Leader)과 같은 범위
const STAFF_ROLES = ["Admin", "Leader", "FA"];
export const isStaff = (me: Me | null) => !!me?.roles.some((r) => STAFF_ROLES.includes(r));
export const isAdminRole = (me: Me | null) => !!me?.roles.includes("Admin");
export const canFinance = (me: Me | null) => !!me?.roles.some((r) => ["Admin", "FA", "Leader"].includes(r));

export function signOut() {
  clearSession();
  resetMe();
}

// 로그인 후 돌아갈 주소. 다른 사이트로 튀지 않게 /inhouse 아래만 허용
export function nextPath(search: string): string {
  const next = new URLSearchParams(search).get("next") ?? "";
  return next.startsWith("/inhouse") && !next.startsWith("/inhouse/login") ? next : "/inhouse";
}
