"use client";

import { useEffect, useState } from "react";
import MyShell, { MyTitle } from "@/components/inhouse/MyShell";
import ProfileAvatar from "@/components/inhouse/ProfileAvatar";
import { useToast } from "@/components/inhouse/ui";
import { PROFILE_EVENT, cropToPortrait, type Profile } from "@/components/inhouse/useProfilePhoto";
import { DEPARTMENTS, ME } from "@/lib/demo";
import { profileKey } from "@/lib/inhouse";

type FullProfile = Profile & { bio: string; interests: string[]; cohort: string };

const MAX_BIO = 60;
const MAX_TAGS = 5;

export default function ProfilePage() {
  const toast = useToast();
  const defaults: FullProfile = {
    name: ME.name,
    email: ME.email,
    department: ME.dept,
    major: "iOS",
    github: ME.github,
    photo: "",
    bio: ME.bio,
    interests: ME.interests,
    cohort: "25기 · 25038",
  };
  const [form, setForm] = useState<FullProfile>(defaults);
  const [tag, setTag] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(profileKey(ME.email));
      if (saved) setForm((f) => ({ ...f, ...JSON.parse(saved) }));
    } catch {
      // 저장된 프로필이 깨졌으면 기본값 사용
    }
  }, []);

  const set = <K extends keyof FullProfile>(k: K, v: FullProfile[K]) => setForm((f) => ({ ...f, [k]: v }));
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
          localStorage.setItem(profileKey(ME.email), JSON.stringify(form));
          window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: { email: ME.email, profile: form } }));
          toast.show("프로필을 저장했어요");
        }}
      >
        <MyTitle eyebrow="PROFILE" title="프로필" sub="팀원 소개와 결재 화면에 보이는 정보예요." right={<button type="submit" className="wd-btn">저장</button>} />
        <div className="wd-card" style={{ padding: 28 }}>
          <div className="wd-row" style={{ gap: 18, marginBottom: 26 }}>
            <ProfileAvatar src={form.photo} className="large" />
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
                      if (file) set("photo", await cropToPortrait(file));
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
              <input className="wd-input" value={form.email} readOnly style={{ color: "#8b95a1" }} />
            </label>
            <label className="wd-field">
              <span>부서</span>
              <select className="wd-input" value={form.department} onChange={(e) => set("department", e.target.value)}>
                {DEPARTMENTS.map((d) => (
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
