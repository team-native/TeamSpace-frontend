import Image from "next/image";

// 사진이 없을 때의 기본 이미지 배경색. 서버 값은 GRAY·BLUE·YELLOW·GREEN·PINK
export const AVATAR_BACKGROUNDS: [string, string][] = [
  ["GRAY", "회색"],
  ["BLUE", "파랑"],
  ["YELLOW", "노랑"],
  ["GREEN", "초록"],
  ["PINK", "분홍"],
];

export default function ProfileAvatar({ src, bg, className = "" }: { src: string; bg?: string; className?: string }) {
  return (
    <span
      className={`pf-profile-avatar ${className} ${src ? "has-photo" : ""}`}
      data-bg={src ? undefined : (bg || "GRAY").toUpperCase()}
      aria-label={src ? "프로필 사진" : "기본 프로필 이미지"}
    >
      {src ? (
        <Image src={src} alt="" fill style={{ objectFit: "cover" }} sizes="96px" unoptimized />
      ) : (
        <>
          <i />
          <span />
        </>
      )}
    </span>
  );
}
