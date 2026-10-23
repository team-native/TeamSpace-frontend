import Screen, { Eyebrow, Modal } from "../Screen";

export const PEOPLE = [
  { n: "김준표", d: "Leader", r: "Founder · iOS", t: "dark" },
  { n: "최하은", d: "NativeOps", r: "운영 리드", t: "blue" },
  { n: "박도윤", d: "PMO", r: "PM · Moil", t: "violet" },
  { n: "정민재", d: "FA", r: "재무 담당", t: "green" },
  { n: "이서연", d: "Core Platform", r: "iOS", t: "blue", isNew: true },
  { n: "한지우", d: "Core Platform", r: "Web", t: "orange" },
  { n: "오세린", d: "Design", r: "Product Designer", t: "violet", isNew: true },
  { n: "윤태오", d: "NativeLab", r: "Backend", t: "green" },
];

const DEPTS = [
  ["전체", 20],
  ["Leader", 1],
  ["NativeOps", 3],
  ["PMO", 2],
  ["FA", 2],
  ["Core Platform", 6],
  ["Design", 3],
  ["NativeLab", 3],
] as const;

function TeamList({ dim = false }: { dim?: boolean }) {
  return (
    <div className="wd-wrap wd-pb" style={{ opacity: dim ? 0.6 : 1 }}>
      <section className="wd-hero">
        <div>
          <Eyebrow>NATIVE PEOPLE</Eyebrow>
          <h1>
            함께 일하는
            <br />
            사람들을 찾아요.
          </h1>
          <p>이름, 부서, 역할로 검색하고 조직도로 한눈에 봐요.</p>
        </div>
        <div className="wd-row">
          <div className="wd-tabs">
            <span className="on">목록</span>
            <span>조직도</span>
          </div>
        </div>
      </section>

      <div className="wd-banner" style={{ marginBottom: 22 }}>
        <span className="ico">+2</span>
        <div>
          <b>이번 주 새 멤버가 합류했어요</b>
          <p>이서연 (Core Platform · iOS), 오세린 (Design) — 반갑게 맞아주세요.</p>
        </div>
        <div className="wd-avs" style={{ marginLeft: "auto" }}>
          <span className="wd-av blue">서</span>
          <span className="wd-av violet">세</span>
        </div>
      </div>

      <div className="wd-between" style={{ marginBottom: 18 }}>
        <div className="wd-chips">
          {DEPTS.map(([d, c]) => (
            <span key={d} className={`wd-chip ${d === "전체" ? "on" : ""}`}>
              {d} <small style={{ opacity: 0.6 }}>{c}</small>
            </span>
          ))}
        </div>
        <div className="wd-search" style={{ width: 300 }}>
          <i>⌕</i>이름 · 부서 · 역할 검색
        </div>
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
    </div>
  );
}

// #12 검색, #13 부서 필터, #14 새 멤버 배너
export function TeamSearch() {
  return (
    <Screen active="팀원">
      <TeamList />
    </Screen>
  );
}

