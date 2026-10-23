import type { ReactNode } from "react";
import Screen, { Eyebrow, Header } from "../Screen";
import { ApprovalDetail } from "./approval";
import { MySpace } from "./my";
import { PEOPLE } from "./team";

// 09 다크모드: 기존 화면을 다크 토큰으로
export function DarkMySpace() {
  return (
    <div className="dk">
      <MySpace />
    </div>
  );
}
export function DarkApproval() {
  return (
    <div className="dk">
      <ApprovalDetail />
    </div>
  );
}

function Empty({ ill, title, desc, cta }: { ill: string; title: string; desc: string; cta?: string }) {
  return (
    <div className="wd-card wd-empty">
      <span className="ill">{ill}</span>
      <b>{title}</b>
      <p>{desc}</p>
      {cta && <span className="wd-btn line sm">{cta}</span>}
    </div>
  );
}

// 10-1 빈 상태 · 로딩 · 에러 공통 컴포넌트
export function StatesSheet() {
  return (
    <Screen>
      <div className="wd-wrap wd-pb">
        <section className="wd-hero sm">
          <div>
            <Eyebrow>STATES</Eyebrow>
            <h1>빈 상태 · 로딩 · 에러</h1>
            <p>모든 목록과 페이지가 같은 모양을 쓰도록 공통으로 정해요.</p>
          </div>
        </section>
        <b className="wd-t12">빈 상태</b>
        <div className="wd-grid g4" style={{ margin: "12px 0 36px" }}>
          <Empty ill="⌕" title="검색 결과가 없어요" desc="다른 단어로 찾아보거나 필터를 풀어보세요." cta="필터 초기화" />
          <Empty ill="✓" title="새 알림이 없어요" desc="결재나 공지가 오면 여기에 모여요." />
          <Empty ill="+" title="아직 올린 결재가 없어요" desc="비용이나 인력이 필요하면 결재로 올려요." cta="결재 작성" />
          <Empty ill="✎" title="첫 글을 남겨보세요" desc="실명이나 익명으로 자유롭게 써요." cta="글쓰기" />
        </div>
        <b className="wd-t12">로딩</b>
        <div className="wd-grid g2" style={{ margin: "12px 0 36px" }}>
          <div className="wd-card">
            {[0, 1, 2].map((i) => (
              <div key={i} className="wd-row" style={{ padding: "14px 0", gap: 14, borderBottom: i < 2 ? "1px solid #e5e8eb" : undefined }}>
                <span className="wd-skel" style={{ width: 36, height: 36, borderRadius: 11 }} />
                <div style={{ flex: 1 }}>
                  <div className="wd-skel" style={{ width: "60%", height: 12 }} />
                  <div className="wd-skel" style={{ width: "35%", height: 9, marginTop: 8 }} />
                </div>
                <span className="wd-skel" style={{ width: 60, height: 12 }} />
              </div>
            ))}
            <p className="wd-t9 wd-faint" style={{ margin: "10px 0 0" }}>목록 · 실제 행과 같은 높이의 회색 블록</p>
          </div>
          <div className="wd-card" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
            <div>
              <div className="wd-row" style={{ gap: 6, justifyContent: "center" }}>
                {[1, 0.6, 0.3].map((o) => (
                  <span key={o} style={{ width: 8, height: 8, borderRadius: 4, background: "#3182f6", opacity: o }} />
                ))}
              </div>
              <p className="wd-t10 wd-muted" style={{ margin: "14px 0 0" }}>Native 인하우스를 준비하고 있어요</p>
              <p className="wd-t9 wd-faint" style={{ margin: "6px 0 0" }}>페이지 전체 로딩 · 1초 이상일 때만 표시</p>
            </div>
          </div>
        </div>
        <b className="wd-t12">에러</b>
        <div className="wd-grid g3" style={{ marginTop: 12 }}>
          <Empty ill="!" title="연결이 잠시 끊겼어요" desc="인터넷 연결을 확인하고 다시 시도해주세요." cta="다시 불러오기" />
          <Empty ill="⊘" title="볼 수 있는 권한이 없어요" desc="재정 정보는 FA · Leader만 볼 수 있어요." cta="권한 문의하기" />
          <Empty ill="?" title="페이지를 찾을 수 없어요" desc="삭제됐거나 주소가 바뀌었어요." cta="홈으로" />
        </div>
      </div>
    </Screen>
  );
}

