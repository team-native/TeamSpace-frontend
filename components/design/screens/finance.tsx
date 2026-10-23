import Screen, { Eyebrow, Modal } from "../Screen";

const ROWS = [
  { g: "2026년 10월" },
  { c: "그린랩", p: "Book-on 앱 개발", a: "1,500,000", s: "입금 완료", t: "green", d: "10.21" },
  { c: "모일컴퍼니", p: "Moil 서버 고도화", a: "800,000", s: "입금 대기", t: "orange", d: "10.30 예정" },
  { c: "스튜디오 해", p: "브랜드 사이트 리뉴얼", a: "2,200,000", s: "청구 완료", t: "blue", d: "10.15" },
  { g: "2026년 9월" },
  { c: "그린랩", p: "Book-on 앱 개발", a: "1,500,000", s: "입금 완료", t: "green", d: "09.20" },
  { c: "한빛학원", p: "출결 관리 웹", a: "600,000", s: "입금 완료", t: "green", d: "09.08" },
  { c: "카페 소로", p: "주문 키오스크 UI", a: "350,000", s: "연체", t: "red", d: "09.30 예정" },
];

function PeriodPicker() {
  return (
    <div className="wd-pop" style={{ top: 296, right: 130, width: 340, padding: 18 }}>
      <b className="wd-t11">기간 선택</b>
      <div className="wd-seg" style={{ margin: "12px 0 14px" }}>
        <span>이번 달</span>
        <span className="on">최근 3개월</span>
        <span>올해</span>
        <span>직접</span>
      </div>
      <div className="wd-row" style={{ gap: 8 }}>
        <div className="wd-input" style={{ minHeight: 38 }}>2026.08.01</div>
        <span className="wd-faint">~</span>
        <div className="wd-input" style={{ minHeight: 38 }}>2026.10.31</div>
      </div>
      <span className="wd-btn full" style={{ marginTop: 14 }}>적용</span>
    </div>
  );
}

function ReceiptsBody() {
  return (
    <div className="wd-wrap wd-pb">
      <div className="wd-crumb">재무 › <b>수금 내역</b></div>
      <section className="wd-hero sm">
        <div>
          <Eyebrow>RECEIPTS</Eyebrow>
          <h1>수금 내역</h1>
          <p>외주 수주부터 입금까지, 들어온 돈을 프로젝트별로 확인해요.</p>
        </div>
        <span className="wd-btn line sm">2026.08 – 2026.10 ▾</span>
      </section>
      <div className="wd-grid g4" style={{ marginBottom: 24 }}>
        {[
          ["누적 수주", "14,350,000원", "올해 9건"],
          ["입금 완료", "9,100,000원", "63%"],
          ["입금 대기", "3,000,000원", "3건"],
          ["연체", "350,000원", "1건 · 확인 필요"],
        ].map(([k, v, s], i) => (
          <div className="wd-card wd-stat" key={k}>
            <small>{k}</small>
            <strong style={{ color: i === 3 ? "#f04452" : undefined }}>{v}</strong>
            <span className="wd-t9 wd-faint" style={{ display: "block", marginTop: 5 }}>{s}</span>
          </div>
        ))}
      </div>
      <div className="wd-between" style={{ marginBottom: 12 }}>
        <div className="wd-tabs">
          <span className="on">전체<small>9</small></span>
          <span>청구 완료<small>2</small></span>
          <span>입금 대기<small>3</small></span>
          <span>입금 완료<small>3</small></span>
          <span>연체<small>1</small></span>
        </div>
        <span className="wd-t9 wd-faint">FA · Leader 권한으로 전체 금액이 보여요</span>
      </div>
      <div className="wd-card" style={{ padding: "18px 22px 6px" }}>
        <table className="wd-table">
          <thead>
            <tr>
              <th>고객사</th>
              <th>프로젝트</th>
              <th>상태</th>
              <th>일자</th>
              <th className="num">금액</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) =>
              r.g ? (
                <tr className="group" key={i}>
                  <td colSpan={5}>{r.g}</td>
                </tr>
              ) : (
                <tr key={i}>
                  <td><b>{r.c}</b></td>
                  <td>{r.p}</td>
                  <td><span className={`wd-badge ${r.t}`}>{r.s}</span></td>
                  <td className="wd-faint">{r.d}</td>
                  <td className="num">{r.a}원</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// #17 수금 내역 (누적 수주 · 상태 필터 · 월 그룹), #19 기간 선택, #20 권한별 공개 범위
export function Receipts() {
  return (
    <Screen active="재무" overlay={<PeriodPicker />}>
      <ReceiptsBody />
    </Screen>
  );
}

// #18 수주 상세 (진행 단계 · 담당 PM · 계약서)
export function ContractDetail() {
  const steps = ["상담", "견적", "계약", "제작", "납품", "수금"];
  return (
    <Screen
      active="재무"
      overlay={
        <Modal
          eyebrow="CONTRACT"
          title="Book-on 앱 개발"
          sub="그린랩 · 계약 2026.08.04"
          size="lg"
          footer={
            <>
              <span className="wd-btn ghost">닫기</span>
              <span className="wd-btn">입금 내역 보기</span>
            </>
          }
        >
          <div className="wd-between" style={{ marginBottom: 20 }}>
            <div className="wd-stat">
              <small>총 계약 금액</small>
              <strong>4,500,000원</strong>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="wd-t9 wd-faint">수금 3,000,000원 / 4,500,000원</span>
              <div className="wd-bar" style={{ width: 220, marginTop: 8 }}>
                <i style={{ width: "67%" }} />
              </div>
            </div>
          </div>
          <div className="wd-card soft" style={{ padding: "18px 10px", marginBottom: 20 }}>
            <div className="wd-line">
              {steps.map((s, i) => (
                <div key={s} className={i < 3 ? "done" : i === 3 ? "now" : ""}>
                  <span className="wd-av">{i < 3 ? "✓" : i + 1}</span>
                  <b>{s}</b>
                  <small>{["08.01", "08.02", "08.04", "진행 중", "11.20 예정", "—"][i]}</small>
                </div>
              ))}
            </div>
          </div>
          <dl className="wd-kv" style={{ marginBottom: 20 }}>
            <div><dt>담당 PM</dt><dd>박도윤 · PMO</dd></div>
            <div><dt>참여 인원</dt><dd>iOS 2 · Design 1 · Backend 1</dd></div>
            <div><dt>배분 기준</dt><dd>운영 60% · 적립 30% · 배당 10%</dd></div>
            <div><dt>다음 청구</dt><dd>잔금 1,500,000원 · 11.20</dd></div>
          </dl>
          <div className="wd-file">
            <span className="ext">PDF</span>
            <div>
              <b>Book-on_용역계약서_서명본.pdf</b>
              <small>1.2MB · 2026.08.04 업로드</small>
            </div>
            <span className="end">↓</span>
          </div>
        </Modal>
      }
    >
      <ReceiptsBody />
    </Screen>
  );
}
