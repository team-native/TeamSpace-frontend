"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { resetPassword } from "@/lib/api";

// 비밀번호 재설정 메일의 링크(/inhouse/reset-password?token=...)로 들어오는 화면 · POST /auth/password-reset
function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!token) {
    return (
      <div className="pf-login-form">
        <h1>링크를 확인해 주세요</h1>
        <p>재설정 링크가 올바르지 않아요. 로그인 화면에서 메일을 다시 받아주세요.</p>
        <Link className="pf-login-submit" href="/inhouse/login" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}>
          로그인 화면으로
        </Link>
      </div>
    );
  }

  return (
    <form
      className="pf-login-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy || done) return;
        setError("");
        if (password !== confirm) {
          setError("두 비밀번호가 같지 않아요.");
          return;
        }
        setBusy(true);
        try {
          await resetPassword(token, password);
          setDone(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "비밀번호를 바꾸지 못했어요.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="pf-login-logo">
        <Image src="/native-logo.png" alt="" fill style={{ objectFit: "cover" }} sizes="48px" unoptimized />
      </div>
      <h1>{done ? "비밀번호를 바꿨어요" : "새 비밀번호 설정"}</h1>
      <p>{done ? "새 비밀번호로 다시 로그인해주세요." : "8자 이상으로 입력해주세요. 링크는 30분 동안 유효해요."}</p>
      {!done && (
        <>
          <label className="pf-password">
            <input
              type={show ? "text" : "password"}
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="새 비밀번호"
              autoComplete="new-password"
              required
            />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}>
              {show ? "숨김" : "보기"}
            </button>
          </label>
          <label>
            <input
              type={show ? "text" : "password"}
              minLength={8}
              maxLength={128}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="새 비밀번호 확인"
              autoComplete="new-password"
              required
            />
          </label>
        </>
      )}
      {error && (
        <div className="wd-scope" style={{ marginTop: 16 }}>
          <div className="wd-banner danger" role="alert" style={{ padding: "12px 14px" }}>
            <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>!</span>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        </div>
      )}
      {done ? (
        <button type="button" className="pf-login-submit" onClick={() => router.replace("/inhouse/login")}>
          로그인하러 가기
        </button>
      ) : (
        <button className="pf-login-submit" disabled={busy} aria-busy={busy}>
          {busy ? "바꾸는 중…" : "비밀번호 바꾸기"}
        </button>
      )}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="pf-login-page">
      <header>
        <a href="/" className="pf-login-brand">
          <span>
            <Image src="/native-logo.png" alt="Native" fill style={{ objectFit: "cover" }} sizes="32px" unoptimized />
          </span>
          <b>Native</b>
          <em>inhouse</em>
        </a>
      </header>
      <section className="pf-login-center">
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </section>
      <footer>
        <a href="/inhouse/login">← 로그인</a>
      </footer>
    </main>
  );
}