// 10-2 전체 페이지 에러
export function ErrorPage() {
  return (
    <Screen>
      <div style={{ display: "grid", placeItems: "center", minHeight: 760 }}>
        <div style={{ textAlign: "center", width: 380 }}>
          <span style={{ display: "grid", placeItems: "center", width: 72, height: 72, margin: "0 auto 22px", borderRadius: 24, background: "#fff0f1", color: "#f04452", fontSize: 28, fontWeight: 800 }}>!</span>
          <h1 style={{ margin: 0, fontSize: 24, letterSpacing: "-.04em", fontWeight: 650 }}>잠시 문제가 생겼어요</h1>
          <p className="wd-t11 wd-muted" style={{ margin: "10px 0 26px", lineHeight: 1.7 }}>
            데이터를 불러오지 못했어요. 잠시 후 다시 시도하거나,
            <br />
            계속되면 NativeOps에 알려주세요.
          </p>
          <div className="wd-row" style={{ justifyContent: "center" }}>
            <span className="wd-btn ghost">문의하기</span>
            <span className="wd-btn">다시 불러오기</span>
          </div>
          <p className="wd-t9 wd-faint" style={{ marginTop: 22 }}>오류 코드 503 · 10.24 07:42</p>
        </div>
      </div>
    </Screen>
  );
}

