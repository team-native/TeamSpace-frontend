// 여러 화면이 같이 쓰는 타입 · 상수 · 브라우저 저장 함수
export type Tone = "" | "blue" | "green" | "orange" | "red" | "violet" | "dark";

export const DEPARTMENTS = ["Leader", "NativeOps", "PMO", "FA", "Core Platform", "Design", "NativeLab"] as const;

export type NotiKind = "내 업무" | "재정" | "일정" | "공지";

export const initial = (name: string) => (name.length >= 3 ? name.slice(1, 2) : name.slice(0, 1));

// 같은 사람은 어느 화면에서나 같은 아바타 색
const AV_TONES: Tone[] = ["blue", "green", "orange", "violet", "red", "dark"];
export function toneOf(id: string): Tone {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return AV_TONES[Math.abs(h) % AV_TONES.length];
}

// 임시 저장 · 최근 본 문서처럼 이 브라우저에만 두는 값
export function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장소를 못 쓰는 환경이면 화면 상태만 유지
  }
}

// ---- 작성자 프로필 ----

export type AuthorProfile = { photo: string; bg: string };

type RawProfile = { photo?: unknown; avatarBackground?: unknown; avatar_background?: unknown } | null | undefined;

// 서버 응답에서 작성자 프로필 꺼내기 (authorProfile · author 객체 · authorPhoto 어느 모양이든)
export function readAuthorProfile(raw: Record<string, unknown>): AuthorProfile | null {
  const obj = (raw.authorProfile ?? (typeof raw.author === "object" ? raw.author : null)) as RawProfile;
  const photo = obj?.photo ?? raw.authorPhoto;
  const bg = obj?.avatarBackground ?? obj?.avatar_background ?? raw.authorAvatarBackground;
  if (photo === undefined && bg === undefined) return null;
  return { photo: typeof photo === "string" ? photo : "", bg: typeof bg === "string" ? bg.toUpperCase() : "GRAY" };
}