// #15 조직도
export function OrgChart() {
  const tree = [
    { d: "NativeOps", lead: "최하은", c: 3, t: "blue" },
    { d: "PMO", lead: "박도윤", c: 2, t: "violet" },
    { d: "FA", lead: "정민재", c: 2, t: "green" },
    { d: "Core Platform", lead: "한지우", c: 6, t: "orange" },
    { d: "Design", lead: "오세린", c: 3, t: "violet" },
    { d: "NativeLab", lead: "윤태오", c: 3, t: "green" },
  ];
  return (
    <Screen active="팀원">
      <div className="wd-wrap wd-pb">
        <section className="wd-hero">
          <div>
            <Eyebrow>ORGANIZATION</Eyebrow>
            <h1>조직도</h1>
            <p>부서를 누르면 소속 팀원이 펼쳐져요.</p>
          </div>
          <div className="wd-tabs">
            <span>목록</span>
            <span className="on">조직도</span>
          </div>
        </section>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="wd-card" style={{ width: 240, textAlign: "center", borderColor: "#cdd9f5", background: "linear-gradient(110deg,#fff,#f7f9ff)" }}>
            <span className="wd-av lg dark" style={{ margin: "0 auto" }}>준</span>
            <b style={{ display: "block", marginTop: 12, fontSize: 14 }}>김준표</b>
            <span className="wd-t10 wd-faint">Leader · Founder</span>
          </div>
          <div style={{ width: 2, height: 30, background: "#e5e8eb" }} />
          <div style={{ width: 1000, height: 2, background: "#e5e8eb" }} />
          <div className="wd-grid" style={{ gridTemplateColumns: "repeat(6,1fr)", width: 1180, marginTop: 0 }}>
            {tree.map((x) => (
              <div key={x.d} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 2, height: 24, background: "#e5e8eb" }} />
                <div className="wd-card" style={{ width: "100%", padding: 16, borderColor: x.d === "Core Platform" ? "#3182f6" : undefined }}>
                  <div className="wd-between">
                    <b style={{ fontSize: 12 }}>{x.d}</b>
                    <span className="wd-t9 wd-faint">{x.c}명</span>
                  </div>
                  <div className="wd-row" style={{ marginTop: 12, gap: 8 }}>
                    <span className={`wd-av sm ${x.t}`}>{x.lead.slice(1, 2)}</span>
                    <span className="wd-t10">{x.lead}</span>
                    <span className="wd-badge" style={{ marginLeft: "auto" }}>리드</span>
                  </div>
                </div>
                {x.d === "Core Platform" && (
                  <div className="wd-card soft" style={{ width: "100%", marginTop: 8, padding: 12 }}>
                    {["이서연 · iOS", "김준표 · iOS", "박시우 · Web", "강유나 · Android", "임도현 · Backend"].map((m) => (
                      <div key={m} className="wd-row wd-t10" style={{ padding: "6px 0", gap: 8 }}>
                        <span className="wd-av sm">{m.slice(1, 2)}</span>
                        {m}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}

// #16 팀원 상세
export function MemberDetail() {
  return (
    <Screen
      active="팀원"
      overlay={
        <Modal
          eyebrow="MEMBER"
          title="이서연"
          sub="Core Platform · iOS · 26기"
          footer={
            <>
              <span className="wd-btn ghost">메일 복사</span>
              <span className="wd-btn">메일 보내기</span>
            </>
          }
        >
          <div className="wd-row" style={{ gap: 16, marginBottom: 22 }}>
            <span className="wd-av xl blue">서</span>
            <div>
              <p className="wd-t12" style={{ margin: 0, lineHeight: 1.7 }}>
                &ldquo;작게 만들고 빨리 고치는 걸 좋아해요. SwiftUI 애니메이션에 관심 많아요.&rdquo;
              </p>
              <div className="wd-chips" style={{ marginTop: 10 }}>
                {["SwiftUI", "모션", "접근성", "러닝"].map((c) => (
                  <span key={c} className="wd-chip">#{c}</span>
                ))}
              </div>
            </div>
          </div>
          <dl className="wd-kv" style={{ marginBottom: 22 }}>
            <div><dt>이메일</dt><dd>seoyeon@native.team</dd></div>
            <div><dt>GitHub</dt><dd>@seoyeon-lee</dd></div>
            <div><dt>합류일</dt><dd>2026.10.20</dd></div>
            <div><dt>학번</dt><dd>26017</dd></div>
          </dl>
          <b className="wd-t10" style={{ color: "#4e5968" }}>참여 프로젝트</b>
          <div className="wd-stack" style={{ marginTop: 10, gap: 8 }}>
            {[
              ["Book-on", "iOS 개발 · 진행 중", "blue"],
              ["Moil", "QA 지원 · 진행 중", "violet"],
            ].map(([p, r, t]) => (
              <div key={p} className="wd-file">
                <span className={`wd-av sm ${t}`}>{p.slice(0, 1)}</span>
                <div>
                  <b>{p}</b>
                  <small>{r}</small>
                </div>
                <span className="end">→</span>
              </div>
            ))}
          </div>
        </Modal>
      }
    >
      <TeamList dim />
    </Screen>
  );
}