// 11-1 홈 바로가기 6개 통합
export function HomeShortcuts() {
  const items: [string, string, string, string, string][] = [
    ["결", "전자결재", "비용 · 인력 결재 올리기", "받은 결재 2", "blue"],
    ["재", "재무", "풀 잔액과 수금 확인", "이번 달 +7,260,000", "green"],
    ["문", "문서함", "규칙과 템플릿 찾기", "개정 1건", "orange"],
    ["게", "게시판", "팀 이야기 나누기", "새 글 3", "violet"],
    ["?", "문의 · 건의", "운영진에게 묻기", "답변 1", ""],
    ["팀", "팀원", "부서와 조직도 보기", "새 멤버 2", ""],
  ];
  return (
    <Screen active="홈" className="auto">
      <div className="wd-wrap" style={{ padding: "80px 0 120px" }}>
        <div className="wd-grid" style={{ gridTemplateColumns: "360px 1fr", gap: 60, alignItems: "start" }}>
          <div>
            <Eyebrow>WORKSPACE</Eyebrow>
            <h2 style={{ margin: "18px 0 14px", fontSize: 36, lineHeight: 1.2, letterSpacing: "-.06em", fontWeight: 650 }}>
              필요한 일에 바로
              <br />
              도착할 수 있도록.
            </h2>
            <p className="wd-t12 wd-muted" style={{ margin: 0, lineHeight: 1.75 }}>
              자주 하는 일 여섯 가지를 한 화면에 모았어요.
              <br />각 카드에 지금 확인할 숫자가 함께 보여요.
            </p>
          </div>
          <div className="wd-grid g3">
            {items.map(([i, t, d, badge, tone]) => (
              <div key={t} className="wd-card" style={{ padding: 22, minHeight: 170, display: "flex", flexDirection: "column" }}>
                <div className="wd-between">
                  <span className={`wd-av ${tone}`} style={{ borderRadius: 12 }}>{i}</span>
                  <span className={`wd-badge ${tone}`}>{badge}</span>
                </div>
                <b style={{ marginTop: "auto", fontSize: 15, letterSpacing: "-.03em" }}>{t}</b>
                <span className="wd-t10 wd-faint" style={{ marginTop: 6 }}>{d} →</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}

// 11-2 팀원 소개 통합: 팀 선택 + 팀원 찾기 한 섹션으로, 미등록 카드 제거
export function TeamUnified() {
  return (
    <Screen active="팀원">
      <div className="wd-wrap wd-pb">
        <section className="wd-hero">
          <div>
            <Eyebrow>NATIVE PEOPLE</Eyebrow>
            <h1>
              브랜드를 만드는
              <br />
              사람들을 소개해요.
            </h1>
            <p>Native와 NativeLab, 두 팀 20명이 함께 일해요.</p>
          </div>
          <div className="wd-row" style={{ gap: 28 }}>
            {[
              ["20", "PEOPLE"],
              ["2", "TEAMS"],
              ["7", "DEPTS"],
            ].map(([n, l]) => (
              <div key={l} style={{ textAlign: "right" }}>
                <b style={{ fontSize: 28, letterSpacing: "-.04em" }}>{n}</b>
                <span className="wd-t9 wd-faint" style={{ display: "block", letterSpacing: ".12em", fontWeight: 750 }}>{l}</span>
              </div>
            ))}
          </div>
        </section>
        <div className="wd-between" style={{ marginBottom: 16 }}>
          <div className="wd-tabs">
            <span className="on">전체<small>20</small></span>
            <span>Native<small>10</small></span>
            <span>NativeLab<small>10</small></span>
          </div>
          <div className="wd-row">
            <div className="wd-search" style={{ width: 280, height: 40 }}>
              <i>⌕</i>이름 · 부서 · 역할 검색
            </div>
            <div className="wd-tabs">
              <span className="on">목록</span>
              <span>조직도</span>
            </div>
          </div>
        </div>
        <div className="wd-chips" style={{ marginBottom: 18 }}>
          {["전체 부서", "Leader", "NativeOps", "PMO", "FA", "Core Platform", "Design", "NativeLab"].map((d, i) => (
            <span key={d} className={`wd-chip ${i === 0 ? "on" : ""}`}>{d}</span>
          ))}
        </div>
        <div className="wd-grid g4">
          {PEOPLE.map((p) => (
            <div className="wd-card" key={p.n} style={{ padding: 18 }}>
              <div className="wd-between">
                <span className={`wd-av lg ${p.t}`}>{p.n.slice(1, 2)}</span>
                {p.isNew && <span className="wd-badge blue">NEW</span>}
              </div>
              <b style={{ display: "block", marginTop: 16, fontSize: 14 }}>{p.n}</b>
              <span className="wd-t10 wd-faint" style={{ display: "block", marginTop: 4 }}>
                {p.d} · {p.r}
              </span>
            </div>
          ))}
        </div>
        <div className="wd-banner gray" style={{ marginTop: 18 }}>
          <span className="ico">+12</span>
          <div>
            <b>아직 프로필을 등록하지 않은 팀원이 12명 있어요</b>
            <p>빈 카드 대신 한 줄로 모아 보여주고, 등록 요청을 보낼 수 있어요.</p>
          </div>
          <span className="wd-btn line sm">등록 요청 보내기</span>
        </div>
      </div>
    </Screen>
  );
}

// 11-3 프로필 메뉴 통합: 헤더 모달 대신 내 공간 프로필로 연결
export function ProfileMenu() {
  return (
    <Screen
      active="홈"
      overlay={
        <div className="wd-pop" style={{ top: 70, right: 130, width: 300 }}>
          <div className="wd-row" style={{ gap: 12, padding: 18, borderBottom: "1px solid #e5e8eb" }}>
            <span className="wd-av lg dark">준</span>
            <div>
              <b className="wd-t12">김준표</b>
              <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 3 }}>junpyo@native.team</span>
              <span className="wd-badge" style={{ marginTop: 6 }}>Leader · iOS</span>
            </div>
          </div>
          <div className="wd-menu" style={{ padding: 8 }}>
            {[
              ["내 공간", "나에게 온 결재 2"],
              ["프로필 수정", "사진 · 소개 · 관심사"],
              ["설정", "알림 · 테마 · 비밀번호"],
            ].map(([t, d]) => (
              <span key={t} style={{ justifyContent: "space-between" }}>
                <span>
                  <b style={{ display: "block", fontSize: 11, fontWeight: 620 }}>{t}</b>
                  <small className="wd-t9 wd-faint">{d}</small>
                </span>
                <span className="wd-faint">→</span>
              </span>
            ))}
            <hr />
            <span className="red">로그아웃</span>
          </div>
        </div>
      }
    >
      <div className="wd-wrap" style={{ paddingTop: 80 }}>
        <Eyebrow>NATIVE TEAMSPACE</Eyebrow>
        <h1 style={{ margin: "20px 0 0", fontSize: 42, letterSpacing: "-.065em", fontWeight: 620, opacity: 0.4 }}>
          Native의 일을
          <br />
          한곳에서.
        </h1>
      </div>
    </Screen>
  );
}

function Mobile({ title, back = false, children, footer }: { title: string; back?: boolean; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="wd-screen m pf-shell">
      <div className="wd-mhead">
        {back ? <span className="back">‹</span> : <b style={{ fontSize: 16 }}>Native</b>}
        <b>{back ? title : ""}</b>
        <span className="wd-av sm dark">준</span>
      </div>
      {!back && (
        <div style={{ padding: "18px 16px 0" }}>
          <h1 style={{ margin: 0, fontSize: 24, letterSpacing: "-.05em", fontWeight: 650 }}>{title}</h1>
        </div>
      )}
      <div className="wd-mbody">{children}</div>
      {footer && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 16px 28px", background: "#fff", borderTop: "1px solid #e5e8eb" }}>{footer}</div>
      )}
    </div>
  );
}

// 12-1 모바일 조직도: 세로 아코디언
export function MobileOrg() {
  const depts: [string, string, number, string, boolean][] = [
    ["NativeOps", "최하은", 3, "blue", false],
    ["PMO", "박도윤", 2, "violet", false],
    ["FA", "정민재", 2, "green", false],
    ["Core Platform", "한지우", 6, "orange", true],
    ["Design", "오세린", 3, "violet", false],
    ["NativeLab", "윤태오", 3, "green", false],
  ];
  return (
    <Mobile title="조직도">
      <div className="wd-tabs" style={{ marginBottom: 16, width: "100%" }}>
        <span style={{ flex: 1, textAlign: "center" }}>목록</span>
        <span className="on" style={{ flex: 1, textAlign: "center" }}>조직도</span>
      </div>
      <div className="wd-card" style={{ padding: 14, marginBottom: 10, borderColor: "#cdd9f5" }}>
        <div className="wd-row" style={{ gap: 10 }}>
          <span className="wd-av dark">준</span>
          <div>
            <b className="wd-t12">김준표</b>
            <span className="wd-t9 wd-faint" style={{ display: "block" }}>Leader · Founder</span>
          </div>
        </div>
      </div>
      <div style={{ borderLeft: "2px solid #e5e8eb", marginLeft: 17, paddingLeft: 14 }} className="wd-stack">
        {depts.map(([d, lead, n, t, open]) => (
          <div key={d} className="wd-card" style={{ padding: 14, borderColor: open ? "#3182f6" : undefined }}>
            <div className="wd-between">
              <div>
                <b className="wd-t12">{d}</b>
                <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 3 }}>리드 {lead} · {n}명</span>
              </div>
              <span className="wd-faint">{open ? "⌃" : "⌄"}</span>
            </div>
            {open && (
              <div style={{ marginTop: 10, borderTop: "1px solid #e5e8eb", paddingTop: 6 }}>
                {["한지우 · Web · 리드", "이서연 · iOS", "김준표 · iOS", "박시우 · Web", "강유나 · Android", "임도현 · Backend"].map((m) => (
                  <div key={m} className="wd-row wd-t11" style={{ padding: "7px 0", gap: 10 }}>
                    <span className={`wd-av sm ${m.includes("리드") ? t : ""}`}>{m.slice(1, 2)}</span>
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Mobile>
  );
}

// 12-2 모바일 캘린더: 작은 달력 + 날짜별 목록
export function MobileCalendar() {
  const ev: Record<number, string> = { 3: "blue", 9: "orange", 14: "violet", 17: "blue", 21: "violet", 24: "orange", 28: "blue", 30: "orange" };
  const days = [27, 28, 29, 30, ...Array.from({ length: 31 }, (_, i) => i + 1)];
  return (
    <Mobile title="일정">
      <div className="wd-between" style={{ marginBottom: 12 }}>
        <b className="wd-t12">2026년 10월</b>
        <span className="wd-t10 wd-faint">‹ 오늘 ›</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", rowGap: 6, textAlign: "center", marginBottom: 18 }}>
        {["일", "월", "화", "수", "목", "금", "토"].map((h) => (
          <span key={h} className="wd-t9 wd-faint" style={{ fontWeight: 700 }}>{h}</span>
        ))}
        {days.map((d, i) => {
          const dim = i < 4;
          const sel = !dim && d === 28;
          const today = !dim && d === 24;
          return (
            <div key={i} style={{ display: "grid", justifyItems: "center", gap: 3, padding: "4px 0" }}>
              <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 15, fontSize: 11, fontWeight: sel || today ? 700 : 500, color: dim ? "#b0b8c1" : sel ? "#fff" : today ? "#3182f6" : "#333d4b", background: sel ? "#191f28" : undefined, boxShadow: today ? "inset 0 0 0 1.5px #3182f6" : undefined }}>{d}</span>
              <i style={{ width: 4, height: 4, borderRadius: 2, background: !dim && ev[d] ? { blue: "#3182f6", orange: "#ff8a3d", violet: "#7c5cff" }[ev[d]] : "transparent" }} />
            </div>
          );
        })}
      </div>
      <b className="wd-t10 wd-faint">10.28 (수)</b>
      <div className="wd-card" style={{ padding: 16, marginTop: 8, borderColor: "#cfe0fd" }}>
        <span className="wd-badge blue">전체 일정</span>
        <b style={{ display: "block", margin: "10px 0 4px", fontSize: 15 }}>10월 전체 회의</b>
        <span className="wd-t10 wd-muted">19:00 – 20:30 · 본관 302호</span>
        <div className="wd-seg" style={{ marginTop: 14 }}>
          <span className="on">참석</span>
          <span>불참</span>
          <span>미정</span>
        </div>
        <p className="wd-t9 wd-faint" style={{ margin: "10px 0 0" }}>참석 12 · 불참 2 · 미응답 6</p>
      </div>
      <b className="wd-t10 wd-faint" style={{ display: "block", marginTop: 18 }}>10.30 (금)</b>
      <div className="wd-card" style={{ padding: 14, marginTop: 8 }}>
        <span className="wd-badge orange">마감</span>
        <b style={{ display: "block", marginTop: 8, fontSize: 13 }}>영수증 제출 마감</b>
      </div>
    </Mobile>
  );
}

// 12-3 모바일 결재 상세: 세로 결재선 + 하단 고정 버튼
export function MobileApproval() {
  return (
    <Mobile
      title="결재 상세"
      back
      footer={
        <div className="wd-row">
          <span className="wd-btn danger" style={{ flex: 1, height: 48 }}>반려</span>
          <span className="wd-btn blue" style={{ flex: 2, height: 48 }}>승인하기</span>
        </div>
      }
    >
      <span className="wd-badge blue">검토 중 · 내 차례</span>
      <h2 style={{ margin: "10px 0 4px", fontSize: 20, letterSpacing: "-.04em" }}>Moil 서버 비용</h2>
      <span className="wd-t10 wd-faint">비용 승인 · 도구·구독 · 박도윤 · 10.24</span>
      <div className="wd-card soft" style={{ padding: 16, margin: "16px 0" }}>
        <span className="wd-t9 wd-faint">요청 금액</span>
        <b style={{ display: "block", fontSize: 22, letterSpacing: "-.04em", marginTop: 4 }}>182,000원</b>
      </div>
      <b className="wd-t10" style={{ color: "#4e5968" }}>결재선</b>
      <div className="wd-tl" style={{ marginTop: 10 }}>
        <div className="on">
          <b className="wd-t11">박도윤 · 기안</b>
          <p className="wd-t9 wd-faint" style={{ margin: "3px 0 0" }}>10.24 09:50</p>
        </div>
        <div className="on">
          <b className="wd-t11" style={{ color: "#3568d4" }}>김준표 · 검토 (나)</b>
          <p className="wd-t9 wd-faint" style={{ margin: "3px 0 0" }}>지금 내 차례</p>
        </div>
        <div style={{ paddingBottom: 0 }}>
          <b className="wd-t11">정민재 · 승인</b>
          <p className="wd-t9 wd-faint" style={{ margin: "3px 0 0" }}>대기</p>
        </div>
      </div>
      <dl className="wd-kv one" style={{ margin: "20px 0" }}>
        <div><dt>사용 예정일</dt><dd>2026.11.01</dd></div>
        <div><dt>요청 사유</dt><dd style={{ fontWeight: 500, lineHeight: 1.7 }}>트래픽 증가로 DB 인스턴스를 한 단계 올려야 해요. 3개월 사용 예정이에요.</dd></div>
      </dl>
      <div className="wd-file">
        <span className="ext">PDF</span>
        <div>
          <b>AWS_견적.pdf</b>
          <small>120KB</small>
        </div>
        <span className="end">↓</span>
      </div>
      <div className="wd-input ph" style={{ marginTop: 16 }}>검토 의견 (선택)</div>
    </Mobile>
  );
}

function Spec({ title, note, before, after }: { title: string; note: string; before: ReactNode; after: ReactNode }) {
  return (
    <div className="wd-spec">
      <b>{title}</b>
      <div className="col">
        <span className="before">지금</span>
        {before}
      </div>
      <div className="col">
        <span className="after">바꿀 모양</span>
        {after}
      </div>
      <small>{note}</small>
    </div>
  );
}

// 13-1 기존 화면 스타일 통일안
export function StyleGuide() {
  return (
    <div className="wd-screen pf-shell">
      <Header />
      <div className="wd-wrap wd-pb">
        <section className="wd-hero sm">
          <div>
            <Eyebrow>STYLE UNIFY</Eyebrow>
            <h1>기존 화면 스타일 통일안</h1>
            <p>기존 웹과 새 기능이 한 서비스처럼 보이도록 맞출 규칙이에요.</p>
          </div>
        </section>
        <Spec
          title="1. 버튼 계층"
          note="검정 = 주요 행동 · 파랑 = 승인/확인처럼 긍정 강조 · 회색 = 취소"
          before={
            <div className="wd-row">
              <span className="wd-btn blue">저장하기</span>
              <span className="wd-btn" style={{ width: 200 }}>확인</span>
            </div>
          }
          after={
            <div className="wd-row">
              <span className="wd-btn ghost">취소</span>
              <span className="wd-btn">저장</span>
              <span className="wd-btn blue">승인하기</span>
            </div>
          }
        />
        <Spec
          title="2. 제목 굵기"
          note="화면 제목 620 · 섹션 제목 650 · 얇은 400 제목은 쓰지 않음"
          before={<span style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-.04em" }}>돈의 흐름을 요약했어요</span>}
          after={<span style={{ fontSize: 22, fontWeight: 650, letterSpacing: "-.04em" }}>돈의 흐름을 요약했어요</span>}
        />
        <Spec
          title="3. 입력창 포커스"
          note="노란 포커스 링을 파랑 하나로"
          before={<div className="wd-input" style={{ borderColor: "#d4a914", boxShadow: "0 0 0 4px #ffd84d26", background: "#fff" }}>이메일</div>}
          after={<div className="wd-input focus">이메일</div>}
        />
        <Spec
          title="4. 안내 메시지"
          note="폼 안 노란 박스 → 결과는 토스트, 주의는 배너"
          before={<div style={{ background: "#fff7df", color: "#806000", borderRadius: 9, padding: 11, fontSize: 9 }}>접근 요청을 보냈어요. 승인 후 인하우스에 들어올 수 있습니다.</div>}
          after={
            <div className="wd-banner" style={{ padding: "12px 14px" }}>
              <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>✓</span>
              <div>
                <b style={{ fontSize: 11 }}>가입 요청을 보냈어요</b>
                <p>운영진이 승인하면 메일로 알려드려요.</p>
              </div>
            </div>
          }
        />
        <Spec
          title="5. 모달 머리"
          note="작은 라벨은 회색 영문 대문자 · 제목 650"
          before={
            <div>
              <span style={{ color: "#3182f6", fontSize: 8, fontWeight: 800, letterSpacing: ".14em" }}>MY PROFILE</span>
              <div style={{ fontSize: 22, fontWeight: 400, marginTop: 6 }}>프로필 수정</div>
            </div>
          }
          after={
            <div>
              <span style={{ color: "#6b7684", fontSize: 8, fontWeight: 750, letterSpacing: ".14em" }}>MY PROFILE</span>
              <div style={{ fontSize: 22, fontWeight: 650, marginTop: 6, letterSpacing: "-.04em" }}>프로필 수정</div>
            </div>
          }
        />
        <Spec
          title="6. 제목 위 점"
          note="모든 페이지 파란 점 하나로"
          before={
            <span className="wd-eyebrow">
              <i style={{ background: "#ffc83d" }} /> NATIVE TEAMSPACE
            </span>
          }
          after={<Eyebrow>NATIVE TEAMSPACE</Eyebrow>}
        />
        <Spec
          title="7. 페이지 첫 제목"
          note="목록·홈은 42px 왼쪽 정렬, 상세는 30px · 가운데 58px 대형 제목은 홈 히어로에만"
          before={<span style={{ fontSize: 34, fontWeight: 650, letterSpacing: "-.07em", textAlign: "center", display: "block" }}>필요한 안건을 결재로 올려요.</span>}
          after={<span style={{ fontSize: 26, fontWeight: 620, letterSpacing: "-.06em" }}>필요한 안건을 결재로 올려요.</span>}
        />
        <Spec
          title="8. 결재 유형 카드"
          note="종이 아이콘·빈 공간 줄이고, 필요한 입력과 걸리는 시간 표시"
          before={
            <div className="wd-card" style={{ height: 150, position: "relative" }}>
              <span style={{ position: "absolute", right: 20, top: 18, width: 22, height: 28, border: "1px solid #b0b8c1", borderRadius: 3 }} />
              <span className="wd-t9 wd-faint" style={{ position: "absolute", bottom: 50, left: 22, fontWeight: 800, letterSpacing: ".14em" }}>EXPENSE</span>
              <b style={{ position: "absolute", bottom: 22, left: 22, fontSize: 16 }}>비용 승인 요청</b>
            </div>
          }
          after={
            <div className="wd-card" style={{ padding: 20 }}>
              <div className="wd-between">
                <span className="wd-av blue" style={{ borderRadius: 12 }}>₩</span>
                <span className="wd-badge">평균 승인 1.5일</span>
              </div>
              <b style={{ display: "block", margin: "14px 0 4px", fontSize: 15 }}>비용 승인 요청</b>
              <span className="wd-t10 wd-faint">금액 · 사용일 · 견적서 → 작성하기</span>
            </div>
          }
        />
        <Spec
          title="9. 수금 상세"
          note="재무 페이지의 수금 모달과 수금 내역의 계약 상세를 하나로 (진행 단계 · 계약서 포함)"
          before={<div className="wd-card soft" style={{ padding: 14 }}><b className="wd-t11">BRIDGE 수금 내역</b><p className="wd-t9 wd-faint" style={{ margin: "6px 0 0" }}>금액 · 거래처 · 상태 · 배분 표 + 꽉 찬 확인 버튼</p></div>}
          after={<div className="wd-card" style={{ padding: 14 }}><b className="wd-t11">Book-on 앱 개발</b><p className="wd-t9 wd-faint" style={{ margin: "6px 0 0" }}>총액·수금률 · 6단계 진행 · 담당 PM · 계약서 (03-2 화면)</p></div>}
        />
      </div>
    </div>
  );
}
