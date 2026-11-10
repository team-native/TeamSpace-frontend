"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { profileKey } from "@/lib/inhouse";
import NotificationBell from "./NotificationBell";
import ProfileAvatar from "./ProfileAvatar";
import { PROFILE_EVENT, type Profile } from "./useProfilePhoto";
import { isStaff, signOut, useMe } from "@/lib/session";

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
// 운영진(Leader · NativeOps · FA)에게만 보이는 메뉴
const ADMIN_MENU: [string, string, string] = ["운영 관리", "공지 · 문의 · 신고 · 재정", "/inhouse/admin"];

// 페이지마다 헤더가 새로 그려져서, 밑줄이 어디서 출발할지 모듈에 기억해 둔다
let lastBar: { x: number; w: number } | null = null;

const isActive = (pathname: string, href: string) =>
  href === "/inhouse" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

export default function PortalHeader({ member }: { member: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const { me } = useMe();
  const defaults: Profile = {
    name: me?.name ?? member.name,
    email: me?.email ?? member.email,
    department: me?.dept ?? "",
    major: me?.major ?? "",
    github: me?.github ?? "",
    photo: me?.photo ?? "",
    avatarBackground: me?.avatarBackground ?? "",
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>(defaults);
  const memberRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  // 링크 아래로 밑줄을 옮긴다. 옮길 링크가 없으면(내 공간 등) 숨긴다
  const moveBar = useCallback((link: HTMLElement | null) => {
    const bar = barRef.current;
    if (!bar) return;
    if (!link) {
      bar.style.opacity = "0";
      return;
    }
    const x = link.offsetLeft + 12;
    const w = link.offsetWidth - 24;
    bar.style.opacity = "1";
    bar.style.width = `${w}px`;
    bar.style.transform = `translateX(${x}px)`;
    lastBar = { x, w };
  }, []);
  const activeLink = useCallback(() => navRef.current?.querySelector<HTMLElement>("a.active") ?? null, []);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    // 이전 페이지 위치에 먼저 놓고, 다음 프레임에 현재 메뉴로 미끄러지게 한다
    bar.style.transition = "none";
    if (lastBar) {
      bar.style.width = `${lastBar.w}px`;
      bar.style.transform = `translateX(${lastBar.x}px)`;
      bar.style.opacity = "1";
    } else {
      moveBar(activeLink());
    }
    void bar.offsetWidth;
    bar.style.transition = "";
    moveBar(activeLink());
    document.fonts?.ready.then(() => moveBar(activeLink()));
  }, [pathname, moveBar, activeLink]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(profileKey(member.email));
      // 이름 · 이메일은 서버 값이 우선, 사진 등은 프로필 화면이 서버에 붙기 전까지 기기에 저장한 값 사용
      const next = saved ? { ...defaults, ...JSON.parse(saved), name: defaults.name, email: defaults.email } : defaults;
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
  }, [member.email, member.name, me]);

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
        <nav aria-label="인하우스 메뉴" ref={navRef} onMouseLeave={() => moveBar(activeLink())}>
          {MENU.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={isActive(pathname, href) ? "active" : ""}
              onMouseEnter={(e) => moveBar(e.currentTarget)}
              onFocus={(e) => moveBar(e.currentTarget)}
              onBlur={() => moveBar(activeLink())}
            >
              {label}
            </Link>
          ))}
          <span className="pf-nav-bar" ref={barRef} aria-hidden="true" />
        </nav>
        <div className="pf-member" ref={memberRef}>
          <NotificationBell onOpen={() => setMenuOpen(false)} />
          <button
            className={`pf-profile-trigger ${menuOpen ? "open" : ""}`}
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <ProfileAvatar src={profile.photo} bg={profile.avatarBackground} />
            <span className="pf-profile-copy">
              <b>{profile.name}</b>
              <small>{profile.email}</small>
            </span>
            <i className="pf-profile-chevron" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className="pf-profile-menu" role="menu">
              <div className="pf-profile-account">
                <ProfileAvatar src={profile.photo} bg={profile.avatarBackground} className="large" />
                <div>
                  <b>{profile.name}</b>
                  <small>{profile.email}</small>
                  <em>
                    {profile.department || "무소속"} · {profile.major || "전공 미등록"}
                  </em>
                </div>
              </div>
              {(isStaff(me) ? [...PROFILE_MENU, ADMIN_MENU] : PROFILE_MENU).map(([title, desc, href]) => (
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
                  signOut();
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
