import Screen, { Eyebrow } from "../Screen";

const DOCS = [
  ["RULE", "Native 프로젝트 운영 원칙", "아이디어 제안부터 PO 결정, 팀 구성과 출시까지의 기준", "2026.07.18"],
  ["FINANCE", "외주 수금 및 풀 배분 기준", "운영풀·적립풀·배당풀의 배분과 정산 방식", "2026.10.22"],
  ["TEMPLATE", "프로젝트 킥오프 문서", "목표, 사용자, 핵심 기능과 일정을 정리하는 시작 문서", "2026.07.10"],
  ["GUIDE", "외주 프로젝트 진행 가이드", "문의 접수부터 계약, 제작, 납품과 수금까지의 절차", "2026.07.08"],
];

// #30 최근 검색어, #31 최근 개정 배너
export function DocumentsSearch() {
  return (
    <Screen active="문서함">
      <div className="wd-wrap wd-pb">
        <section className="wd-hero">
          <div>
            <Eyebrow>TEAM LIBRARY</Eyebrow>
            <h1>
              팀의 기준을
              <br />
              한곳에서 찾아요.
            </h1>
            <p>운영 기준, 재무 정책, 업무 템플릿을 같은 문서함에서 관리합니다.</p>
          </div>
          <div style={{ position: "relative" }}>
            <div className="wd-search" style={{ borderColor: "#3182f6", boxShadow: "0 0 0 4px #3182f61f", color: "#191f28" }}>
              <i>⌕</i>|
            </div>
            <div className="wd-pop" style={{ top: 54, left: 0, width: 420, padding: 16 }}>
              <div className="wd-between" style={{ marginBottom: 10 }}>
                <b className="wd-t10">최근 검색어</b>
                <span className="wd-t9 wd-faint">전체 삭제</span>
              </div>
              <div className="wd-chips" style={{ marginBottom: 14 }}>
                {["배분", "킥오프", "회의록", "영수증"].map((x) => (
                  <span key={x} className="wd-chip">{x} <small style={{ opacity: 0.5 }}>×</small></span>
                ))}
              </div>
              <b className="wd-t10">자주 찾는 문서</b>
              {["외주 수금 및 풀 배분 기준", "프로젝트 킥오프 문서"].map((x) => (
                <div key={x} className="wd-row wd-t11" style={{ padding: "9px 0", gap: 8 }}>
                  <span className="wd-faint">→</span> {x}
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="wd-banner" style={{ marginBottom: 30, background: "#fff8dc" }}>
          <span className="ico" style={{ color: "#9a6b00" }}>!</span>
          <div>
            <b>&lsquo;외주 수금 및 풀 배분 기준&rsquo;이 개정됐어요 · 10.27 시행</b>
            <p>적립풀 비율 30% → 25%, 배당 정산 주기 분기 → 월. 아직 읽지 않았어요.</p>
          </div>
          <span className="wd-btn sm">바뀐 부분 보기</span>
        </div>
        <section className="pf-doc-body" style={{ width: "100%" }}>
          <aside>
            {["전체", "운영 규칙", "재무", "템플릿", "NativeLab", "팀 규칙"].map((n, i) => (
              <button key={n} className={i === 0 ? "active" : ""}>
                {n}
                <span>{[5, 1, 1, 1, 1, 1][i]}</span>
              </button>
            ))}
          </aside>
          <div className="pf-doc-list">
            <header>
              <b>전체</b>
              <span>5개의 문서</span>
            </header>
            {DOCS.map(([t, title, copy, date]) => (
              <article key={title} style={{ opacity: 1, transform: "none" }}>
                <small>{t}</small>
                <div>
                  <b>
                    {title} {title.startsWith("외주 수금") && <span className="wd-badge orange" style={{ marginLeft: 6 }}>개정</span>}
                  </b>
                  <p>{copy}</p>
                </div>
                <time>{date}</time>
                <i>→</i>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Screen>
  );
}

// #32 문서 상세 (목차 · 시행일 · 담당 부서), #33 개정 부분 강조, #34 읽음 확인
export function DocumentDetail() {
  return (
    <Screen active="문서함">
      <div className="wd-wrap wd-pb">
        <div className="wd-crumb">문서함 › 재무 › <b>외주 수금 및 풀 배분 기준</b></div>
        <section className="wd-hero sm">
          <div>
            <Eyebrow>FINANCE · v2.3</Eyebrow>
            <h1>외주 수금 및 풀 배분 기준</h1>
            <div className="wd-row wd-t10 wd-faint" style={{ gap: 16 }}>
              <span>시행 2026.10.27</span>
              <span>담당 FA · 정민재</span>
              <span>개정 2026.10.22</span>
            </div>
          </div>
          <div className="wd-row">
            <span className="wd-btn line sm">변경 내역</span>
            <span className="wd-btn line sm">링크 복사</span>
          </div>
        </section>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 260px", gap: 32, alignItems: "start" }}>
          <nav className="wd-toc">
            <b className="wd-t9 wd-faint" style={{ padding: "0 12px 8px" }}>목차</b>
            <span>제1조 목적</span>
            <span>제2조 용어</span>
            <span className="on">제3조 배분 비율 <em>개정</em></span>
            <span>제4조 수금 절차</span>
            <span>제5조 정산 주기 <em>개정</em></span>
            <span>제6조 예외</span>
          </nav>
          <article className="wd-card wd-doc" style={{ padding: 32 }}>
            <div className="wd-row wd-t10" style={{ marginBottom: 22, gap: 8 }}>
              <span className="wd-toggle on" />
              <span>개정된 부분 강조</span>
            </div>
            <h3>제3조 배분 비율</h3>
            <p>① 외주 수금액은 입금 확인 후 7일 안에 아래 비율로 배분한다.</p>
            <p>
              ② 운영풀 60%, 적립풀 <del>30%</del> <mark>25%</mark>, 배당풀 <del>10%</del> <mark>15%</mark>.
            </p>
            <p>③ 적립풀은 다음 분기 장비·교육 예산으로만 사용한다.</p>
            <h3>제4조 수금 절차</h3>
            <p>① 담당 PM은 납품 완료 후 3일 안에 청구서를 발행한다.</p>
            <p>② FA는 입금을 확인하고 재정 알림을 발송한다.</p>
            <h3>제5조 정산 주기</h3>
            <p>
              ① 배당풀은 <del>분기</del> <mark>매월 말일</mark> 기준으로 정산한다.
            </p>
          </article>
          <aside className="wd-stack">
            <section className="wd-card" style={{ borderColor: "#cfe0fd" }}>
              <h3 style={{ fontSize: 12 }}>읽음 확인</h3>
              <p className="wd-t9 wd-faint" style={{ margin: "6px 0 14px" }}>시행 전까지 전원 확인이 필요한 문서예요.</p>
              <div className="wd-between wd-t10" style={{ marginBottom: 8 }}>
                <span>14 / 20명 확인</span>
                <span className="wd-faint">70%</span>
              </div>
              <div className="wd-bar" style={{ marginBottom: 16 }}>
                <i style={{ width: "70%" }} />
              </div>
              <span className="wd-btn blue full">확인했어요</span>
            </section>
            <section className="wd-card soft">
              <h3 style={{ fontSize: 12 }}>관련 문서</h3>
              {["프로젝트 킥오프 문서", "외주 프로젝트 진행 가이드"].map((x) => (
                <div key={x} className="wd-between wd-t10" style={{ padding: "10px 0" }}>
                  {x} <span className="wd-faint">→</span>
                </div>
              ))}
            </section>
          </aside>
        </div>
      </div>
    </Screen>
  );
}

// #35 변경 내역 (버전)
export function DocumentHistory() {
  const v = [
    ["v2.3", "2026.10.22", "정민재", "적립풀 30→25%, 배당풀 10→15%, 정산 주기 분기→월", true],
    ["v2.2", "2026.07.15", "정민재", "수금 절차에 청구서 발행 기한(3일) 추가", false],
    ["v2.1", "2026.05.02", "최하은", "예외 조항(무상 프로젝트) 신설", false],
    ["v2.0", "2026.03.01", "김준표", "풀 3분할 체계 도입 (운영·적립·배당)", false],
  ] as const;
  return (
    <Screen active="문서함">
      <div className="wd-narrow wd-pb">
        <div className="wd-crumb">문서함 › 외주 수금 및 풀 배분 기준 › <b>변경 내역</b></div>
        <section className="wd-hero sm">
          <div>
            <Eyebrow>HISTORY</Eyebrow>
            <h1>변경 내역</h1>
            <p>버전을 누르면 그 시점의 문서와 바뀐 부분을 비교해요.</p>
          </div>
        </section>
        <div className="wd-tl">
          {v.map(([ver, date, who, note, cur]) => (
            <div key={ver} className={cur ? "on" : ""}>
              <div className="wd-card" style={{ padding: 18, borderColor: cur ? "#cfe0fd" : undefined }}>
                <div className="wd-between">
                  <div className="wd-row" style={{ gap: 8 }}>
                    <b style={{ fontSize: 14 }}>{ver}</b>
                    {cur && <span className="wd-badge blue">현재</span>}
                  </div>
                  <span className="wd-t9 wd-faint">{date} · {who}</span>
                </div>
                <p className="wd-t11" style={{ margin: "10px 0 12px", color: "#333d4b" }}>{note}</p>
                <div className="wd-row" style={{ gap: 6 }}>
                  <span className="wd-btn line sm">이 버전 보기</span>
                  {!cur && <span className="wd-btn ghost sm">현재와 비교</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

// #36 템플릿 상세, #37 템플릿으로 결재 작성
export function TemplateDetail() {
  return (
    <Screen active="문서함">
      <div className="wd-wrap wd-pb">
        <div className="wd-crumb">문서함 › 템플릿 › <b>장비 구매 요청서</b></div>
        <section className="wd-hero sm">
          <div>
            <Eyebrow>TEMPLATE</Eyebrow>
            <h1>장비 구매 요청서</h1>
            <p>테스트 기기·주변기기 구매를 결재로 올릴 때 쓰는 양식이에요.</p>
          </div>
          <div className="wd-row">
            <span className="wd-btn line sm">파일로 받기</span>
            <span className="wd-btn">이 템플릿으로 결재 작성 →</span>
          </div>
        </section>
        <div className="wd-side">
          <div className="wd-card" style={{ padding: 32 }}>
            <span className="wd-t9 wd-faint" style={{ fontWeight: 750, letterSpacing: ".1em" }}>미리보기</span>
            {[
              ["비용 유형", "물품 구매 (자동 선택)"],
              ["구매 품목", "모델명 · 수량 · 단가"],
              ["사용 목적", "어떤 테스트/작업에 쓰는지"],
              ["대체 방안", "기존 장비로 안 되는 이유"],
              ["견적서", "필수 첨부 · PDF/이미지"],
              ["반납 계획", "프로젝트 종료 후 보관 위치"],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: "16px 0", borderBottom: "1px solid #e5e8eb" }}>
                <b className="wd-t11">{k}</b>
                <div className="wd-input ph" style={{ marginTop: 8, minHeight: 38 }}>{v}</div>
              </div>
            ))}
          </div>
          <aside className="wd-stack">
            <section className="wd-card">
              <dl className="wd-kv one">
                <div><dt>연결 결재</dt><dd>비용 승인 · 물품 구매</dd></div>
                <div><dt>기본 결재선</dt><dd>NativeOps 리드 → FA</dd></div>
                <div><dt>담당 부서</dt><dd>NativeOps</dd></div>
                <div><dt>최근 수정</dt><dd>2026.09.30</dd></div>
              </dl>
            </section>
            <section className="wd-card soft">
              <h3 style={{ fontSize: 12 }}>이 템플릿으로 올린 결재</h3>
              <p className="wd-t9 wd-faint" style={{ margin: "6px 0 0" }}>이번 달 4건 · 평균 승인 1.5일</p>
            </section>
          </aside>
        </div>
      </div>
    </Screen>
  );
}
