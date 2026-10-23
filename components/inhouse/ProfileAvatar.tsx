import Image from "next/image";

export default function ProfileAvatar({ src, className = "" }: { src: string; className?: string }) {
  return (
    <span
      className={`pf-profile-avatar ${className} ${src ? "has-photo" : ""}`}
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
