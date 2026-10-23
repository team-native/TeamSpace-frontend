import Screen, { Eyebrow } from "../Screen";

const STATUS = [
  ["전체", 7, ""],
  ["작성 중", 1, ""],
  ["결재 대기", 2, "orange"],
  ["검토 중", 1, "blue"],
  ["승인", 2, "green"],
  ["반려", 1, "red"],
] as const;

const MINE = [
  { s: "검토 중", t: "blue", title: "Book-on 테스트 기기 구매", meta: "비용 승인 · 물품 구매 · 10.24", amt: "420,000원", line: "최하은 → 정민재" },
  { s: "결재 대기", t: "orange", title: "Figma 팀 플랜 연간 구독", meta: "비용 승인 · 도구·구독 · 10.23", amt: "540,000원", line: "최하은" },
  { s: "작성 중", t: "", title: "11월 해커톤 간식비", meta: "비용 승인 · 교육·행사 · 임시 저장", amt: "150,000원", line: "—" },
  { s: "승인", t: "green", title: "Moil 디자이너 1명 지원", meta: "인력 지원 · Design 1명 · 10.18", amt: "4주", line: "완료" },
  { s: "반려", t: "red", title: "외부 강연 초청비", meta: "비용 승인 · 외부 비용 · 10.12", amt: "300,000원", line: "사유 확인" },
];

const RECEIVED = [
  { who: "박도윤", t: "violet", title: "Moil 서버 비용", meta: "비용 승인 · 도구·구독 · 10분 전", amt: "182,000원" },
  { who: "한지우", t: "orange", title: "Book-on 디자이너 1명 지원", meta: "인력 지원 · Design 1명 · 2시간 전", amt: "3주" },
];

