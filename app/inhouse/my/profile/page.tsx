"use client";

import { useEffect, useMemo, useState } from "react";
import MyShell, { MyTitle } from "@/components/inhouse/MyShell";
import ProfileAvatar, { AVATAR_BACKGROUNDS } from "@/components/inhouse/ProfileAvatar";
import { useToast } from "@/components/inhouse/ui";
import { PROFILE_EVENT, cropToPortrait, type Profile } from "@/components/inhouse/useProfilePhoto";
import { DEPARTMENTS } from "@/lib/shared";
import { profileKey } from "@/lib/inhouse";
import { updateProfile, type ProfileInput } from "@/lib/account";
import { loadMe, useMe, type Me } from "@/lib/session";

type FullProfile = Profile & { avatarBackground: string; bio: string; interests: string[]; cohort: string };

const fromMe = (me: Me): FullProfile => ({
  name: me.name ?? "",
  email: me.email ?? "",
  department: me.dept ?? "",
  major: me.major ?? "",
  github: me.github ?? "",
  photo: me.photo ?? "",
  avatarBackground: (me.avatarBackground || "GRAY").toUpperCase(),
  bio: me.bio ?? "",
  interests: me.interests ?? [],
  cohort: me.cohort ?? "",
});

// 서버에는 바뀐 항목만 보낸다
function diff(a: FullProfile, b: FullProfile): Partial<ProfileInput> {
  const out: Partial<ProfileInput> = {};
  if (a.name.trim() !== b.name) out.name = a.name.trim();
  if (a.department !== b.department) out.dept = a.department;
  if (a.major.trim() !== b.major) out.major = a.major.trim();
  if (a.cohort.trim() !== b.cohort) out.cohort = a.cohort.trim();
  if (a.github.trim() !== b.github) out.github = a.github.trim();
  if (a.photo !== b.photo) out.photo = a.photo;
  if (a.avatarBackground !== b.avatarBackground) out.avatarBackground = a.avatarBackground;
  if (a.bio.trim() !== b.bio) out.bio = a.bio.trim();
  if (a.interests.join("\u0000") !== b.interests.join("\u0000")) out.interests = a.interests;
  return out;
}

const MAX_BIO = 60;
const MAX_TAGS = 5;

