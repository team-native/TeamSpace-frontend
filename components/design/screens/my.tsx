import type { ReactNode } from "react";
import Screen, { Eyebrow, Modal } from "../Screen";

const NAV = ["내 공간 홈", "프로필", "일정", "참여 프로젝트", "내 활동", "설정"] as const;

function MyShell({ active, children, overlay }: { active: (typeof NAV)[number]; children: ReactNode; overlay?: ReactNode }) {
  return (
    <Screen overlay={overlay}>
      <div className="wd-wrap wd-pb" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 40, paddingTop: 44 }}>
        <aside>
          <div className="wd-row" style={{ gap: 10, padding: "0 12px 20px" }}>
            <span className="wd-av dark">준</span>
            <div>
              <b className="wd-t12">김준표</b>
              <span className="wd-t9 wd-faint" style={{ display: "block" }}>Leader · iOS</span>
            </div>
          </div>
          <nav className="wd-toc">
            {NAV.map((n) => (
              <span key={n} className={n === active ? "on" : ""}>{n}</span>
            ))}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </Screen>
  );
}

function Title({ eyebrow, title, sub, right }: { eyebrow: string; title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="wd-between" style={{ alignItems: "flex-end", marginBottom: 26 }}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 style={{ margin: "14px 0 8px", fontSize: 30, letterSpacing: "-.06em", fontWeight: 620 }}>{title}</h1>
        {sub && <p className="wd-t11 wd-muted" style={{ margin: 0 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

const PROJECTS = [
  { n: "Book-on", r: "iOS 리드", p: 68, s: "진행 중", t: "blue", d: "11.20 납품" },
  { n: "Moil", r: "QA 지원", p: 42, s: "진행 중", t: "violet", d: "12.05 베타" },
  { n: "TeamSpace", r: "PO", p: 85, s: "마무리", t: "green", d: "10.31 오픈" },
];

// #38 내 공간 홈, #50 내 활동, #51 참여 프로젝트
export function MySpace() {
  return (
    <MyShell active="내 공간 홈">
      <Title eyebrow="MY SPACE" title="내 공간" sub="나에게 온 결재와 내 활동을 모아봤어요." />
      <div className="wd-grid g4" style={{ marginBottom: 18 }}>
        {[
          ["안 읽은 알림", "3"],
          ["제출한 결재", "7"],
          ["내 게시글", "4"],
          ["내 문의", "2"],
        ].map(([k, v]) => (
          <div key={k} className="wd-card wd-stat">
            <small>{k}</small>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      <div className="wd-grid g2" style={{ marginBottom: 18 }}>
        <section className="wd-card" style={{ borderColor: "#cfe0fd" }}>
          <div className="wd-card-head">
            <h3>나에게 온 결재</h3>
            <a className="wd-link">결재함 →</a>
          </div>
          {[
            ["박도윤", "Moil 서버 비용", "182,000원", "violet"],
            ["한지우", "Book-on 디자이너 1명 지원", "3주", "orange"],
          ].map(([w, t, a, c]) => (
            <div key={t} className="wd-li" style={{ padding: "12px 0" }}>
              <span className={`wd-av ${c}`}>{w.slice(1, 2)}</span>
              <div>
                <b>{t}</b>
                <p>{w} · 결재 대기</p>
              </div>
              <span className="wd-btn blue sm">검토 · {a}</span>
            </div>
          ))}
        </section>
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>최근 활동</h3>
            <a className="wd-link">내 활동 →</a>
          </div>
          {[
            ["결재", "blue", "Book-on 테스트 기기 구매 · 검토 중"],
            ["게시글", "", "Book-on 베타 테스터 모집합니다 · 댓글 12"],
            ["문의", "orange", "회의실 예약 방식 건의 · 답변 완료"],
            ["문서", "green", "외주 수금 기준 v2.3 · 확인함"],
          ].map(([k, t, x]) => (
            <div key={x} className="wd-row wd-t11" style={{ padding: "9px 0", gap: 10 }}>
              <span className={`wd-badge ${t}`} style={{ width: 44, justifyContent: "center" }}>{k}</span>
              {x}
            </div>
          ))}
        </section>
      </div>
      <div className="wd-sec-title">
        <h2 style={{ fontSize: 18 }}>참여 프로젝트</h2>
        <a className="wd-link">전체 →</a>
      </div>
      <div className="wd-grid g3">
        {PROJECTS.map((p) => (
          <div key={p.n} className="wd-card">
            <div className="wd-between">
              <span className={`wd-av ${p.t}`}>{p.n.slice(0, 1)}</span>
              <span className="wd-badge">{p.s}</span>
            </div>
            <b style={{ display: "block", margin: "14px 0 3px", fontSize: 14 }}>{p.n}</b>
            <span className="wd-t9 wd-faint">{p.r} · {p.d}</span>
            <div className="wd-bar" style={{ marginTop: 14 }}><i style={{ width: `${p.p}%` }} /></div>
            <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 6 }}>진행률 {p.p}%</span>
          </div>
        ))}
      </div>
    </MyShell>
  );
}

// #39 프로필 서버 저장 + 한 줄 소개 · 관심사
export function ProfileEdit() {
  return (
    <MyShell active="프로필">
      <Title eyebrow="PROFILE" title="프로필" sub="팀원 소개와 결재 화면에 보이는 정보예요." right={<span className="wd-btn">저장</span>} />
      <div className="wd-card" style={{ padding: 28 }}>
        <div className="wd-row" style={{ gap: 18, marginBottom: 26 }}>
          <span className="wd-av xl dark">준</span>
          <div>
            <div className="wd-row" style={{ gap: 6 }}>
              <span className="wd-btn line sm">사진 바꾸기</span>
              <span className="wd-btn ghost sm">기본 이미지</span>
            </div>
            <p className="wd-t9 wd-faint" style={{ margin: "8px 0 0" }}>JPG · PNG · 3:4로 잘려요</p>
          </div>
        </div>
        <div className="wd-grid g2">
          <label className="wd-field"><span>이름</span><div className="wd-input">김준표</div></label>
          <label className="wd-field"><span>이메일</span><div className="wd-input" style={{ color: "#8b95a1" }}>junpyo@native.team<span className="end">변경 불가</span></div></label>
          <label className="wd-field"><span>부서</span><div className="wd-input">Leader<span className="end">▾</span></div></label>
          <label className="wd-field"><span>전공 · 직군</span><div className="wd-input">iOS<span className="end">▾</span></div></label>
          <label className="wd-field"><span>GitHub</span><div className="wd-input">@junpyo</div></label>
          <label className="wd-field"><span>기수 · 학번</span><div className="wd-input">25기 · 25038</div></label>
        </div>
        <label className="wd-field">
          <span>한 줄 소개 <em>28 / 60</em></span>
          <div className="wd-input focus">작게 만들고 오래 쓰이는 제품을 좋아해요.</div>
        </label>
        <label className="wd-field" style={{ marginBottom: 0 }}>
          <span>관심사 <em>최대 5개</em></span>
          <div className="wd-chips">
            {["SwiftUI", "디자인 시스템", "스타트업", "러닝"].map((c) => (
              <span key={c} className="wd-chip bon">#{c} ×</span>
            ))}
            <span className="wd-chip" style={{ borderStyle: "dashed" }}>+ 추가</span>
          </div>
        </label>
      </div>
      <div className="wd-toast" style={{ bottom: 36 }}>
        <i>✓</i>프로필을 저장했어요. 모든 기기에 반영돼요.
      </div>
    </MyShell>
  );
}

function SetRow({ t, s, right }: { t: string; s?: string; right: ReactNode }) {
  return (
    <div className="wd-between" style={{ padding: "16px 0", borderBottom: "1px solid #e5e8eb" }}>
      <div>
        <b className="wd-t12" style={{ fontWeight: 620 }}>{t}</b>
        {s && <p className="wd-t9 wd-faint" style={{ margin: "4px 0 0" }}>{s}</p>}
      </div>
      {right}
    </div>
  );
}

// #40 설정, #41 다크모드, #42 비밀번호 변경, #43 재정 권한 확인, #44 알림 설정, #45 방해 금지
export function Settings() {
  return (
    <MyShell active="설정">
      <Title eyebrow="SETTINGS" title="설정" />
      <div className="wd-grid g2" style={{ alignItems: "start" }}>
        <div className="wd-stack">
          <section className="wd-card">
            <h3>화면</h3>
            <SetRow
              t="테마"
              s="시스템 설정을 따르거나 직접 고를 수 있어요"
              right={
                <div className="wd-tabs">
                  <span>시스템</span>
                  <span>라이트</span>
                  <span className="on">다크</span>
                </div>
              }
            />
            <div className="wd-grid g2" style={{ marginTop: 14 }}>
              <div style={{ border: "1px solid #e5e8eb", borderRadius: 12, padding: 10, background: "#fff" }}>
                <div className="wd-bar" style={{ width: "50%", marginBottom: 6 }}><i style={{ width: "100%", background: "#191f28" }} /></div>
                <div style={{ height: 34, borderRadius: 8, background: "#f2f4f6" }} />
                <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 6 }}>라이트</span>
              </div>
              <div className="wd-dark" style={{ border: "2px solid #3182f6", borderRadius: 12, padding: 10 }}>
                <div className="wd-bar" style={{ width: "50%", marginBottom: 6, background: "#2c2c35" }}><i style={{ width: "100%", background: "#e5e8eb" }} /></div>
                <div style={{ height: 34, borderRadius: 8, background: "#24242b" }} />
                <span className="wd-t9" style={{ display: "block", marginTop: 6, color: "#8b95a1" }}>다크 ✓</span>
              </div>
            </div>
          </section>
          <section className="wd-card">
            <h3>계정</h3>
            <SetRow t="비밀번호 변경" s="마지막 변경 2026.08.12" right={<span className="wd-btn line sm">변경</span>} />
            <SetRow
              t="재정 정보 권한"
              s="FA · Leader만 전체 금액을 볼 수 있어요"
              right={<span className="wd-badge green">전체 열람 가능</span>}
            />
            <SetRow t="로그아웃" right={<span className="wd-btn ghost sm">로그아웃</span>} />
          </section>
        </div>
        <section className="wd-card">
          <h3>알림</h3>
          <SetRow t="브라우저 푸시" s="탭이 닫혀 있어도 알림을 받아요" right={<span className="wd-toggle on" />} />
          {[
            ["내 업무", "결재 요청·승인·반려", true],
            ["재정", "입금·배분 완료", true],
            ["일정", "일정 등록·변경·하루 전 알림", true],
            ["공지", "필독 공지와 제도 변경", true],
            ["게시판", "내 글의 댓글·공감", false],
          ].map(([t, s, on]) => (
            <SetRow key={t as string} t={t as string} s={s as string} right={<span className={`wd-toggle ${on ? "on" : ""}`} />} />
          ))}
          <div style={{ paddingTop: 16 }}>
            <div className="wd-between">
              <div>
                <b className="wd-t12" style={{ fontWeight: 620 }}>방해 금지 시간</b>
                <p className="wd-t9 wd-faint" style={{ margin: "4px 0 0" }}>이 시간엔 푸시 없이 알림 센터에만 쌓여요</p>
              </div>
              <span className="wd-toggle on" />
            </div>
            <div className="wd-row" style={{ marginTop: 12, gap: 8 }}>
              <div className="wd-input" style={{ minHeight: 38 }}>23:00<span className="end">▾</span></div>
              <span className="wd-faint">~</span>
              <div className="wd-input" style={{ minHeight: 38 }}>08:00<span className="end">▾</span></div>
            </div>
            <div className="wd-chips" style={{ marginTop: 10 }}>
              {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => (
                <span key={d} className={`wd-chip ${i < 5 ? "bon" : ""}`} style={{ width: 34, justifyContent: "center", padding: 0 }}>{d}</span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MyShell>
  );
}

// #46 일정 캘린더, #47 일정 상세 + 참석/불참 응답
export function CalendarView() {
  const days: { d: number; dim?: boolean; ev?: [string, string][] }[] = [];
  for (let i = 27; i <= 30; i++) days.push({ d: i, dim: true });
  for (let i = 1; i <= 31; i++) days.push({ d: i });
  const ev: Record<number, [string, string][]> = {
    3: [["Book-on 킥오프", ""]],
    9: [["한글날 휴무", "orange"]],
    14: [["디자인 리뷰", "violet"]],
    17: [["NativeLab 데모데이", ""]],
    21: [["Moil 스프린트 회고", "violet"]],
    24: [["FA 정산 마감", "orange"]],
    28: [["10월 전체 회의", "sel"]],
    30: [["영수증 제출 마감", "orange"]],
  };
  return (
    <MyShell active="일정">
      <Title
        eyebrow="CALENDAR"
        title="2026년 10월"
        right={
          <div className="wd-row">
            <span className="wd-btn line sm">‹</span>
            <span className="wd-btn line sm">오늘</span>
            <span className="wd-btn line sm">›</span>
          </div>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18, alignItems: "start" }}>
        <div className="wd-cal" style={{ borderRadius: 14, overflow: "hidden" }}>
          {["일", "월", "화", "수", "목", "금", "토"].map((h) => (
            <div key={h} className="head">{h}</div>
          ))}
          {days.map((x, i) => (
            <div key={i} className={`${x.dim ? "dim" : ""} ${!x.dim && x.d === 24 ? "today" : ""}`} style={{ minHeight: 82 }}>
              <span>{x.d}</span>
              {!x.dim && ev[x.d]?.map(([t, c]) => (
                <span key={t} className={`ev ${c}`}>{t}</span>
              ))}
            </div>
          ))}
        </div>
        <section className="wd-card" style={{ borderColor: "#cfe0fd" }}>
          <span className="wd-badge blue">전체 일정</span>
          <h3 style={{ margin: "12px 0 6px", fontSize: 18 }}>10월 전체 회의</h3>
          <dl className="wd-kv one" style={{ margin: "14px 0 18px" }}>
            <div><dt>일시</dt><dd>10.28 (수) 19:00 – 20:30</dd></div>
            <div><dt>장소</dt><dd>본관 302호 · 온라인 병행</dd></div>
            <div><dt>주최</dt><dd>김준표 · Leader</dd></div>
            <div><dt>안건</dt><dd style={{ fontWeight: 500 }}>11월 프로젝트 배정, 정산 기준 개정 안내</dd></div>
          </dl>
          <div className="wd-between wd-t10" style={{ marginBottom: 8 }}>
            <b>참석 응답</b>
            <span className="wd-faint">참석 12 · 불참 2 · 미응답 6</span>
          </div>
          <div className="wd-seg" style={{ marginBottom: 10 }}>
            <span className="on">참석</span>
            <span>불참</span>
            <span>미정</span>
          </div>
          <div className="wd-input ph" style={{ minHeight: 38 }}>불참 사유 (선택)</div>
        </section>
      </div>
    </MyShell>
  );
}

function ProjectBody() {
  return (
    <>
      <Title
        eyebrow="PROJECT"
        title="Book-on"
        sub="독서 기록 앱 · 그린랩 외주 · 2026.08 – 2026.11"
        right={<span className="wd-btn">참여 신청</span>}
      />
      <div className="wd-grid g3" style={{ marginBottom: 18 }}>
        <div className="wd-card wd-stat">
          <small>진행률</small>
          <strong>68%</strong>
          <div className="wd-bar" style={{ marginTop: 10 }}><i style={{ width: "68%" }} /></div>
        </div>
        <div className="wd-card wd-stat"><small>다음 마일스톤</small><strong style={{ fontSize: 16 }}>베타 배포 · 11.05</strong></div>
        <div className="wd-card wd-stat"><small>담당 PM</small><strong style={{ fontSize: 16 }}>박도윤</strong></div>
      </div>
      <div className="wd-grid g2">
        <section className="wd-card">
          <div className="wd-card-head"><h3>멤버 5</h3></div>
          {[
            ["박도윤", "PM", "violet"],
            ["김준표", "iOS 리드", "dark"],
            ["이서연", "iOS", "blue"],
            ["오세린", "Design", "violet"],
            ["윤태오", "Backend", "green"],
          ].map(([n, r, t]) => (
            <div key={n} className="wd-row wd-t11" style={{ padding: "8px 0", gap: 10 }}>
              <span className={`wd-av sm ${t}`}>{n.slice(1, 2)}</span>
              <b style={{ fontWeight: 620 }}>{n}</b>
              <span className="wd-faint">{r}</span>
            </div>
          ))}
        </section>
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>모집 중인 자리</h3>
            <span className="wd-badge orange">2자리</span>
          </div>
          {[
            ["Web 프론트엔드", "1명 · 관리자 페이지 · 주 6시간"],
            ["QA", "1명 · 베타 테스트 · 11.01 – 11.15"],
          ].map(([r, s]) => (
            <div key={r} className="wd-file" style={{ marginBottom: 8 }}>
              <span className="ext doc">+</span>
              <div>
                <b>{r}</b>
                <small>{s}</small>
              </div>
              <span className="wd-btn line sm" style={{ marginLeft: "auto" }}>신청</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

// #48 프로젝트 상세 (진행률 · 멤버 · 모집 자리)
export function ProjectDetail() {
  return (
    <MyShell active="참여 프로젝트">
      <ProjectBody />
    </MyShell>
  );
}

// #49 프로젝트 참여 신청
export function ProjectApply() {
  return (
    <MyShell
      active="참여 프로젝트"
      overlay={
        <Modal
          eyebrow="APPLY"
          title="Book-on 참여 신청"
          sub="PM 박도윤님이 확인 후 알려드려요."
          size="sm"
          footer={
            <>
              <span className="wd-btn ghost">취소</span>
              <span className="wd-btn">신청하기</span>
            </>
          }
        >
          <label className="wd-field">
            <span>지원 자리</span>
            <div className="wd-seg">
              <span className="on">Web 프론트엔드</span>
              <span>QA</span>
            </div>
          </label>
          <label className="wd-field">
            <span>투입 가능 시간</span>
            <div className="wd-seg">
              <span>주 3h</span>
              <span className="on">주 6h</span>
              <span>주 10h+</span>
            </div>
          </label>
          <label className="wd-field" style={{ marginBottom: 0 }}>
            <span>하고 싶은 말 <em>선택</em></span>
            <div className="wd-input area" style={{ minHeight: 90 }}>Next.js 관리자 페이지 경험이 있어요. 인하우스 웹 작업과 같이 할 수 있어요.</div>
          </label>
        </Modal>
      }
    >
      <div style={{ opacity: 0.6 }}>
        <ProjectBody />
      </div>
    </MyShell>
  );
}
