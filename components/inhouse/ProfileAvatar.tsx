import Image from "next/image";
import type { AuthorProfile } from "@/lib/shared";

// 사진이 없을 때의 기본 이미지 배경색. 서버 값은 GRAY·BLUE·YELLOW·GREEN·PINK
export const AVATAR_BACKGROUNDS: [string, string][] = [
  ["GRAY", "회색"],
  ["BLUE", "파랑"],
  ["YELLOW", "노랑"],
  ["GREEN", "초록"],
  ["PINK", "분홍"],
];

export default function ProfileAvatar({ src, bg, className = "", size, label }: { src: string; bg?: string; className?: string; size?: number; label?: string }) {
  return (
    <span
      className={`pf-profile-avatar ${className} ${src ? "has-photo" : ""}`}
      style={size ? { width: size, height: size, flex: "none" } : undefined}
      data-bg={src ? undefined : (bg || "GRAY").toUpperCase()}
      role="img"
      aria-label={label ?? (src ? "프로필 사진" : "기본 프로필 이미지")}
    >
      {src ? (
        <Image src={src} alt="" fill style={{ objectFit: "cover" }} sizes={`${size ?? 96}px`} unoptimized />
      ) : (
        <>
          <i />
          <span />
        </>
      )}
    </span>
  );
}

// 게시판 · 댓글 · 제안의 작성자 사진
// 익명 → 기본 이미지, 서버가 프로필을 주면 사진(없으면 고른 배경색의 기본 이미지), 아직 안 주면 이름 첫 글자
export function AuthorAvatar({ name, profile, anonymous, size = 24 }: { name: string; profile?: AuthorProfile | null; anonymous?: boolean; size?: number }) {
  if (anonymous) return <ProfileAvatar src="" bg="GRAY" size={size} label="익명" />;
  if (profile) return <ProfileAvatar src={profile.photo} bg={profile.bg} size={size} label={name} />;
  return (
    <span className="wd-av" style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }} aria-label={name}>
      {[...name.trim()][0] ?? "?"}
    </span>
  );
}
