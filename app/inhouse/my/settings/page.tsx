"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import MyShell, { MyTitle } from "@/components/inhouse/MyShell";
import { Modal, useToast } from "@/components/inhouse/ui";
import { loadLocal, saveLocal } from "@/lib/demo";

const KEY = "native-inhouse-settings";
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const KINDS: [string, string][] = [
  ["내 업무", "결재 요청·승인·반려"],
  ["재정", "입금·배분 완료"],
  ["일정", "일정 등록·변경·하루 전 알림"],
  ["공지", "필독 공지와 제도 변경"],
  ["게시판", "내 글의 댓글·공감"],
];

type Settings = {
  theme: "시스템" | "라이트" | "다크";
  push: boolean;
  kinds: Record<string, boolean>;
  dnd: boolean;
  dndFrom: string;
  dndTo: string;
  dndDays: string[];
};

const DEFAULTS: Settings = {
  theme: "시스템",
  push: false,
  kinds: { "내 업무": true, 재정: true, 일정: true, 공지: true, 게시판: false },
  dnd: true,
  dndFrom: "23:00",
  dndTo: "08:00",
  dndDays: ["월", "화", "수", "목", "금"],
};

function Row({ t, s, children }: { t: string; s?: string; children: ReactNode }) {
  return (
    <div className="wd-between" style={{ padding: "16px 0", borderBottom: "1px solid #e5e8eb" }}>
      <div>
        <b className="wd-t12" style={{ fontWeight: 620 }}>{t}</b>
        {s && <p className="wd-t9 wd-faint" style={{ margin: "4px 0 0" }}>{s}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: (v: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={`wd-toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)} />;
}

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ now: "", next: "", again: "" });

  useEffect(() => setS(loadLocal(KEY, DEFAULTS)), []);
  const update = (next: Settings) => {
    setS(next);
    saveLocal(KEY, next);
    const dark = next.theme === "다크" || (next.theme === "시스템" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  };

  const pwError = pw.next && pw.next.length < 8 ? "8자 이상이어야 해요" : pw.again && pw.next !== pw.again ? "새 비밀번호가 서로 달라요" : "";

  return (
    <MyShell>
      <MyTitle eyebrow="SETTINGS" title="설정" />
      <div className="wd-grid g2" style={{ alignItems: "start" }}>
        <div className="wd-stack">
          <section className="wd-card">
            <h3>화면</h3>
            <Row t="테마" s="다크 화면은 디자인 확정 후 적용돼요">
              <div className="wd-tabs">
                {(["시스템", "라이트", "다크"] as const).map((t) => (
                  <button type="button" key={t} className={s.theme === t ? "on" : ""} onClick={() => update({ ...s, theme: t })}>
                    {t}
                  </button>
                ))}
              </div>
            </Row>
          </section>
          <section className="wd-card">
            <h3>계정</h3>
            <Row t="비밀번호 변경" s="마지막 변경 2026.08.12">
              <button type="button" className="wd-btn line sm" onClick={() => setPwOpen(true)}>
                변경
              </button>
            </Row>
            <Row t="재정 정보 권한" s="FA · Leader만 전체 금액을 볼 수 있어요">
              <span className="wd-badge green">전체 열람 가능</span>
            </Row>
            <Row t="로그아웃">
              <button type="button" className="wd-btn ghost sm" onClick={() => router.replace("/inhouse/login")}>
                로그아웃
              </button>
            </Row>
          </section>
        </div>
        <section className="wd-card">
          <h3>알림</h3>
          <Row t="브라우저 푸시" s="탭이 닫혀 있어도 알림을 받아요">
            <Toggle
              on={s.push}
              label="브라우저 푸시"
              onChange={async (v) => {
                if (v && typeof Notification !== "undefined" && Notification.permission !== "granted") {
                  const p = await Notification.requestPermission();
                  if (p !== "granted") {
                    toast.show("브라우저에서 알림 권한을 허용해주세요");
                    return;
                  }
                }
                update({ ...s, push: v });
              }}
            />
          </Row>
          {KINDS.map(([k, d]) => (
            <Row key={k} t={k} s={d}>
              <Toggle on={!!s.kinds[k]} label={`${k} 알림`} onChange={(v) => update({ ...s, kinds: { ...s.kinds, [k]: v } })} />
            </Row>
          ))}
          <div style={{ paddingTop: 16 }}>
            <div className="wd-between">
              <div>
                <b className="wd-t12" style={{ fontWeight: 620 }}>방해 금지 시간</b>
                <p className="wd-t9 wd-faint" style={{ margin: "4px 0 0" }}>이 시간엔 푸시 없이 알림 센터에만 쌓여요</p>
              </div>
              <Toggle on={s.dnd} label="방해 금지 시간" onChange={(v) => update({ ...s, dnd: v })} />
            </div>
            {s.dnd && (
              <>
                <div className="wd-row" style={{ marginTop: 12, gap: 8 }}>
                  <input className="wd-input" type="time" value={s.dndFrom} onChange={(e) => update({ ...s, dndFrom: e.target.value })} aria-label="시작 시간" />
                  <span className="wd-faint">~</span>
                  <input className="wd-input" type="time" value={s.dndTo} onChange={(e) => update({ ...s, dndTo: e.target.value })} aria-label="끝 시간" />
                </div>
                <div className="wd-chips" style={{ marginTop: 10 }}>
                  {DAYS.map((d) => {
                    const on = s.dndDays.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        aria-pressed={on}
                        className={`wd-chip ${on ? "bon" : ""}`}
                        style={{ width: 34, justifyContent: "center", padding: 0 }}
                        onClick={() => update({ ...s, dndDays: on ? s.dndDays.filter((x) => x !== d) : [...s.dndDays, d] })}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {pwOpen && (
        <Modal
          eyebrow="PASSWORD"
          title="비밀번호 변경"
          size="sm"
          onClose={() => setPwOpen(false)}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => setPwOpen(false)}>
                취소
              </button>
              <button
                type="button"
                className="wd-btn"
                disabled={!pw.now || !pw.next || !!pwError || pw.next !== pw.again}
                onClick={() => {
                  setPwOpen(false);
                  setPw({ now: "", next: "", again: "" });
                  toast.show("비밀번호를 바꿨어요");
                }}
              >
                변경하기
              </button>
            </>
          }
        >
          {(
            [
              ["now", "현재 비밀번호"],
              ["next", "새 비밀번호 (8자 이상)"],
              ["again", "새 비밀번호 확인"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="wd-field">
              <span>{label}</span>
              <input className="wd-input" type="password" value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} />
            </label>
          ))}
          {pwError && <p className="wd-t10" style={{ color: "#f04452", margin: 0 }}>{pwError}</p>}
        </Modal>
      )}
      {toast.node}
    </MyShell>
  );
}
