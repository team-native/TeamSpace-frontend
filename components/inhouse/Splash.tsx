"use client";

import { useEffect, useState } from "react";

const SEEN = "native-splash-seen";
const MIN_MS = 900; // 처음 열 때 로고를 보여주는 최소 시간
const FADE_MS = 320;

// 로고 스플래시: 이 탭에서 처음 열 때, 그리고 로그인 확인처럼 화면이 아직 준비되지 않았을 때 덮는다
export default function Splash({ ready }: { ready: boolean }) {
  // 페이지를 처음 받을 때 한 번 덮는다. 이 탭에서 처음이면 로고를 잠깐 더 보여준다
  const [minDone, setMinDone] = useState(false);
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    let first = false;
    try {
      first = !sessionStorage.getItem(SEEN);
      sessionStorage.setItem(SEEN, "1");
    } catch {}
    if (!first) {
      setMinDone(true);
      return;
    }
    const t = setTimeout(() => setMinDone(true), MIN_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || !minDone) return;
    setPhase("fade");
    const t = setTimeout(() => setPhase("gone"), FADE_MS);
    return () => clearTimeout(t);
  }, [ready, minDone]);

  if (phase === "gone") return null;
  return (
    <div className={`t-splash ${phase === "fade" ? "out" : ""}`} role="status" aria-live="polite" aria-label="Native 불러오는 중">
      <div className="t-splash-mark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/native-logo.png" alt="" width={84} height={84} />
        <b>Native</b>
        <span className="t-splash-bar" aria-hidden>
          <i />
        </span>
      </div>
    </div>
  );
}
