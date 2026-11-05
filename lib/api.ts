// TeamSpace-backend 호출. 브라우저는 같은 출처 /api 로만 요청하고 next.config 의 rewrites 가 서버로 넘겨준다(CORS 회피).
const BASE = "/api";

const ACCESS_KEY = "teamspace-access";
const REFRESH_KEY = "teamspace-refresh";
const USER_KEY = "teamspace-user";

export type SessionUser = { id: string; name: string; roles: string[] };

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// "로그인 상태 유지"면 localStorage, 아니면 탭을 닫으면 사라지는 sessionStorage
function storages(): Storage[] {
  if (typeof window === "undefined") return [];
  return [window.localStorage, window.sessionStorage];
}

function read(key: string): string | null {
  for (const s of storages()) {
    const v = s.getItem(key);
    if (v) return v;
  }
  return null;
}

function holder(): Storage | null {
  return storages().find((s) => s.getItem(REFRESH_KEY)) ?? null;
}

export function saveSession(access: string, refresh: string, user: SessionUser | null, persistent: boolean) {
  clearSession();
  const [local, session] = storages();
  const s = persistent ? local : session;
  if (!s) return;
  s.setItem(ACCESS_KEY, access);
  s.setItem(REFRESH_KEY, refresh);
  if (user) s.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  for (const s of storages()) [ACCESS_KEY, REFRESH_KEY, USER_KEY].forEach((k) => s.removeItem(k));
}

export function sessionUser(): SessionUser | null {
  try {
    return JSON.parse(read(USER_KEY) ?? "null");
  } catch {
    return null;
  }
}

export const hasSession = () => !!read(REFRESH_KEY);

// FastAPI 에러는 {"detail": "..."} 또는 {"detail": {"message": ...}} 또는 422 의 [{msg}] 모양
export function errorMessage(status: number, body: unknown): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && !Array.isArray(detail) && typeof (detail as { message?: unknown }).message === "string")
    return (detail as { message: string }).message;
  if (Array.isArray(detail)) return "입력한 값을 다시 확인해 주세요.";
  if (status === 401) return "다시 로그인해 주세요.";
  if (status === 403) return "권한이 없어요.";
  if (status === 404) return "찾을 수 없어요.";
  if (status >= 500) return "잠시 후 다시 시도해 주세요.";
  return "요청을 처리하지 못했어요.";
}

let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = read(REFRESH_KEY);
  const s = holder();
  if (!refreshToken || !s) return false;
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      s.setItem(ACCESS_KEY, data.accessToken);
      s.setItem(REFRESH_KEY, data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

type Options = { method?: string; body?: unknown; auth?: boolean; query?: Record<string, string | number | boolean | undefined | null> };

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, auth = true, query } = opts;
  const qs = query
    ? new URLSearchParams(
        Object.entries(query)
          .filter(([, v]) => v !== undefined && v !== null && v !== "")
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  const url = `${BASE}${path}${qs ? `?${qs}` : ""}`;

  const send = () => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const token = auth ? read(ACCESS_KEY) : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  };

  let res: Response;
  try {
    res = await send();
    if (res.status === 401 && auth && (await refreshTokens())) res = await send();
  } catch {
    throw new ApiError(0, "서버에 연결하지 못했어요. 네트워크를 확인해 주세요.");
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    if (res.status === 401 && auth) clearSession();
    throw new ApiError(res.status, errorMessage(res.status, data));
  }
  return data as T;
}

// ---- 인증 ----

type LoginResponse = { accessToken: string; refreshToken: string; user: SessionUser };

export async function login(email: string, password: string, persistent: boolean) {
  const data = await api<LoginResponse>("/auth/login", { method: "POST", body: { email: email.trim(), password }, auth: false });
  saveSession(data.accessToken, data.refreshToken, data.user, persistent);
  return data.user;
}

export function logout() {
  clearSession();
}

export type SignupRequestBody = { email: string; name: string; dept: string; password?: string; major?: string; cohort?: string; message?: string };

export function requestSignup(body: SignupRequestBody) {
  return api<{ id: string; status: string }>("/auth/signup-requests", { method: "POST", body, auth: false });
}

export function requestPasswordReset(email: string) {
  return api<{ accepted: boolean }>("/auth/password-reset-requests", { method: "POST", body: { email: email.trim() }, auth: false });
}

export function resetPassword(token: string, password: string) {
  return api<{ success: boolean }>("/auth/password-reset", { method: "POST", body: { token, password }, auth: false });
}
