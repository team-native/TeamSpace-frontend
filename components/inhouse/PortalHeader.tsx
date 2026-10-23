"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { profileKey } from "@/lib/inhouse";
import ModalPortal from "./ModalPortal";
import NotificationBell from "./NotificationBell";
import ProfileAvatar from "./ProfileAvatar";
import { PROFILE_EVENT, cropToPortrait, type Profile } from "./useProfilePhoto";

const MENU: [string, string][] = [
  ["홈", "/inhouse"],
  ["재무", "/inhouse/finance"],
  ["결재", "/inhouse/requests"],
  ["문서함", "/inhouse/documents"],
  ["팀원 소개", "/inhouse/team"],
  ["커뮤니티", "/inhouse/community"],
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
  const [editorOpen, setEditorOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>(defaults);
  const [draft, setDraft] = useState<Profile>(defaults);
  const memberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(profileKey(member.email));
      const next = saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
      setProfile(next);
      setDraft(next);
    } catch {
      setProfile(defaults);
      setDraft(defaults);
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
              <button
                className="pf-profile-edit"
                role="menuitem"
                onClick={() => {
                  setDraft(profile);
                  setMenuOpen(false);
                  setEditorOpen(true);
                }}
              >
                <span>
                  <b>프로필 수정</b>
                  <small>내 정보와 소속 변경하기</small>
                </span>
                <i aria-hidden="true">→</i>
              </button>
              <Link className="pf-profile-edit" role="menuitem" href="/inhouse/my" onClick={() => setMenuOpen(false)}>
                <span>
                  <b>내 공간</b>
                  <small>나에게 온 결재 · 일정 · 설정</small>
                </span>
                <i aria-hidden="true">→</i>
              </Link>
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

      {editorOpen && (
        <ModalPortal>
          <div className="pf-modal-bg" onMouseDown={(e) => e.target === e.currentTarget && setEditorOpen(false)}>
            <section className="pf-profile-editor" role="dialog" aria-modal="true" aria-label="프로필 수정">
              <header>
                <div>
                  <span>MY PROFILE</span>
                  <h2>프로필 수정</h2>
                </div>
                <button type="button" onClick={() => setEditorOpen(false)} aria-label="닫기">
                  ×
                </button>
              </header>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  localStorage.setItem(profileKey(member.email), JSON.stringify(draft));
                  setProfile(draft);
                  window.dispatchEvent(
                    new CustomEvent(PROFILE_EVENT, { detail: { email: member.email, profile: draft } }),
                  );
                  setEditorOpen(false);
                }}
              >
                <div className="pf-profile-photo-editor">
                  <ProfileAvatar src={draft.photo} className="editor" />
                  <div>
                    <b>증명사진</b>
                    <small>정면 사진을 선택하면 4:5 비율로 맞춰져요.</small>
                    <span>
                      <label>
                        사진 선택
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) setDraft({ ...draft, photo: await cropToPortrait(file) });
                          }}
                        />
                      </label>
                      {draft.photo && (
                        <button type="button" onClick={() => setDraft({ ...draft, photo: "" })}>
                          사진 삭제
                        </button>
                      )}
                    </span>
                  </div>
                </div>
                <div className="pf-form-row">
                  <label>
                    <span>이름</span>
                    <input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                  </label>
                  <label>
                    <span>이메일</span>
                    <input
                      required
                      type="email"
                      value={draft.email}
                      onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    />
                  </label>
                </div>
                <div className="pf-form-row">
                  <label>
                    <span>소속 부서</span>
                    <input
                      value={draft.department}
                      placeholder="없으면 무소속"
                      onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>전공</span>
                    <input
                      value={draft.major}
                      placeholder="예: iOS"
                      onChange={(e) => setDraft({ ...draft, major: e.target.value })}
                    />
                  </label>
                </div>
                <label>
                  <span>GitHub</span>
                  <input
                    value={draft.github}
                    placeholder="github.com/username"
                    onChange={(e) => setDraft({ ...draft, github: e.target.value })}
                  />
                </label>
                <p>수정한 프로필과 사진은 현재 브라우저에 저장돼요.</p>
                <footer>
                  <button type="button" onClick={() => setEditorOpen(false)}>
                    취소
                  </button>
                  <button type="submit">저장하기</button>
                </footer>
              </form>
            </section>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