// #21 상태 5단계 필터, #27 받은 결재 목록 (대기 + 처리한 결재)
export function ApprovalList() {
  return (
    <Screen active="결재">
      <div className="wd-wrap wd-pb">
        <section className="wd-hero">
          <div>
            <Eyebrow>APPROVAL · 전자결재</Eyebrow>
            <h1>결재함</h1>
            <p>내가 올린 결재와 나에게 온 결재를 한곳에서 처리해요.</p>
          </div>
          <span className="wd-btn">+ 새 결재 작성</span>
        </section>

        <div className="wd-side">
          <div>
            <div className="wd-between" style={{ marginBottom: 14 }}>
              <div className="wd-tabs">
                <span className="on">내가 올린 결재<small>7</small></span>
                <span>받은 결재<small>2</small></span>
              </div>
              <div className="wd-search" style={{ width: 240, height: 40 }}>
                <i>⌕</i>제목 검색
              </div>
            </div>
            <div className="wd-chips" style={{ marginBottom: 14 }}>
              {STATUS.map(([s, c]) => (
                <span key={s} className={`wd-chip ${s === "전체" ? "on" : ""}`}>
                  {s} <small style={{ opacity: 0.6 }}>{c}</small>
                </span>
              ))}
            </div>
            <div className="wd-card" style={{ padding: "4px 20px" }}>
              <div className="wd-list">
                {MINE.map((m) => (
                  <div className="wd-li" key={m.title} style={{ gridTemplateColumns: "72px 1fr 120px auto" }}>
                    <span className={`wd-badge ${m.t}`} style={{ justifySelf: "start" }}>{m.s}</span>
                    <div>
                      <b>{m.title}</b>
                      <p>{m.meta}</p>
                    </div>
                    <span className="wd-t9 wd-faint">결재선 {m.line}</span>
                    <span className="r"><strong>{m.amt}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="wd-stack">
            <section className="wd-card" style={{ borderColor: "#cfe0fd" }}>
              <div className="wd-card-head">
                <h3>받은 결재</h3>
                <span className="wd-badge blue">대기 2</span>
              </div>
              {RECEIVED.map((r) => (
                <div key={r.title} className="wd-li" style={{ gridTemplateColumns: "auto 1fr" }}>
                  <span className={`wd-av ${r.t}`}>{r.who.slice(1, 2)}</span>
                  <div>
                    <b>{r.title}</b>
                    <p>{r.who} · {r.meta}</p>
                    <div className="wd-row" style={{ marginTop: 8, gap: 6 }}>
                      <span className="wd-btn blue sm">검토하기</span>
                      <span className="wd-t10" style={{ fontWeight: 700 }}>{r.amt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </section>
            <section className="wd-card soft">
              <div className="wd-card-head">
                <h3>내가 처리한 결재</h3>
                <a className="wd-link">전체 →</a>
              </div>
              {[
                ["승인", "green", "Book-on 도메인 갱신", "10.22"],
                ["반려", "red", "개인 장비 구매 지원", "10.19"],
                ["승인", "green", "NativeLab 서버 비용", "10.15"],
              ].map(([s, t, x, d]) => (
                <div key={x} className="wd-between wd-t10" style={{ padding: "8px 0" }}>
                  <span className="wd-row" style={{ gap: 8 }}>
                    <span className={`wd-badge ${t}`}>{s}</span>
                    {x}
                  </span>
                  <span className="wd-faint wd-t9">{d}</span>
                </div>
              ))}
            </section>
          </aside>
        </div>
      </div>
    </Screen>
  );
}

// #22 첨부, #23 결재선, #24 임시 저장 (+ 앱 기준 비용 유형/인력 칩)
export function ApprovalWrite() {
  return (
    <Screen active="결재">
      <div className="wd-wrap wd-pb">
        <div className="wd-crumb">결재 › <b>비용 승인 요청</b></div>
        <section className="wd-hero sm">
          <div>
            <Eyebrow>EXPENSE</Eyebrow>
            <h1>비용 승인 요청</h1>
            <p>Native 자금이 필요한 모든 요청을 한 경로로 올려요.</p>
          </div>
          <span className="wd-t10 wd-faint">✓ 10:42 자동 저장됨</span>
        </section>
        <div className="wd-side">
          <div className="wd-card" style={{ padding: 28 }}>
            <label className="wd-field">
              <span>비용 유형</span>
              <div className="wd-seg">
                {["물품 구매", "도구·구독", "외부 비용", "교육·행사", "기타"].map((x) => (
                  <span key={x} className={x === "물품 구매" ? "on" : ""}>{x}</span>
                ))}
              </div>
            </label>
            <label className="wd-field">
              <span>제목</span>
              <div className="wd-input">Book-on 테스트 기기 구매</div>
            </label>
            <div className="wd-grid g2">
              <label className="wd-field">
                <span>요청 금액</span>
                <div className="wd-input focus">420,000<span className="end">원</span></div>
              </label>
              <label className="wd-field">
                <span>사용 예정일</span>
                <div className="wd-input">2026.10.28<span className="end">▾</span></div>
              </label>
            </div>
            <label className="wd-field">
              <span>연결 프로젝트 <em>선택</em></span>
              <div className="wd-input">Book-on<span className="end">▾</span></div>
            </label>
            <label className="wd-field">
              <span>요청 사유 <em>86 / 500</em></span>
              <div className="wd-input area">iOS 17 실기기 테스트용 iPhone 1대가 필요해요. 현재 테스트 기기가 iOS 16 한 대뿐이라 위젯·라이브 액티비티 QA가 막혀 있어요.</div>
            </label>
            <label className="wd-field" style={{ marginBottom: 0 }}>
              <span>첨부파일 <em>견적서 · 영수증 · 최대 10MB</em></span>
              <div className="wd-stack" style={{ gap: 8 }}>
                <div className="wd-file">
                  <span className="ext">PDF</span>
                  <div>
                    <b>애플스토어_견적서.pdf</b>
                    <small>284KB</small>
                  </div>
                  <span className="end">×</span>
                </div>
                <div className="wd-drop">
                  <b>파일을 끌어다 놓거나 눌러서 선택</b>
                  PDF · JPG · PNG
                </div>
              </div>
            </label>
          </div>

          <aside className="wd-stack" style={{ position: "sticky", top: 0 }}>
            <section className="wd-card">
              <div className="wd-card-head">
                <h3>결재선</h3>
                <a className="wd-link">변경</a>
              </div>
              <div className="wd-tl">
                <div className="on">
                  <b className="wd-t11">김준표 · 기안</b>
                  <p className="wd-t9 wd-faint" style={{ margin: "3px 0 0" }}>Core Platform</p>
                </div>
                <div>
                  <b className="wd-t11">최하은 · 검토</b>
                  <p className="wd-t9 wd-faint" style={{ margin: "3px 0 0" }}>NativeOps 리드</p>
                </div>
                <div style={{ paddingBottom: 0 }}>
                  <b className="wd-t11">정민재 · 최종 승인</b>
                  <p className="wd-t9 wd-faint" style={{ margin: "3px 0 0" }}>FA · 30만원 이상 자동 추가</p>
                </div>
              </div>
            </section>
            <section className="wd-card soft">
              <h3 style={{ fontSize: 12 }}>인력 지원 요청이라면</h3>
              <p className="wd-t9 wd-faint" style={{ margin: "6px 0 10px" }}>직군을 고르고 인원을 정해요</p>
              <div className="wd-chips">
                <span className="wd-chip bon">iOS · 1</span>
                <span className="wd-chip">Web</span>
                <span className="wd-chip bon">Design · 1</span>
                <span className="wd-chip">PM</span>
              </div>
            </section>
            <div className="wd-row">
              <span className="wd-btn ghost" style={{ flex: 1 }}>임시 저장</span>
              <span className="wd-btn" style={{ flex: 2 }}>결재 올리기 →</span>
            </div>
          </aside>
        </div>
      </div>
    </Screen>
  );
}

function ApprovalDoc({ review = false }: { review?: boolean }) {
  return (
    <div className="wd-card" style={{ padding: 28 }}>
      <div className="wd-between" style={{ marginBottom: 22 }}>
        <div>
          <span className="wd-badge blue">검토 중</span>
          <h2 style={{ margin: "12px 0 6px", fontSize: 24, letterSpacing: "-.04em" }}>Book-on 테스트 기기 구매</h2>
          <span className="wd-t10 wd-faint">비용 승인 · 물품 구매 · 김준표 · 10.24 09:20</span>
        </div>
        <div className="wd-stat" style={{ textAlign: "right" }}>
          <small>요청 금액</small>
          <strong>420,000원</strong>
        </div>
      </div>
      <div className="wd-card soft" style={{ padding: "18px 10px", marginBottom: 22 }}>
        <div className="wd-line">
          <div className="done"><span className="wd-av">✓</span><b>김준표 · 기안</b><small>10.24 09:20</small></div>
          <div className={review ? "now" : "now"}><span className="wd-av">하</span><b>최하은 · 검토</b><small>{review ? "내 차례" : "검토 중"}</small></div>
          <div><span className="wd-av">민</span><b>정민재 · 승인</b><small>대기</small></div>
        </div>
      </div>
      <dl className="wd-kv" style={{ marginBottom: 22 }}>
        <div><dt>사용 예정일</dt><dd>2026.10.28</dd></div>
        <div><dt>연결 프로젝트</dt><dd>Book-on</dd></div>
        <div style={{ gridColumn: "1/-1" }}>
          <dt>요청 사유</dt>
          <dd style={{ fontWeight: 500, lineHeight: 1.7 }}>iOS 17 실기기 테스트용 iPhone 1대가 필요해요. 현재 테스트 기기가 iOS 16 한 대뿐이라 위젯·라이브 액티비티 QA가 막혀 있어요.</dd>
        </div>
      </dl>
      <b className="wd-t10" style={{ color: "#4e5968" }}>첨부파일 2</b>
      <div className="wd-grid g2" style={{ marginTop: 10 }}>
        <div className="wd-file"><span className="ext">PDF</span><div><b>애플스토어_견적서.pdf</b><small>284KB</small></div><span className="end">↓</span></div>
        <div className="wd-file"><span className="ext img">JPG</span><div><b>기존기기_상태.jpg</b><small>1.1MB</small></div><span className="end">↓</span></div>
      </div>
    </div>
  );
}

function Comments() {
  return (
    <section className="wd-card">
      <div className="wd-card-head"><h3>코멘트 2</h3></div>
      <div className="wd-comment">
        <span className="wd-av blue">하</span>
        <div>
          <header>최하은 <small>NativeOps · 1시간 전</small></header>
          <p>리퍼 제품도 괜찮다면 30만원대로 가능할 것 같아요. 확인 부탁드려요!</p>
        </div>
      </div>
      <div className="wd-comment">
        <span className="wd-av dark">준</span>
        <div>
          <header>김준표 <small>기안자 · 40분 전</small></header>
          <p>리퍼도 괜찮아요. 견적 다시 첨부할게요.</p>
        </div>
      </div>
      <div className="wd-input ph" style={{ marginTop: 6 }}>코멘트 남기기<span className="end">↵</span></div>
    </section>
  );
}

// #25 코멘트, #26 요청 취소 · 수정
export function ApprovalDetail() {
  return (
    <Screen active="결재">
      <div className="wd-wrap wd-pb">
        <div className="wd-crumb">결재 › 내가 올린 결재 › <b>Book-on 테스트 기기 구매</b></div>
        <div style={{ height: 24 }} />
        <div className="wd-side">
          <ApprovalDoc />
          <aside className="wd-stack">
            <section className="wd-card">
              <h3 style={{ fontSize: 12 }}>요청 관리</h3>
              <p className="wd-t9 wd-faint" style={{ margin: "6px 0 14px" }}>최종 승인 전까지 수정하거나 취소할 수 있어요.</p>
              <div className="wd-row">
                <span className="wd-btn line" style={{ flex: 1 }}>수정하기</span>
                <span className="wd-btn danger" style={{ flex: 1 }}>요청 취소</span>
              </div>
            </section>
            <Comments />
          </aside>
        </div>
      </div>
    </Screen>
  );
}

// #28 결재 검토 (의견 + 승인)
export function ApprovalReview() {
  return (
    <Screen active="결재">
      <div className="wd-wrap wd-pb">
        <div className="wd-crumb">결재 › 받은 결재 › <b>Book-on 테스트 기기 구매</b></div>
        <div style={{ height: 24 }} />
        <div className="wd-side">
          <ApprovalDoc review />
          <aside className="wd-stack">
            <section className="wd-card" style={{ borderColor: "#3182f6", boxShadow: "0 0 0 4px #3182f614" }}>
              <div className="wd-card-head">
                <h3>내 검토</h3>
                <span className="wd-badge blue">내 차례</span>
              </div>
              <label className="wd-field">
                <span>검토 의견 <em>선택</em></span>
                <div className="wd-input area" style={{ minHeight: 90 }}>리퍼 제품으로 진행해주세요. 영수증은 구매 후 3일 안에 올려주세요.</div>
              </label>
              <div className="wd-row">
                <span className="wd-btn danger" style={{ flex: 1 }}>반려</span>
                <span className="wd-btn blue" style={{ flex: 2 }}>승인하기</span>
              </div>
              <p className="wd-t9 wd-faint" style={{ margin: "10px 0 0", textAlign: "center" }}>승인하면 정민재님에게 최종 승인 요청이 가요</p>
            </section>
            <Comments />
          </aside>
        </div>
      </div>
    </Screen>
  );
}

// #29 반려 사유 입력
export function ApprovalReject() {
  return (
    <Screen
      active="결재"
      overlay={
        <div className="wd-scrim">
          <section className="wd-modal sm">
            <header>
              <div>
                <span>REJECT</span>
                <h2>반려 사유를 알려주세요</h2>
                <p>기안자에게 사유와 함께 알림이 가요.</p>
              </div>
              <span className="wd-x">×</span>
            </header>
            <div className="wd-modal-body">
              <div className="wd-stack" style={{ gap: 8, marginBottom: 14 }}>
                {["금액 조정이 필요해요", "증빙이 부족해요", "예산 범위를 넘어요", "직접 입력"].map((x, i) => (
                  <div key={x} className="wd-row wd-t11" style={{ padding: "10px 12px", border: "1px solid #e5e8eb", borderRadius: 11, borderColor: i === 1 ? "#3182f6" : undefined }}>
                    <span className={`wd-radio ${i === 1 ? "on" : ""}`} />
                    {x}
                  </div>
                ))}
              </div>
              <div className="wd-input area" style={{ minHeight: 80 }}>견적서 외에 기존 기기 상태 확인 자료가 필요해요.</div>
            </div>
            <div className="wd-foot">
              <span className="wd-btn ghost">취소</span>
              <span className="wd-btn" style={{ background: "#f04452" }}>반려하기</span>
            </div>
          </section>
        </div>
      }
    >
      <div className="wd-wrap" style={{ paddingTop: 60, opacity: 0.6 }}>
        <ApprovalDoc review />
      </div>
    </Screen>
  );
}
