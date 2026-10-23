"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "@/components/inhouse/ui";
import { DEPARTMENTS } from "@/lib/demo";

type Mode = "login" | "request";

const EMAIL_KEY = "native-inhouse-email";

// 로그인은 형식상 화면만 두고, 제출하면 바로 인하우스로 들어간다
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [dept, setDept] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

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
        <form
          className="pf-login-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (remember) localStorage.setItem(EMAIL_KEY, email);
            else localStorage.removeItem(EMAIL_KEY);
            if (mode === "request") {
              if (!dept) {
                setMessage("소속 부서를 선택해주세요.");
                return;
              }
              setMessage(`${dept} 소속으로 접근 요청을 보냈어요. 승인 후 인하우스에 들어올 수 있습니다.`);
              setMode("login");
              return;
            }
            router.replace("/inhouse");
          }}
        >
          <div className="pf-login-logo">
            <Image src="/native-logo.png" alt="" fill style={{ objectFit: "cover" }} sizes="48px" unoptimized />
          </div>
          <h1>{mode === "login" ? "팀스페이스 로그인" : "인하우스 가입 요청"}</h1>
          <p>
            {mode === "login"
              ? "승인된 Native 계정으로 로그인해주세요."
              : "계정을 만들고 운영진에게 접근 승인을 요청해요."}
          </p>
          {mode === "request" && (
            <label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" required />
            </label>
          )}
          <label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" required />
          </label>
          <label className="pf-password">
            <input
              type={showPassword ? "text" : "password"}
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              {showPassword ? "숨김" : "보기"}
            </button>
          </label>
          {mode === "request" && (
            <div className="wd-scope" style={{ margin: "16px 0 4px", textAlign: "left" }}>
              <div className="wd-between" style={{ marginBottom: 8 }}>
                <b className="wd-t10" style={{ color: "#4e5968" }}>소속 부서</b>
                <span className="wd-t9 wd-faint">승인 시 운영진이 다시 확인해요</span>
              </div>
              <div className="wd-chips" role="radiogroup" aria-label="소속 부서">
                {DEPARTMENTS.map((d) => (
                  <button
                    type="button"
                    key={d}
                    role="radio"
                    aria-checked={dept === d}
                    className={`wd-chip ${dept === d ? "bon" : ""}`}
                    onClick={() => setDept(d)}
                  >
                    {dept === d && "✓ "}
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mode === "login" && (
            <div className="wd-scope wd-between" style={{ marginTop: 14 }}>
              <label className="pf-remember" style={{ margin: 0 }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <i />
                이메일 기억하기
              </label>
              <button
                type="button"
                className="wd-link"
                style={{ border: 0, background: "none", fontSize: 9 }}
                onClick={() => {
                  setResetEmail(email);
                  setResetSent(false);
                  setResetOpen(true);
                }}
              >
                비밀번호를 잊었어요
              </button>
            </div>
          )}
          {message && <div className="pf-login-alert">{message}</div>}
          <button className="pf-login-submit">{mode === "login" ? "로그인" : "가입 요청 보내기"}</button>
          <div className="pf-login-switch">
            {mode === "login" ? "처음이신가요?" : "이미 계정이 있나요?"}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "request" : "login");
                setMessage("");
              }}
            >
              {mode === "login" ? "가입 요청하기" : "로그인하기"}
            </button>
          </div>
        </form>
      </section>
      {resetOpen && (
        <Modal
          eyebrow="RESET PASSWORD"
          title={resetSent ? "메일을 보냈어요" : "비밀번호 찾기"}
          sub={resetSent ? `${resetEmail}로 재설정 링크를 보냈어요.` : "가입한 이메일로 재설정 링크를 보내드려요."}
          size="sm"
          onClose={() => setResetOpen(false)}
          footer={
            resetSent ? (
              <button type="button" className="wd-btn" onClick={() => setResetOpen(false)}>
                확인
              </button>
            ) : (
              <>
                <button type="button" className="wd-btn ghost" onClick={() => setResetOpen(false)}>
                  취소
                </button>
                <button type="submit" form="reset-form" className="wd-btn">
                  재설정 링크 보내기
                </button>
              </>
            )
          }
        >
          {resetSent ? (
            <p className="wd-t11 wd-muted" style={{ margin: 0, lineHeight: 1.7 }}>
              링크는 30분 동안 유효해요. 메일이 안 보이면 스팸함을 확인해주세요.
            </p>
          ) : (
            <form
              id="reset-form"
              onSubmit={(e) => {
                e.preventDefault();
                setResetSent(true);
              }}
            >
              <label className="wd-field">
                <span>이메일</span>
                <input
                  className="wd-input"
                  type="email"
                  required
                  autoFocus
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@native.team"
                />
              </label>
              <div className="wd-banner gray" style={{ padding: "12px 14px" }}>
                <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>i</span>
                <p style={{ margin: 0 }}>링크는 30분 동안 유효해요.</p>
              </div>
            </form>
          )}
        </Modal>
      )}
      <footer>
        <a href="/">← Native 홈페이지</a>
        <div>
          <a href="#">이용 약관</a>
          <a href="#">개인정보처리방침</a>
        </div>
      </footer>
    </main>
  );
}
