import Screen, { Eyebrow } from "../Screen";

const TODOS = [
  { tag: "결재", tone: "blue", title: "Moil 서버 비용 승인 검토", meta: "박도윤 · 비용 승인 · 2시간 전", cta: "바로 검토" },
  { tag: "문서", tone: "orange", title: "외주 수금 및 풀 배분 기준 개정 확인", meta: "제도 변경 · 10.27 시행", cta: "읽기" },
  { tag: "일정", tone: "violet", title: "10월 전체 회의 참석 응답", meta: "10.28 (수) 19:00 · 본관 302호", cta: "응답" },
];

const SHORTCUTS = [
  ["01", "전자결재", "비용·인력 결재 올리기"],
  ["02", "재무", "풀 잔액과 수금 확인"],
  ["03", "문서함", "규칙과 템플릿 찾기"],
  ["04", "게시판", "팀 이야기 나누기"],
  ["05", "문의·건의", "운영진에게 묻기"],
  ["06", "팀원", "부서와 조직도 보기"],
];

const FEED = [
  { kind: "필독", tone: "red", title: "10월 정산 일정 안내 — 영수증은 10.30까지", meta: "NativeOps · 오늘", pin: true },
  { kind: "제도", tone: "orange", title: "외주 수금 및 풀 배분 기준이 개정됐어요", meta: "PMO · 어제" },
  { kind: "일정", tone: "violet", title: "10월 전체 회의 · 10.28 (수) 19:00", meta: "Leader · 2일 전" },
  { kind: "게시판", tone: "", title: "Book-on 베타 테스터 모집합니다 (iOS)", meta: "익명 3 · 댓글 12" },
];

