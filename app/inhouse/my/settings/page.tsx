"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import MyShell, { MyTitle } from "@/components/inhouse/MyShell";
import { Modal, useToast } from "@/components/inhouse/ui";
import {
  DAYS,
  NOTI_KINDS,
  applyTheme,
  changePassword,
  fetchNotiSettings,
  fetchSettings,
  pushSupported,
  saveNotiSettings,
  saveTheme,
  subscribePush,
  unsubscribePush,
  type NotiSettings,
  type Theme,
} from "@/lib/account";
import { canFinance, signOut, useMe } from "@/lib/session";

function Row({ t, s, children }: { t: string; s?: string; children: ReactNode }) {
  return (
    <div className="wd-between t-set-row">
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
  const { me } = useMe();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [pwChanged, setPwChanged] = useState("");
  const [noti, setNoti] = useState<NotiSettings | null>(null);
  const [error, setError] = useState("");
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ now: "", next: "", again: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwServerError, setPwServerError] = useState("");
  const [pushBusy, setPushBusy] = useState(false);
  const notiRef = useRef<NotiSettings | null>(null);
  const notiReq = useRef(0);
  notiRef.current = noti;

  const load = useCallback(async () => {
    setError("");
    try {
      const [st, ns] = await Promise.all([fetchSettings(), fetchNotiSettings()]);
      setTheme(st.theme);
      applyTheme(st.theme);
      setPwChanged(st.passwordChangedAt ? st.passwordChangedAt.slice(0, 10).replace(/-/g, ".") : "");
      setNoti(ns);
    } catch (e) {
      setError(e instanceof Error ? e.message : "설정을 불러오지 못했어요.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeTheme = async (t: Theme) => {
    const prev = theme;
    setTheme(t);
    applyTheme(t);
    try {
      await saveTheme(t);
    } catch (e) {
      if (prev) {
        setTheme(prev);
        applyTheme(prev);
      }
      toast.show(e instanceof Error ? e.message : "테마를 저장하지 못했어요.");
    }
  };

  // 바로 화면에 반영하고, 실패하면 되돌린다.
  // kinds는 일부만 보내면 나머지 항목이 초기값으로 돌아갈 수 있어 항상 전체를 보낸다.
  // 연달아 누르면 마지막 요청의 응답만 화면에 반영한다.
  const patchNoti = async (patch: Partial<NotiSettings>) => {
    const prev = notiRef.current;
    if (!prev) return false;
    const next = { ...prev, ...patch, kinds: { ...prev.kinds, ...(patch.kinds ?? {}) } };
    notiRef.current = next;
    setNoti(next);
    const id = ++notiReq.current;
    try {
      const saved = await saveNotiSettings(patch.kinds ? { ...patch, kinds: next.kinds } : patch);
      if (id === notiReq.current) setNoti(saved);
      return true;
    } catch (e) {
      if (id === notiReq.current) setNoti(prev);
      toast.show(e instanceof Error ? e.message : "알림 설정을 저장하지 못했어요.");
      return false;
    }
  };

  const togglePush = async (v: boolean) => {
    if (pushBusy) return;
    setPushBusy(true);
    try {
      if (v) await subscribePush();
      else await unsubscribePush().catch(() => {});
      if (await patchNoti({ push: v })) toast.show(v ? "브라우저 푸시를 켰어요" : "브라우저 푸시를 껐어요");
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "푸시를 켜지 못했어요.");
    } finally {
      setPushBusy(false);
    }
  };

  const submitPassword = async () => {
    if (pwSaving) return;
    setPwSaving(true);
    setPwServerError("");
    try {
      await changePassword(pw.now, pw.next);
      setPwOpen(false);
      setPw({ now: "", next: "", again: "" });
      setPwChanged(new Date().toISOString().slice(0, 10).replace(/-/g, "."));
      toast.show("비밀번호를 바꿨어요");
    } catch (e) {
      setPwServerError(e instanceof Error ? e.message : "비밀번호를 바꾸지 못했어요.");
    } finally {
      setPwSaving(false);
    }
  };

  const pwError = pw.next && pw.next.length < 8 ? "8자 이상이어야 해요" : pw.again && pw.next !== pw.again ? "새 비밀번호가 서로 달라요" : "";
  const finance = canFinance(me);

  return (
    <MyShell>
      <MyTitle eyebrow="SETTINGS" title="설정" />
      {error && (
        <div className="wd-banner danger" style={{ marginBottom: 18 }}>
          <span className="ico">!</span>
          <div>
            <b>{error}</b>
          </div>
          <button type="button" className="wd-btn sm" onClick={load}>
            다시 시도
          </button>
        </div>
      )}
      <div className="wd-grid g2" style={{ alignItems: "start" }}>
        <div className="wd-stack">
          <section className="wd-card">
            <h3>화면</h3>
            <Row t="테마" s="시스템을 고르면 기기 설정을 따라가요">
              <div className="wd-tabs">
                {(["시스템", "라이트", "다크"] as const).map((t) => (
                  <button type="button" key={t} className={theme === t ? "on" : ""} disabled={!theme} onClick={() => changeTheme(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </Row>
          </section>
          <section className="wd-card">
            <h3>계정</h3>
            <Row t="비밀번호 변경" s={pwChanged ? `마지막 변경 ${pwChanged}` : "8자 이상으로 바꿀 수 있어요"}>
              <button type="button" className="wd-btn line sm" onClick={() => setPwOpen(true)}>
                변경
              </button>
            </Row>
            <Row t="재정 정보 권한" s="Admin · FA · Leader만 전체 금액을 볼 수 있어요">
              <span className={`wd-badge ${finance ? "green" : ""}`}>{finance ? "전체 열람 가능" : "요약만 열람"}</span>
            </Row>
            <Row t="로그아웃">
              <button type="button" className="wd-btn ghost sm" onClick={() => {
                  signOut();
                  router.replace("/inhouse/login");
                }}>
                로그아웃
              </button>
            </Row>
          </section>
        </div>
        <section className="wd-card">
          <h3>알림</h3>
          {!noti && !error && <p className="wd-t10 wd-faint" aria-busy="true">불러오는 중이에요…</p>}
          {noti && (
            <>
              <Row t="브라우저 푸시" s={pushSupported() ? "탭이 닫혀 있어도 알림을 받아요" : "이 브라우저는 푸시를 지원하지 않아요"}>
                <Toggle on={noti.push} label="브라우저 푸시" onChange={togglePush} />
              </Row>
              {NOTI_KINDS.map(([k, d]) => (
                <Row key={k} t={k} s={d}>
                  <Toggle on={noti.kinds[k] !== false} label={`${k} 알림`} onChange={(v) => patchNoti({ kinds: { [k]: v } })} />
                </Row>
              ))}
              <div style={{ paddingTop: 16 }}>
                <div className="wd-between">
                  <div>
                    <b className="wd-t12" style={{ fontWeight: 620 }}>방해 금지 시간</b>
                    <p className="wd-t9 wd-faint" style={{ margin: "4px 0 0" }}>이 시간엔 푸시 없이 알림 센터에만 쌓여요</p>
                  </div>
                  <Toggle on={noti.dnd} label="방해 금지 시간" onChange={(v) => patchNoti({ dnd: v })} />
                </div>
                {noti.dnd && (
                  <>
                    <div className="wd-row" style={{ marginTop: 12, gap: 8 }}>
                      <input className="wd-input" type="time" defaultValue={noti.dndFrom} key={`f${noti.dndFrom}`} onBlur={(e) => e.target.value && e.target.value !== noti.dndFrom && patchNoti({ dndFrom: e.target.value })} aria-label="시작 시간" />
                      <span className="wd-faint">~</span>
                      <input className="wd-input" type="time" defaultValue={noti.dndTo} key={`t${noti.dndTo}`} onBlur={(e) => e.target.value && e.target.value !== noti.dndTo && patchNoti({ dndTo: e.target.value })} aria-label="끝 시간" />
                    </div>
                    <div className="wd-chips" style={{ marginTop: 10 }}>
                      {DAYS.map((d) => {
                        const on = noti.dndDays.includes(d);
                        return (
                          <button
                            type="button"
                            key={d}
                            aria-pressed={on}
                            className={`wd-chip ${on ? "bon" : ""}`}
                            style={{ width: 34, justifyContent: "center", padding: 0 }}
                            onClick={() => patchNoti({ dndDays: on ? noti.dndDays.filter((x) => x !== d) : DAYS.filter((x) => x === d || noti.dndDays.includes(x)) })}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {pwOpen && (
        <Modal
          eyebrow="PASSWORD"
          title="비밀번호 변경"
          size="sm"
          onClose={() => {
            setPwOpen(false);
            setPwServerError("");
          }}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => { setPwOpen(false); setPwServerError(""); }}>
                취소
              </button>
              <button
                type="button"
                className="wd-btn"
                disabled={!pw.now || !pw.next || !!pwError || pw.next !== pw.again || pwSaving}
                aria-busy={pwSaving}
                onClick={submitPassword}
              >
                {pwSaving ? "바꾸는 중…" : "변경하기"}
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
          {(pwError || pwServerError) && <p className="wd-t10" role="alert" style={{ color: "var(--t-red)", margin: 0 }}>{pwError || pwServerError}</p>}
        </Modal>
      )}
      {toast.node}
    </MyShell>
  );
}
