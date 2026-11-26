"use client";

import Image from "next/image";
import type { AuthorProfile } from "@/lib/shared";
import { useMe } from "@/lib/session";
import { photoUrl } from "@/lib/api";
import { findPhoto, usePhotoBook } from "@/lib/avatars";

// 사진이 없을 때의 기본 이미지 배경색. 서버 값은 WHITE·GRAY·BLUE·YELLOW·GREEN·PINK
export const AVATAR_BACKGROUNDS: [string, string][] = [
  ["WHITE", "흰색"],
  ["GRAY", "회색"],
  ["BLUE", "파랑"],
  ["YELLOW", "노랑"],
  ["GREEN", "초록"],
  ["PINK", "분홍"],
];

export default function ProfileAvatar({ src: raw, bg, className = "", size, label }: { src: string; bg?: string; className?: string; size?: number; label?: string }) {
  const src = photoUrl(raw);
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

// 구성원 사진: 직접 준 사진 → 내 계정이면 내 프로필 → /people 에서 찾은 사진 → 기본 이미지
export function MemberAvatar({ name, memberId, profile, size = 34 }: { name: string; memberId?: string; profile?: AuthorProfile | null; size?: number }) {
  const { me } = useMe();
  const book = usePhotoBook();
  const isMe = !!me && !!name && me.name === name;
  const p = (profile?.photo ? profile : null) ?? (isMe ? { photo: me.photo ?? "", bg: (me.avatarBackground || "GRAY").toUpperCase() } : null) ?? findPhoto(book, { memberId, name }) ?? profile;
  return <ProfileAvatar src={p?.photo ?? ""} bg={p?.bg ?? "GRAY"} size={size} label={name || undefined} />;
}

// 게시판 · 댓글 · 제안의 작성자 사진. 익명은 항상 기본 이미지
export function AuthorAvatar({ name, profile, anonymous, mine, size = 24 }: { name: string; profile?: AuthorProfile | null; anonymous?: boolean; mine?: boolean; size?: number }) {
  const { me } = useMe();
  if (anonymous) return <ProfileAvatar src="" bg="GRAY" size={size} label="익명" />;
  return <MemberAvatar name={mine && me ? me.name : name} profile={profile} size={size} />;
}
