import type { ReactNode } from "react";
import Screen, { Eyebrow } from "../Screen";

const NAV: [string, number?][] = [
  ["대시보드"],
  ["공지 관리", 0],
  ["일정 관리", 0],
  ["문서 개정", 0],
  ["문의 답변", 2],
  ["신고 처리", 1],
  ["재정 권한", 0],
  ["수주 · 입금", 1],
];

function Admin({ active, title, sub, right, children, overlay }: { active: string; title: string; sub?: string; right?: ReactNode; children: ReactNode; overlay?: ReactNode }) {
  return (
    <Screen overlay={overlay}>
      <div className="wd-admin">
        <aside>
          <div className="wd-row" style={{ gap: 8, padding: "0 12px 22px" }}>
            <span className="wd-badge dark">ADMIN</span>
            <b className="wd-t12">운영 관리</b>
          </div>
          <nav className="wd-toc">
            {NAV.map(([n, c]) => (
              <span key={n} className={n === active ? "on" : ""}>
                {n}
                {!!c && <b>{c}</b>}
              </span>
            ))}
          </nav>
          <p className="wd-t9 wd-faint" style={{ padding: "22px 12px 0", lineHeight: 1.6 }}>
            Leader · NativeOps · FA 권한이 있는 사람만 보여요.
          </p>
        </aside>
        <main>
          <div className="wd-between" style={{ alignItems: "flex-end", marginBottom: 26 }}>
            <div>
              <Eyebrow>ADMIN</Eyebrow>
              <h1 style={{ margin: "14px 0 8px", fontSize: 30, letterSpacing: "-.06em", fontWeight: 620 }}>{title}</h1>
              {sub && <p className="wd-t11 wd-muted" style={{ margin: 0 }}>{sub}</p>}
            </div>
            {right}
          </div>
          {children}
        </main>
      </div>
    </Screen>
  );
}

function Toggle({ on = false, label, desc }: { on?: boolean; label: string; desc?: string }) {
  return (
    <div className="wd-between" style={{ padding: "12px 0", borderBottom: "1px solid #e5e8eb" }}>
      <div>
        <b className="wd-t11" style={{ fontWeight: 620 }}>{label}</b>
        {desc && <p className="wd-t9 wd-faint" style={{ margin: "3px 0 0" }}>{desc}</p>}
      </div>
      <span className={`wd-toggle ${on ? "on" : ""}`} />
    </div>
  );
}

