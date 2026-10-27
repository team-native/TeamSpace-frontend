"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { profileKey } from "@/lib/inhouse";
import NotificationBell from "./NotificationBell";
import ProfileAvatar from "./ProfileAvatar";
import { PROFILE_EVENT, type Profile } from "./useProfilePhoto";

const MENU: [string, string][] = [
  ["홈", "/inhouse"],
  ["재무", "/inhouse/finance"],
  ["결재", "/inhouse/requests"],
  ["문서함", "/inhouse/documents"],
  ["팀원 소개", "/inhouse/team"],
  ["커뮤니티", "/inhouse/community"],
];

const PROFILE_MENU: [string, string, string][] = [
  ["내 공간", "나에게 온 결재 · 일정", "/inhouse/my"],
  ["프로필 수정", "사진 · 소개 · 관심사", "/inhouse/my/profile"],
  ["설정", "알림 · 테마 · 비밀번호", "/inhouse/my/settings"],
];

const isActive = (pathname: string, href: string) =>
  href === "/inhouse" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

export default function PortalHeader({ member }: { member: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const defaults: Profile = {
    name: member.name,
    email: member.email,
    department: "Core Platform",
    major: "iOS",
    github: "",
    photo: "",
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>(defaults);
  const memberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(profileKey(member.email));
      const next = saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
      setProfile(next);
    } catch {
      setProfile(defaults);
    }
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ email: string; profile: Profile }>).detail;
      if (detail?.email === member.email) setProfile((p) => ({ ...p, ...detail.profile }));
    };
    window.addEventListener(PROFILE_EVENT, onUpdate);
    return () => window.removeEventListener(PROFILE_EVENT, onUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.email, member.name]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!memberRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="pf-header">
        <Link href="/inhouse" className="pf-brand">
          <span>
            <Image src="/native-logo.png" alt="Native" fill style={{ objectFit: "cover" }} sizes="30px" unoptimized />
          </span>
          <b>Native</b>
        </Link>
        <nav aria-label="인하우스 메뉴">
          {MENU.map(([label, href]) => (
            <Link key={href} href={href} className={isActive(pathname, href) ? "active" : ""}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="pf-member" ref={memberRef}>
          <NotificationBell />
          <button
            className={`pf-profile-trigger ${menuOpen ? "open" : ""}`}
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <ProfileAvatar src={profile.photo} />
            <span className="pf-profile-copy">
              <b>{profile.name}</b>
              <small>{profile.email}</small>
            </span>
            <i className="pf-profile-chevron" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className="pf-profile-menu" role="menu">
              <div className="pf-profile-account">
                <ProfileAvatar src={profile.photo} className="large" />
                <div>
                  <b>{profile.name}</b>
                  <small>{profile.email}</small>
                  <em>
                    {profile.department || "무소속"} · {profile.major || "전공 미등록"}
                  </em>
                </div>
              </div>
              {PROFILE_MENU.map(([title, desc, href]) => (
                <Link key={href} className="pf-profile-edit" role="menuitem" href={href} onClick={() => setMenuOpen(false)}>
                  <span>
                    <b>{title}</b>
                    <small>{desc}</small>
                  </span>
                  <i aria-hidden="true">→</i>
                </Link>
              ))}
              <button
                className="pf-profile-logout"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  router.replace("/inhouse/login");
                }}
              >
                <span>
                  <b>로그아웃</b>
                  <small>현재 계정에서 나가기</small>
                </span>
                <i aria-hidden="true" />
              </button>
            </div>
          )}
          <button
            className="pf-menu-button"
            aria-label="메뉴 열기"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <i />
            <i />
          </button>
        </div>
        {mobileOpen && (
          <nav className="pf-mobile-menu" aria-label="모바일 인하우스 메뉴">
            {MENU.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={isActive(pathname, href) ? "active" : ""}
              >
                {label}
                <span>→</span>
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