export default function ProfilePage() {
  const toast = useToast();
  const { me } = useMe();
  const saved = useMemo(() => (me ? fromMe(me) : null), [me]);
  const [form, setForm] = useState<FullProfile | null>(null);
  const [tag, setTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (saved) setForm((f) => f ?? saved);
  }, [saved]);

  const departments = useMemo(
    () => Array.from(new Set([...(saved?.department ? [saved.department] : []), ...DEPARTMENTS])),
    [saved],
  );

  if (!form || !saved) {
    return (
      <MyShell>
        <p className="wd-t11 wd-faint" aria-busy="true">
          프로필을 불러오는 중이에요…
        </p>
      </MyShell>
    );
  }

  const changes = diff(form, saved);
  const dirty = Object.keys(changes).length > 0;

  const save = async () => {
    if (saving) return;
    if (!dirty) {
      toast.show("바뀐 내용이 없어요");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const next = await updateProfile(changes);
      await loadMe(true);
      const profile = fromMe(next);
      setForm(profile);
      // 예전에 기기에만 저장한 프로필은 지우고 서버 값으로 머리글을 맞춘다
      try {
        localStorage.removeItem(profileKey(profile.email));
      } catch {
        // 무시
      }
      window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: { email: profile.email, profile } }));
      toast.show("프로필을 저장했어요");
    } catch (e) {
      setError(e instanceof Error ? e.message : "프로필을 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof FullProfile>(k: K, v: FullProfile[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const addTag = () => {
    const t = tag.trim().replace(/^#/, "");
    if (t && !form.interests.includes(t) && form.interests.length < MAX_TAGS) set("interests", [...form.interests, t]);
    setTag("");
  };

  return (
    <MyShell>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <MyTitle
          eyebrow="PROFILE"
          title="프로필"
          sub="팀원 소개와 결재 화면에 보이는 정보예요."
          right={
            <button type="submit" className="wd-btn" disabled={saving || !dirty} aria-busy={saving}>
              {saving ? "저장 중…" : "저장"}
            </button>
          }
        />
        {error && (
          <div className="wd-banner danger" role="alert" style={{ marginBottom: 18 }}>
            <span className="ico">!</span>
            <div>
              <b>{error}</b>
            </div>
          </div>
        )}
        <div className="wd-card" style={{ padding: 28 }}>
          <div className="wd-row" style={{ gap: 18, marginBottom: 26 }}>
            <ProfileAvatar src={form.photo} bg={form.avatarBackground} className="large" />
            <div>
              <div className="wd-row" style={{ gap: 6 }}>
                <label className="wd-btn line sm" style={{ cursor: "pointer" }}>
                  사진 바꾸기
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      try {
                        // 서버에 그대로 저장되니 작게 줄여서 보낸다
                        set("photo", await cropToPortrait(file, 320, 0.8));
                      } catch (err) {
                        toast.show(err instanceof Error ? err.message : "사진을 읽지 못했어요.");
                      }
                    }}
                  />
                </label>
                {form.photo && (
                  <button type="button" className="wd-btn ghost sm" onClick={() => set("photo", "")}>
                    기본 이미지
                  </button>
                )}
              </div>
              <p className="wd-t9 wd-faint" style={{ margin: "8px 0 0" }}>JPG · PNG · 4:5로 잘려요</p>
              {!form.photo && (
                <div className="t-avatar-bg" role="radiogroup" aria-label="기본 이미지 배경색">
                  {AVATAR_BACKGROUNDS.map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={form.avatarBackground === v}
                      aria-label={label}
                      data-bg={v}
                      onClick={() => set("avatarBackground", v)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="wd-grid g2">
            <label className="wd-field">
              <span>이름</span>
              <input className="wd-input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
            </label>
            <label className="wd-field">
              <span>
                이메일 <em>변경 불가</em>
              </span>
              <input className="wd-input" value={form.email} readOnly style={{ color: "var(--t-faint)" }} />
            </label>
            <label className="wd-field">
              <span>부서</span>
              <select className="wd-input" value={form.department} onChange={(e) => set("department", e.target.value)}>
                {!form.department && <option value="">선택해 주세요</option>}
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="wd-field">
              <span>전공 · 직군</span>
              <input className="wd-input" value={form.major} onChange={(e) => set("major", e.target.value)} placeholder="예: iOS" />
            </label>
            <label className="wd-field">
              <span>GitHub</span>
              <input className="wd-input" value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="@username" />
            </label>
            <label className="wd-field">
              <span>기수 · 학번</span>
              <input className="wd-input" value={form.cohort} onChange={(e) => set("cohort", e.target.value)} />
            </label>
          </div>
          <label className="wd-field">
            <span>
              한 줄 소개 <em>{form.bio.length} / {MAX_BIO}</em>
            </span>
            <input className="wd-input" maxLength={MAX_BIO} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="팀원들에게 나를 한 줄로 소개해요" />
          </label>
          <div className="wd-field" style={{ marginBottom: 0 }}>
            <span>
              관심사 <em>최대 {MAX_TAGS}개</em>
            </span>
            <div className="wd-chips">
              {form.interests.map((c) => (
                <button type="button" key={c} className="wd-chip bon" aria-label={`${c} 삭제`} onClick={() => set("interests", form.interests.filter((x) => x !== c))}>
                  #{c} ×
                </button>
              ))}
              {form.interests.length < MAX_TAGS && (
                <input
                  className="wd-input"
                  style={{ width: 140, minHeight: 30, borderRadius: 15, borderStyle: "dashed" }}
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  placeholder="+ 추가 (Enter)"
                />
              )}
            </div>
          </div>
        </div>
      </form>
      {toast.node}
    </MyShell>
  );
}