// 08-1 관리자 대시보드: 지금 처리할 것
export function AdminHome() {
  return (
    <Admin active="대시보드" title="오늘 처리할 것" sub="운영진이 응답해야 하는 일을 모았어요.">
      <div className="wd-grid g4" style={{ marginBottom: 18 }}>
        {[
          ["답변 대기 문의", "2", "가장 오래된 건 2일 전", "orange"],
          ["신고 접수", "1", "게시글 1 · 댓글 0", "red"],
          ["입금 확인 필요", "1", "모일컴퍼니 800,000원", "blue"],
          ["필독 미확인", "6명", "10월 정산 일정 안내", ""],
        ].map(([k, v, s, t]) => (
          <div key={k} className="wd-card wd-stat">
            <small>{k}</small>
            <strong style={{ color: t === "red" ? "#f04452" : undefined }}>{v}</strong>
            <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 5 }}>{s}</span>
          </div>
        ))}
      </div>
      <div className="wd-grid g2">
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>바로 처리</h3>
          </div>
          {[
            ["문의", "orange", "영수증 제출 기한이 지나면 어떻게 되나요?", "FA · 익명 · 2일 전", "답변하기"],
            ["신고", "red", "학교 근처 조용한 작업 카페 추천해주세요", "개인정보 노출 · 1시간 전", "확인"],
            ["입금", "blue", "Moil 서버 고도화 · 800,000원", "모일컴퍼니 · 10.30 예정", "입금 등록"],
          ].map(([k, t, x, m, cta]) => (
            <div key={x} className="wd-li">
              <span className={`wd-badge ${t}`}>{k}</span>
              <div>
                <b>{x}</b>
                <p>{m}</p>
              </div>
              <span className="wd-btn line sm">{cta}</span>
            </div>
          ))}
        </section>
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>필독 확인 현황</h3>
            <span className="wd-link">리마인드 보내기</span>
          </div>
          {[
            ["10월 정산 일정 안내", 14],
            ["외주 수금 및 풀 배분 기준 개정", 14],
          ].map(([x, n]) => (
            <div key={x as string} style={{ padding: "12px 0" }}>
              <div className="wd-between wd-t11" style={{ marginBottom: 8 }}>
                <b style={{ fontWeight: 620 }}>{x}</b>
                <span className="wd-faint">{n} / 20명</span>
              </div>
              <div className="wd-bar">
                <i style={{ width: `${((n as number) / 20) * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="wd-avs" style={{ marginTop: 12 }}>
            {["시", "유", "도", "하", "태", "세"].map((c) => (
              <span key={c} className="wd-av sm">{c}</span>
            ))}
            <span className="wd-t9 wd-faint" style={{ marginLeft: 10, alignSelf: "center" }}>미확인 6명</span>
          </div>
        </section>
      </div>
    </Admin>
  );
}

// 08-2 공지 등록 (분류 · 고정 · 필독 · 관련 문서 · 알림 미리보기)
export function AdminNotice() {
  return (
    <Admin active="공지 관리" title="공지 등록" right={<div className="wd-row"><span className="wd-btn ghost">임시 저장</span><span className="wd-btn">등록하고 알림 보내기</span></div>}>
      <div className="wd-side">
        <div className="wd-card" style={{ padding: 28 }}>
          <div className="wd-field">
            <span>분류</span>
            <div className="wd-seg">
              <span className="on">필독</span>
              <span>제도</span>
              <span>일정</span>
              <span>일반</span>
            </div>
          </div>
          <label className="wd-field">
            <span>제목 <em>28 / 60</em></span>
            <div className="wd-input">10월 정산 일정 안내 — 영수증은 10.30까지</div>
          </label>
          <label className="wd-field">
            <span>본문</span>
            <div className="wd-input area" style={{ minHeight: 180 }}>
              10월 사용분 정산을 아래 일정으로 진행해요.
              <br />
              <br />- 영수증 제출 마감: 10.30 (금) 23:59
              <br />- FA 검토: 10.31
              <br />- 배분 완료 알림: 11.03
            </div>
          </label>
          <div className="wd-field" style={{ marginBottom: 0 }}>
            <span>관련 문서 <em>최대 3개</em></span>
            <div className="wd-chips">
              <span className="wd-chip bon">외주 수금 및 풀 배분 기준 ×</span>
              <span className="wd-chip" style={{ borderStyle: "dashed" }}>+ 문서함에서 선택</span>
            </div>
          </div>
        </div>
        <aside className="wd-stack">
          <section className="wd-card">
            <h3 style={{ fontSize: 12 }}>게시 옵션</h3>
            <Toggle on label="상단 고정" desc="공지 목록과 홈 피드 맨 위" />
            <Toggle on label="필독" desc="전원 확인 요청 · 확인 현황 집계" />
            <Toggle label="예약 게시" desc="지금 바로 게시" />
          </section>
          <section className="wd-card soft">
            <h3 style={{ fontSize: 12 }}>알림 미리보기</h3>
            <div className="wd-li unread" style={{ padding: "12px 10px", marginTop: 10, borderRadius: 12, gridTemplateColumns: "auto 1fr" }}>
              <span className="ico orange">공</span>
              <div>
                <b style={{ fontSize: 11 }}>[필독] 10월 정산 일정 안내</b>
                <p>NativeOps · 방금</p>
              </div>
            </div>
            <p className="wd-t9 wd-faint" style={{ margin: "10px 0 0" }}>전체 20명 · 방해 금지 시간인 사람은 아침에 받아요</p>
          </section>
        </aside>
      </div>
    </Admin>
  );
}

// 08-3 일정 등록 · 변경
export function AdminEvent() {
  return (
    <Admin active="일정 관리" title="일정 변경" sub="10월 전체 회의" right={<div className="wd-row"><span className="wd-btn danger">일정 취소</span><span className="wd-btn">변경 저장</span></div>}>
      <div className="wd-side">
        <div className="wd-card" style={{ padding: 28 }}>
          <label className="wd-field">
            <span>일정 이름</span>
            <div className="wd-input">10월 전체 회의</div>
          </label>
          <div className="wd-grid g2">
            <label className="wd-field">
              <span>날짜</span>
              <div className="wd-input focus">
                <span className="wd-faint" style={{ textDecoration: "line-through", marginRight: 8 }}>10.27 (화)</span>10.28 (수)<span className="end">▾</span>
              </div>
            </label>
            <label className="wd-field">
              <span>시간</span>
              <div className="wd-input">19:00 – 20:30<span className="end">▾</span></div>
            </label>
          </div>
          <label className="wd-field">
            <span>장소</span>
            <div className="wd-input">본관 302호 · 온라인 병행</div>
          </label>
          <div className="wd-field">
            <span>대상</span>
            <div className="wd-seg">
              <span className="on">전체</span>
              <span>부서 선택</span>
              <span>프로젝트 선택</span>
            </div>
          </div>
          <label className="wd-field" style={{ marginBottom: 0 }}>
            <span>안건</span>
            <div className="wd-input area" style={{ minHeight: 80 }}>11월 프로젝트 배정, 정산 기준 개정 안내</div>
          </label>
        </div>
        <aside className="wd-stack">
          <section className="wd-card">
            <h3 style={{ fontSize: 12 }}>참석 응답</h3>
            <Toggle on label="참석 응답 받기" desc="참석 · 불참 · 미정" />
            <Toggle on label="하루 전 리마인드" />
            <div className="wd-between wd-t10" style={{ paddingTop: 12 }}>
              <span className="wd-faint">현재 응답</span>
              <b>참석 12 · 불참 2 · 미응답 6</b>
            </div>
          </section>
          <div className="wd-banner" style={{ background: "#fff8dc" }}>
            <span className="ico" style={{ color: "#9a6b00" }}>!</span>
            <div>
              <b style={{ fontSize: 11 }}>날짜가 바뀌어요</b>
              <p>저장하면 응답한 14명에게 변경 알림이 가고, 응답은 초기화돼요.</p>
            </div>
          </div>
        </aside>
      </div>
    </Admin>
  );
}

// 08-4 문서 개정 + 변경 내역 작성
export function AdminDocRevise() {
  return (
    <Admin active="문서 개정" title="외주 수금 및 풀 배분 기준" sub="v2.2 → v2.3 개정" right={<div className="wd-row"><span className="wd-btn ghost">미리보기</span><span className="wd-btn">개정 게시</span></div>}>
      <div className="wd-side">
        <div className="wd-card" style={{ padding: 28 }}>
          <div className="wd-between" style={{ marginBottom: 16 }}>
            <b className="wd-t12">제3조 배분 비율</b>
            <span className="wd-badge orange">수정됨</span>
          </div>
          <div className="wd-grid g2" style={{ marginBottom: 22 }}>
            <div className="wd-card soft" style={{ padding: 16 }}>
              <span className="wd-t9 wd-faint" style={{ fontWeight: 750 }}>v2.2 (현재)</span>
              <p className="wd-t11" style={{ lineHeight: 1.8, margin: "8px 0 0" }}>
                ② 운영풀 60%, 적립풀 <span style={{ background: "#fff0f1", color: "#d83442", textDecoration: "line-through" }}>30%</span>, 배당풀 <span style={{ background: "#fff0f1", color: "#d83442", textDecoration: "line-through" }}>10%</span>.
              </p>
            </div>
            <div className="wd-card" style={{ padding: 16, borderColor: "#3182f6" }}>
              <span className="wd-t9" style={{ fontWeight: 750, color: "#3568d4" }}>v2.3 (편집 중)</span>
              <p className="wd-t11" style={{ lineHeight: 1.8, margin: "8px 0 0" }}>
                ② 운영풀 60%, 적립풀 <mark style={{ background: "#e7f6ee", color: "#1b8a55" }}>25%</mark>, 배당풀 <mark style={{ background: "#e7f6ee", color: "#1b8a55" }}>15%</mark>.
              </p>
            </div>
          </div>
          <div className="wd-between" style={{ marginBottom: 12 }}>
            <b className="wd-t12">제5조 정산 주기</b>
            <span className="wd-badge orange">수정됨</span>
          </div>
          <div className="wd-input area" style={{ minHeight: 70 }}>① 배당풀은 매월 말일 기준으로 정산한다.</div>
          <p className="wd-t10 wd-faint" style={{ margin: "16px 0 0" }}>+ 조항 추가 · 나머지 4개 조항은 변경 없음</p>
        </div>
        <aside className="wd-stack">
          <section className="wd-card">
            <label className="wd-field">
              <span>변경 요약 <em>변경 내역에 표시</em></span>
              <div className="wd-input area" style={{ minHeight: 70 }}>적립풀 30→25%, 배당풀 10→15%, 정산 주기 분기→월</div>
            </label>
            <label className="wd-field">
              <span>시행일</span>
              <div className="wd-input">2026.10.27<span className="end">▾</span></div>
            </label>
            <Toggle on label="제도 변경 알림 보내기" desc="전체 20명" />
            <Toggle on label="읽음 확인 요청" desc="시행일까지 전원 확인" />
          </section>
        </aside>
      </div>
    </Admin>
  );
}

// 08-5 문의 답변 · 상태 변경
export function AdminInquiry() {
  return (
    <Admin active="문의 답변" title="받은 문의" sub="익명 문의는 작성자가 보이지 않아요.">
      <div className="wd-grid" style={{ gridTemplateColumns: "340px 1fr", alignItems: "start" }}>
        <div className="wd-stack" style={{ gap: 8 }}>
          <div className="wd-tabs" style={{ marginBottom: 6 }}>
            <span className="on">대기<small>2</small></span>
            <span>검토 중<small>1</small></span>
            <span>완료<small>14</small></span>
          </div>
          {[
            ["접수", "", "영수증 제출 기한이 지나면 어떻게 되나요?", "FA · 익명 · 2일 전", true],
            ["접수", "", "게시판 이미지 첨부 기능 요청", "NativeOps · 이서연 · 오늘", false],
          ].map(([s, t, x, m, on]) => (
            <div key={x as string} className="wd-card" style={{ padding: 16, borderColor: on ? "#3182f6" : undefined }}>
              <span className={`wd-badge ${t}`}>{s}</span>
              <b style={{ display: "block", margin: "10px 0 4px", fontSize: 12 }}>{x}</b>
              <span className="wd-t9 wd-faint">{m}</span>
            </div>
          ))}
        </div>
        <section className="wd-card" style={{ padding: 28 }}>
          <div className="wd-between">
            <span className="wd-t9 wd-faint">문의 · FA · 익명 · 10.22 10:12</span>
            <div className="wd-seg" style={{ width: 280 }}>
              <span>접수</span>
              <span className="on">검토 중</span>
              <span>답변 완료</span>
            </div>
          </div>
          <h2 style={{ margin: "14px 0 10px", fontSize: 20, letterSpacing: "-.04em" }}>영수증 제출 기한이 지나면 어떻게 되나요?</h2>
          <p className="wd-t11" style={{ lineHeight: 1.75, color: "#333d4b", margin: "0 0 22px" }}>10월 사용분 영수증을 아직 못 받았는데, 30일이 지나면 정산에서 빠지는 건지 궁금해요.</p>
          <label className="wd-field">
            <span>답변 <em>FA 정민재 이름으로 보내져요</em></span>
            <div className="wd-input area focus" style={{ minHeight: 120 }}>30일이 지나도 빠지지 않아요. 결재 상세에서 &lsquo;영수증 추후 제출&rsquo;을 눌러두시면 11월 정산에 함께 반영됩니다.|</div>
          </label>
          <div className="wd-between">
            <div className="wd-chips">
              <span className="wd-chip">+ 자주 쓰는 답변</span>
              <span className="wd-chip">+ 문서 링크</span>
            </div>
            <div className="wd-row">
              <span className="wd-btn ghost">다른 부서로 넘기기</span>
              <span className="wd-btn">답변 보내기</span>
            </div>
          </div>
        </section>
      </div>
    </Admin>
  );
}

// 08-6 신고 처리
export function AdminReport() {
  return (
    <Admin active="신고 처리" title="신고 처리" sub="신고자는 운영진에게도 공개되지 않아요.">
      <div className="wd-side">
        <section className="wd-card" style={{ padding: 28 }}>
          <div className="wd-row" style={{ gap: 6, marginBottom: 14 }}>
            <span className="wd-badge red">개인정보 노출</span>
            <span className="wd-badge">신고 2회</span>
            <span className="wd-t9 wd-faint">게시글 · 1시간 전</span>
          </div>
          <div className="wd-card soft" style={{ padding: 18, marginBottom: 18 }}>
            <span className="wd-badge">자유</span>
            <b style={{ display: "block", margin: "10px 0 6px", fontSize: 14 }}>학교 근처 조용한 작업 카페 추천해주세요</b>
            <p className="wd-t11" style={{ margin: 0, lineHeight: 1.7, color: "#333d4b" }}>
              콘센트 많고 오래 있어도 눈치 안 보이는 곳이면 좋겠어요. <mark style={{ background: "#fff0f1", color: "#d83442" }}>010-****-1234로 연락 주셔도 돼요</mark>
            </p>
            <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 10 }}>작성자 익명 · 운영진은 신고 처리 시에만 작성자 확인 가능</span>
          </div>
          <b className="wd-t10" style={{ color: "#4e5968" }}>처리 방법</b>
          <div className="wd-stack" style={{ gap: 8, marginTop: 10 }}>
            {[
              ["문제 부분만 가리기", "해당 문장을 ••• 로 가리고 글은 유지", true],
              ["글 숨김", "작성자에게만 보이고 사유 알림", false],
              ["신고 반려", "문제없음 · 신고자에게 결과 알림", false],
            ].map(([t, d, on]) => (
              <div key={t as string} className="wd-row wd-t11" style={{ padding: "12px 14px", border: `1px solid ${on ? "#3182f6" : "#e5e8eb"}`, borderRadius: 12, gap: 10 }}>
                <span className={`wd-radio ${on ? "on" : ""}`} />
                <div>
                  <b style={{ fontWeight: 620 }}>{t}</b>
                  <p className="wd-t9 wd-faint" style={{ margin: "3px 0 0" }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="wd-row" style={{ justifyContent: "flex-end", marginTop: 18 }}>
            <span className="wd-btn">처리 완료</span>
          </div>
        </section>
        <aside className="wd-card">
          <div className="wd-card-head">
            <h3>처리 기록</h3>
          </div>
          {[
            ["반려", "", "Moil QA 감사 글", "10.20"],
            ["숨김", "red", "광고성 댓글", "10.11"],
            ["가림", "orange", "전화번호 노출 댓글", "10.03"],
          ].map(([s, t, x, d]) => (
            <div key={x} className="wd-between wd-t10" style={{ padding: "9px 0" }}>
              <span className="wd-row" style={{ gap: 8 }}>
                <span className={`wd-badge ${t}`}>{s}</span>
                {x}
              </span>
              <span className="wd-faint wd-t9">{d}</span>
            </div>
          ))}
        </aside>
      </div>
    </Admin>
  );
}

// 08-7 재정 정보 권한 부여
export function AdminFinanceRole() {
  const rows: [string, string, string, string, boolean, boolean][] = [
    ["준", "김준표", "Leader", "dark", true, true],
    ["민", "정민재", "FA", "green", true, true],
    ["하", "최하은", "NativeOps", "blue", true, false],
    ["도", "박도윤", "PMO", "violet", false, false],
    ["지", "한지우", "Core Platform", "orange", false, false],
  ];
  return (
    <Admin active="재정 권한" title="재정 정보 권한" sub="권한이 없으면 금액 대신 '권한 필요'로 보여요." right={<span className="wd-btn line">+ 권한 추가</span>}>
      <div className="wd-card" style={{ padding: "18px 22px 6px" }}>
        <table className="wd-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>부서</th>
              <th>전체 금액 열람</th>
              <th>수주 · 입금 등록</th>
              <th className="num">변경</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([i, n, d, t, view, edit]) => (
              <tr key={n}>
                <td>
                  <span className="wd-row" style={{ gap: 10 }}>
                    <span className={`wd-av sm ${t}`}>{i}</span>
                    <b>{n}</b>
                  </span>
                </td>
                <td>{d}</td>
                <td><span className={`wd-toggle ${view ? "on" : ""}`} style={{ display: "inline-block" }} /></td>
                <td><span className={`wd-toggle ${edit ? "on" : ""}`} style={{ display: "inline-block" }} /></td>
                <td className="num"><span className="wd-faint wd-t9">{n === "최하은" ? "방금 · 김준표" : "—"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="wd-banner gray" style={{ marginTop: 14 }}>
        <span className="ico">i</span>
        <div>
          <b style={{ fontSize: 11 }}>권한을 바꾸면 본인에게 알림이 가요</b>
          <p>Leader 권한은 항상 켜져 있고 끌 수 없어요.</p>
        </div>
      </div>
    </Admin>
  );
}

// 08-8 수주 · 입금 등록
export function AdminIncome() {
  return (
    <Admin
      active="수주 · 입금"
      title="수주 · 입금"
      right={<div className="wd-row"><span className="wd-btn line">+ 수주 등록</span><span className="wd-btn">+ 입금 등록</span></div>}
      overlay={
        <div className="wd-scrim">
          <section className="wd-modal">
            <header>
              <div>
                <span>INCOME</span>
                <h2>입금 등록</h2>
                <p>등록하면 배분이 계산되고 재정 알림이 가요.</p>
              </div>
              <span className="wd-x">×</span>
            </header>
            <div className="wd-modal-body">
              <label className="wd-field">
                <span>수주 건</span>
                <div className="wd-input">Moil 서버 고도화 · 모일컴퍼니<span className="end">▾</span></div>
              </label>
              <div className="wd-grid g2">
                <label className="wd-field">
                  <span>입금액</span>
                  <div className="wd-input focus">800,000<span className="end">원</span></div>
                </label>
                <label className="wd-field">
                  <span>입금일</span>
                  <div className="wd-input">2026.10.30<span className="end">▾</span></div>
                </label>
              </div>
              <b className="wd-t10" style={{ color: "#4e5968" }}>배분 미리보기 · 기준 v2.3</b>
              <div className="wd-grid g3" style={{ marginTop: 10 }}>
                {[
                  ["운영풀 60%", "480,000원", "#3182f6"],
                  ["적립풀 25%", "200,000원", "#7c5cff"],
                  ["배당풀 15%", "120,000원", "#ff8a3d"],
                ].map(([k, v, c]) => (
                  <div key={k} className="wd-card soft" style={{ padding: 14, boxShadow: `inset 0 3px 0 ${c}` }}>
                    <span className="wd-t9 wd-faint">{k}</span>
                    <b style={{ display: "block", marginTop: 6, fontSize: 13 }}>{v}</b>
                  </div>
                ))}
              </div>
            </div>
            <div className="wd-foot">
              <span className="wd-btn ghost">취소</span>
              <span className="wd-btn">입금 등록</span>
            </div>
          </section>
        </div>
      }
    >
      <div className="wd-card" style={{ padding: "18px 22px 6px" }}>
        <table className="wd-table">
          <thead>
            <tr>
              <th>수주 건</th>
              <th>고객사</th>
              <th>담당 PM</th>
              <th>상태</th>
              <th className="num">계약 / 수금</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Book-on 앱 개발", "그린랩", "박도윤", "제작", "blue", "4,500,000 / 3,000,000"],
              ["Moil 서버 고도화", "모일컴퍼니", "박도윤", "입금 대기", "orange", "1,900,000 / 0"],
              ["브랜드 사이트 리뉴얼", "스튜디오 해", "한지우", "청구 완료", "blue", "7,600,000 / 0"],
              ["출결 관리 웹", "한빛학원", "한지우", "수금 완료", "green", "1,500,000 / 1,500,000"],
              ["주문 키오스크 UI", "카페 소로", "박도윤", "연체", "red", "350,000 / 0"],
            ].map(([p, c, pm, s, t, a]) => (
              <tr key={p}>
                <td><b>{p}</b></td>
                <td>{c}</td>
                <td>{pm}</td>
                <td><span className={`wd-badge ${t}`}>{s}</span></td>
                <td className="num">{a}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Admin>
  );
}
