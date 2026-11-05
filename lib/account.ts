// 프로필 · 설정: PATCH /me · /me/settings · /me/notification-settings · 브라우저 푸시 구독
import { api } from "./api";
import type { Me } from "./session";

export type ProfileInput = {
  name: string;
  dept: string;
  major: string;
  cohort: string;
  github: string;
  photo: string;
  bio: string;
  interests: string[];
};

export const updateProfile = (patch: Partial<ProfileInput>) => api<Me>("/me", { method: "PATCH", body: patch });

// ---- 화면 · 계정 설정 ----

export type Theme = "시스템" | "라이트" | "다크";
export type UserSettings = { theme: Theme; passwordChangedAt?: string };

export async function fetchSettings(): Promise<UserSettings> {
  const s = await api<Record<string, unknown>>("/me/settings");
  const theme = (["시스템", "라이트", "다크"] as const).find((t) => t === s.theme) ?? "시스템";
  return { theme, passwordChangedAt: typeof s.passwordChangedAt === "string" ? s.passwordChangedAt : undefined };
}

export const saveTheme = (theme: Theme) => api<UserSettings>("/me/settings", { method: "PATCH", body: { theme } });

// 비밀번호를 바꾼 날은 서버가 따로 남기지 않아서 설정 값에 같이 저장해 둔다
export const changePassword = (currentPassword: string, newPassword: string) =>
  api<UserSettings>("/me/settings", {
    method: "PATCH",
    body: { currentPassword, newPassword, passwordChangedAt: new Date().toISOString() },
  });

// app/layout.tsx 의 첫 화면 스크립트가 읽는 자리에도 남겨 깜빡임 없이 같은 테마로 연다
export function applyTheme(theme: Theme) {
  try {
    localStorage.setItem("native-inhouse-settings", JSON.stringify({ theme }));
  } catch {
    // 저장 못 해도 이번 화면에는 적용
  }
  const dark = theme === "다크" || (theme === "시스템" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

// ---- 알림 설정 ----

export const NOTI_KINDS: [string, string][] = [
  ["내 업무", "결재 요청·승인·반려"],
  ["재정", "입금·배분 완료"],
  ["일정", "일정 등록·변경·하루 전 알림"],
  ["공지", "필독 공지"],
  ["규칙 (제도 변경)", "규칙·제도 개정"],
  ["게시판", "내 글의 댓글·공감"],
];
export const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

export type NotiSettings = {
  push: boolean;
  kinds: Record<string, boolean>;
  dnd: boolean;
  dndFrom: string;
  dndTo: string;
  dndDays: string[];
};

export const fetchNotiSettings = () => api<NotiSettings>("/me/notification-settings");
export const saveNotiSettings = (patch: Partial<NotiSettings>) =>
  api<NotiSettings>("/me/notification-settings", { method: "PATCH", body: patch });

// ---- 브라우저 푸시 ----

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export const pushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && typeof Notification !== "undefined";

// 권한 → 서비스 워커 → 구독 → 서버 등록. 실패하면 이유를 담아 던진다
export async function subscribePush(): Promise<void> {
  if (!pushSupported()) throw new Error("이 브라우저는 푸시 알림을 지원하지 않아요.");
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") throw new Error("브라우저에서 알림 권한을 허용해주세요.");
  const { publicKey } = await api<{ publicKey: string }>("/push/vapid-public-key", { auth: false });
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }));
  await api("/push/subscriptions", { method: "POST", body: sub.toJSON() });
}

export async function unsubscribePush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await api("/push/subscriptions", { method: "DELETE", body: { endpoint: sub.endpoint } });
  await sub.unsubscribe();
}