// #3 오늘 할 일 + 새 결재 배너, #4 바로가기 확장, #5 공지 피드
export function HomeExtended() {
  return (
    <Screen active="홈">
      <div className="wd-wrap wd-pb">
        <section className="wd-hero">
          <div>
            <Eyebrow>NATIVE TEAMSPACE</Eyebrow>
            <h1>
              준표님, 오늘 확인할 일이
              <br />
              3개 있어요.
            </h1>
            <p>결재·문서·일정 중 내 응답이 필요한 것만 모았어요.</p>
          </div>
          <span className="wd-t10 wd-faint">2026년 10월 24일 토요일</span>
        </section>

        <div className="wd-banner dark" style={{ marginBottom: 14 }}>
          <span className="ico">✓</span>
          <div>
            <b>새 결재 2건이 도착했어요</b>
            <p>Moil 서버 비용 승인 · Book-on 디자이너 1명 지원</p>
          </div>
          <span className="wd-btn blue sm">받은 결재 보기 →</span>
        </div>

        <div className="wd-side" style={{ marginBottom: 56 }}>
          <section className="wd-card">
            <div className="wd-card-head">
              <h3>오늘 할 일</h3>
              <span className="wd-t9 wd-faint">3개 중 0개 완료</span>
            </div>
            <div className="wd-list">
              {TODOS.map((t) => (
                <div className="wd-li" key={t.title}>
                  <span className={`wd-badge ${t.tone}`}>{t.tag}</span>
                  <div>
                    <b>{t.title}</b>
                    <p>{t.meta}</p>
                  </div>
                  <span className="wd-btn line sm">{t.cta}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="wd-card soft">
            <div className="wd-card-head">
              <h3>이번 달 운영풀</h3>
              <a className="wd-link">재무 →</a>
            </div>
            <div className="wd-stat">
              <small>사용 가능</small>
              <strong>3,482,000원</strong>
              <em>지난달보다 +412,000원</em>
            </div>
            <div className="wd-bar" style={{ marginTop: 18 }}>
              <i style={{ width: "62%" }} />
            </div>
            <div className="wd-between wd-t9 wd-faint" style={{ marginTop: 8 }}>
              <span>사용 2,118,000원</span>
              <span>62%</span>
            </div>
          </section>
        </div>

        <div className="wd-sec-title">
          <div>
            <Eyebrow>WORKSPACE</Eyebrow>
            <h2>바로가기</h2>
          </div>
        </div>
        <div className="wd-grid" style={{ gridTemplateColumns: "repeat(6,1fr)", marginBottom: 56 }}>
          {SHORTCUTS.map(([n, t, c]) => (
            <div className="wd-card" key={t} style={{ padding: 18, minHeight: 120, display: "flex", flexDirection: "column" }}>
              <span className="wd-t9 wd-faint" style={{ fontWeight: 800, letterSpacing: ".1em" }}>{n}</span>
              <b style={{ marginTop: "auto", fontSize: 13 }}>{t}</b>
              <span className="wd-t9 wd-faint" style={{ marginTop: 5 }}>{c}</span>
            </div>
          ))}
        </div>

        <div className="wd-sec-title">
          <div>
            <Eyebrow>NOTICE</Eyebrow>
            <h2>지금 팀이 알아야 할 것들</h2>
          </div>
          <a className="wd-link">공지 전체 보기 →</a>
        </div>
        <div className="wd-card" style={{ padding: "6px 22px" }}>
          <div className="wd-list">
            {FEED.map((f) => (
              <div className="wd-li" key={f.title}>
                <span className={`wd-badge ${f.tone}`}>{f.kind}</span>
                <div>
                  <b>
                    {f.pin && <span className="wd-badge dark" style={{ marginRight: 8, height: 18 }}>고정</span>}
                    {f.title}
                  </b>
                </div>
                <span className="r">{f.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}

type Noti = { ico: string; tone: string; title: string; meta: string; unread?: boolean; actions?: boolean; kind: string };

const TODAY: Noti[] = [
  { ico: "결", tone: "blue", kind: "내 업무", title: "박도윤님이 'Moil 서버 비용' 결재를 요청했어요", meta: "비용 승인 · 182,000원 · 10분 전", unread: true, actions: true },
  { ico: "재", tone: "green", kind: "재정", title: "Book-on 2차 중도금 1,500,000원이 입금됐어요", meta: "운영풀 +900,000원 · 적립풀 +600,000원 · 1시간 전", unread: true },
  { ico: "공", tone: "orange", kind: "공지", title: "[필독] 10월 정산 일정 안내", meta: "NativeOps · 3시간 전", unread: true },
];
const EARLIER: Noti[] = [
  { ico: "일", tone: "violet", kind: "일정", title: "10월 전체 회의 일정이 10.28 (수) 19:00로 바뀌었어요", meta: "Leader · 어제 18:20" },
  { ico: "결", tone: "blue", kind: "내 업무", title: "'Book-on 테스트 기기 구매' 결재가 승인됐어요", meta: "최하은 승인 · 어제 14:02" },
  { ico: "문", tone: "", kind: "공지", title: "'외주 수금 및 풀 배분 기준'이 개정됐어요", meta: "제도 변경 · 10.22" },
];

function NotiRow({ n }: { n: Noti }) {
  return (
    <div className={`wd-li ${n.unread ? "unread" : ""}`} style={{ padding: "16px 14px", borderRadius: 0 }}>
      <span className={`ico ${n.tone}`}>{n.ico}</span>
      <div>
        <b>
          {n.unread && <span className="wd-dot" style={{ marginRight: 7, verticalAlign: 2 }} />}
          {n.title}
        </b>
        <p>{n.meta}</p>
        {n.actions && (
          <div className="wd-row" style={{ marginTop: 10, gap: 6 }}>
            <span className="wd-btn blue sm">바로 검토</span>
            <span className="wd-btn ghost sm">나중에</span>
          </div>
        )}
      </div>
      <span className="wd-badge">{n.kind}</span>
    </div>
  );
}

// #6 알림 센터, #7 종류별 탭, #8 모두 읽음, #9 바로 처리, #11 딥링크(행 클릭 → 해당 화면)
export function Notifications() {
  return (
    <Screen bellOn>
      <div className="wd-narrow wd-pb">
        <section className="wd-hero sm">
          <div>
            <Eyebrow>NOTIFICATIONS</Eyebrow>
            <h1>알림</h1>
            <p>안 읽은 알림 3개 · 항목을 누르면 해당 화면으로 이동해요.</p>
          </div>
          <div className="wd-row">
            <span className="wd-btn line sm">알림 설정</span>
            <span className="wd-btn ghost sm">✓ 모두 읽음</span>
          </div>
        </section>
        <div className="wd-tabs" style={{ marginBottom: 18 }}>
          <span className="on">전체<small>6</small></span>
          <span>내 업무<small>2</small></span>
          <span>재정<small>1</small></span>
          <span>일정<small>1</small></span>
          <span>공지<small>2</small></span>
        </div>
        <div className="wd-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="wd-group-label" style={{ padding: "16px 18px 6px" }}>오늘</div>
          <div className="wd-list">{TODAY.map((n) => <NotiRow key={n.title} n={n} />)}</div>
          <div className="wd-group-label" style={{ padding: "16px 18px 6px", borderTop: "1px solid #e5e8eb" }}>이번 주</div>
          <div className="wd-list">{EARLIER.map((n) => <NotiRow key={n.title} n={n} />)}</div>
        </div>
      </div>
    </Screen>
  );
}

// #6 헤더 벨 드롭다운 + #10 웹 푸시 권한 요청
export function BellDropdown() {
  return (
    <Screen active="홈" bellOn>
      <div className="wd-wrap">
        <section className="wd-hero">
          <div>
            <Eyebrow>NATIVE TEAMSPACE</Eyebrow>
            <h1>
              준표님, 오늘 확인할 일이
              <br />
              3개 있어요.
            </h1>
            <p>결재·문서·일정 중 내 응답이 필요한 것만 모았어요.</p>
          </div>
        </section>
        <div className="wd-card" style={{ height: 300, opacity: 0.5 }} />
      </div>
      <div className="wd-pop" style={{ top: 70, right: 300, width: 400 }}>
        <div className="wd-between" style={{ padding: "18px 18px 12px" }}>
          <b style={{ fontSize: 14 }}>알림</b>
          <span className="wd-t10 wd-muted">모두 읽음</span>
        </div>
        <div className="wd-banner" style={{ margin: "0 12px 8px", padding: "12px 14px", borderRadius: 13 }}>
          <span className="ico" style={{ width: 28, height: 28, fontSize: 12 }}>!</span>
          <div>
            <b style={{ fontSize: 11 }}>브라우저 알림 켜기</b>
            <p style={{ fontSize: 9 }}>탭을 닫아도 결재·공지를 바로 받아요</p>
          </div>
          <span className="wd-btn blue sm">허용</span>
        </div>
        <div className="wd-list" style={{ maxHeight: 330 }}>
          {TODAY.map((n) => (
            <div className="wd-li unread" key={n.title} style={{ padding: "12px 16px", gridTemplateColumns: "auto 1fr" }}>
              <span className={`ico ${n.tone}`} style={{ width: 30, height: 30, fontSize: 10 }}>{n.ico}</span>
              <div>
                <b style={{ fontSize: 11 }}>{n.title}</b>
                <p>{n.meta}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: "1px solid #e5e8eb", textAlign: "center" }}>
          <span className="wd-t10 wd-muted" style={{ fontWeight: 650 }}>알림 전체 보기 →</span>
        </div>
      </div>
    </Screen>
  );
}
