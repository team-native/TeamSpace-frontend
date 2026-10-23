import type { ReactNode } from "react";

function LoginFrame({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
  return (
    <div className="wd-screen" style={{ height: 900 }}>
      <main className="pf-login-page" style={{ minHeight: 900 }}>
        <header>
          <span className="pf-login-brand">
            <span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/native-logo.png" alt="Native" width={32} height={32} />
            </span>
            <b>Native</b>
            <em>inhouse</em>
          </span>
        </header>
        <section className="pf-login-center">{children}</section>
        <footer>
          <a>← Native 홈페이지</a>
          <div>
            <a>이용 약관</a>
            <a>개인정보처리방침</a>
          </div>
        </footer>
      </main>
      {overlay}
    </div>
  );
}

function Logo() {
  return (
    <div className="pf-login-logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/native-logo.png" alt="" width={48} height={48} />
    </div>
  );
}

// #1 비밀번호 찾기: 로그인 폼에 링크 추가 + 재설정 메일 모달
export function LoginReset() {
  return (
    <LoginFrame
      overlay={
        <div className="wd-scrim">
          <section className="wd-modal sm">
            <header>
              <div>
                <span>RESET PASSWORD</span>
                <h2>비밀번호 찾기</h2>
                <p>가입한 이메일로 재설정 링크를 보내드려요.</p>
              </div>
              <span className="wd-x">×</span>
            </header>
            <div className="wd-modal-body">
              <label className="wd-field">
                <span>이메일</span>
                <div className="wd-input focus">junpyo@native.team</div>
              </label>
              <div className="wd-banner gray" style={{ padding: "12px 14px" }}>
                <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>i</span>
                <p style={{ margin: 0 }}>링크는 30분 동안 유효해요. 메일이 안 보이면 스팸함을 확인해주세요.</p>
              </div>
            </div>
            <div className="wd-foot">
              <span className="wd-btn ghost">취소</span>
              <span className="wd-btn">재설정 링크 보내기</span>
            </div>
          </section>
        </div>
      }
    >
      <form className="pf-login-form">
        <Logo />
        <h1>팀스페이스 로그인</h1>
        <p>승인된 Native 계정으로 로그인해주세요.</p>
        <label>
          <input placeholder="이메일" defaultValue="junpyo@native.team" />
        </label>
        <label className="pf-password">
          <input type="password" placeholder="비밀번호" />
          <button type="button">보기</button>
        </label>
        <div className="wd-between" style={{ margin: "4px 0 14px" }}>
          <label className="pf-remember" style={{ margin: 0 }}>
            <input type="checkbox" />
            <i />
            이메일 기억하기
          </label>
          <a className="wd-link">비밀번호를 잊었어요</a>
        </div>
        <button className="pf-login-submit" type="button">로그인</button>
      </form>
    </LoginFrame>
  );
}

// #2 가입 요청 시 소속 부서 선택
export function SignupDept() {
  const depts = ["Leader", "NativeOps", "PMO", "FA", "Core Platform", "Design", "NativeLab"];
  return (
    <LoginFrame>
      <form className="pf-login-form">
        <Logo />
        <h1>인하우스 가입 요청</h1>
        <p>계정을 만들고 운영진에게 접근 승인을 요청해요.</p>
        <label>
          <input placeholder="이름" defaultValue="이서연" />
        </label>
        <label>
          <input placeholder="이메일" defaultValue="seoyeon@native.team" />
        </label>
        <label className="pf-password">
          <input type="password" placeholder="비밀번호 (8자 이상)" defaultValue="password" />
          <button type="button">보기</button>
        </label>
        <div style={{ margin: "6px 0 16px", textAlign: "left" }}>
          <div className="wd-between" style={{ marginBottom: 8 }}>
            <b className="wd-t10" style={{ color: "#4e5968" }}>소속 부서</b>
            <span className="wd-t9 wd-faint">승인 시 운영진이 다시 확인해요</span>
          </div>
          <div className="wd-chips">
            {depts.map((d) => (
              <span key={d} className={`wd-chip ${d === "Core Platform" ? "bon" : ""}`}>
                {d === "Core Platform" && "✓ "}
                {d}
              </span>
            ))}
          </div>
        </div>
        <button className="pf-login-submit" type="button">가입 요청 보내기</button>
        <div className="pf-login-switch">
          이미 계정이 있나요?
          <button type="button">로그인하기</button>
        </div>
      </form>
    </LoginFrame>
  );
}
