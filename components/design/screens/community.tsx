import type { ReactNode } from "react";
import Screen, { Eyebrow } from "../Screen";

type Tab = "게시판" | "문의·건의" | "공지";

function CommunityShell({ tab, children, overlay }: { tab: Tab; children: ReactNode; overlay?: ReactNode }) {
  return (
    <Screen active="커뮤니티" overlay={overlay}>
      <div className="wd-wrap wd-pb">
        <div className="wd-row" style={{ gap: 22, paddingTop: 30, borderBottom: "1px solid #e5e8eb" }}>
          {(["게시판", "문의·건의", "공지"] as Tab[]).map((t) => (
            <span
              key={t}
              className="wd-t12"
              style={{
                padding: "12px 2px",
                fontWeight: 700,
                color: t === tab ? "#191f28" : "#8b95a1",
                boxShadow: t === tab ? "inset 0 -2px 0 #191f28" : undefined,
              }}
            >
              {t}
            </span>
          ))}
        </div>
        {children}
      </div>
    </Screen>
  );
}

const POSTS = [
  { c: "공지", pin: true, t: "게시판 이용 규칙 (익명 정책 포함)", p: "익명이어도 존중은 실명처럼. 신고 3회 누적 시 자동 숨김돼요.", a: "NativeOps", m: "조회 412 · 공감 18 · 댓글 0" },
  { c: "모집", t: "Book-on 베타 테스터 모집합니다 (iOS)", p: "11.01부터 2주간 테스트해주실 분 찾아요. 아이폰이면 누구나 OK, 커피 쿠폰 드려요.", a: "김준표", m: "조회 128 · 공감 9 · 댓글 12" },
  { c: "자유", t: "학교 근처 조용한 작업 카페 추천해주세요", p: "콘센트 많고 오래 있어도 눈치 안 보이는 곳이면 좋겠어요.", a: "익명", m: "조회 86 · 공감 4 · 댓글 7" },
  { c: "질문", t: "SwiftData 마이그레이션 해보신 분?", p: "스키마 v2로 올릴 때 lightweight가 안 먹혀서요… 경험 공유 부탁드려요.", a: "이서연", m: "조회 54 · 공감 2 · 댓글 3" },
  { c: "칭찬", t: "이번 주 Moil QA 해주신 분들 감사해요", p: "덕분에 크래시 7건 잡았습니다. 다들 최고!", a: "익명", m: "조회 97 · 공감 21 · 댓글 5" },
];

// #52 게시판 목록, #53 카테고리 탭 · 최신순 정렬
export function BoardList() {
  return (
    <CommunityShell tab="게시판">
      <section className="wd-hero sm">
        <div>
          <Eyebrow>BOARD</Eyebrow>
          <h1>팀 게시판</h1>
          <p>실명이나 익명으로 자유롭게 이야기해요.</p>
        </div>
        <span className="wd-btn">글쓰기</span>
      </section>
      <div className="wd-between" style={{ marginBottom: 6 }}>
        <div className="wd-chips">
          {["전체", "자유", "질문", "모집", "칭찬", "공지"].map((c, i) => (
            <span key={c} className={`wd-chip ${i === 0 ? "on" : ""}`}>{c}</span>
          ))}
        </div>
        <div className="wd-row">
          <div className="wd-search" style={{ width: 240, height: 38 }}><i>⌕</i>게시글 검색</div>
          <div className="wd-tabs">
            <span className="on">최신순</span>
            <span>공감순</span>
            <span>댓글순</span>
          </div>
        </div>
      </div>
      <div className="wd-list">
        {POSTS.map((x) => (
          <div key={x.t} className={`wd-post ${x.pin ? "pin" : ""}`} style={{ padding: "20px 14px" }}>
            <div>
              <div className="wd-row" style={{ gap: 6 }}>
                {x.pin && <span className="wd-badge dark">고정</span>}
                <span className={`wd-badge ${x.c === "모집" ? "blue" : x.c === "칭찬" ? "green" : ""}`}>{x.c}</span>
              </div>
              <b>{x.t}</b>
              <p>{x.p}</p>
              <div className="wd-foot">
                <span>{x.a}</span>
                <span>{x.m}</span>
              </div>
            </div>
            <span className="wd-t9 wd-faint">{x.pin ? "10.01" : ["1시간 전", "3시간 전", "어제", "2일 전"][POSTS.indexOf(x) - 1]}</span>
          </div>
        ))}
      </div>
    </CommunityShell>
  );
}

// #54 글쓰기 (카테고리 · 글자수), #55 실명/익명, #56 댓글 정책, #57 임시 저장
export function BoardWrite() {
  return (
    <CommunityShell tab="게시판">
      <div className="wd-narrow" style={{ width: 760 }}>
        <section className="wd-hero sm">
          <div>
            <Eyebrow>WRITE</Eyebrow>
            <h1>글쓰기</h1>
          </div>
          <span className="wd-t10 wd-faint">✓ 10:51 임시 저장됨 · 임시 글 1</span>
        </section>
        <div className="wd-card" style={{ padding: 28 }}>
          <label className="wd-field">
            <span>카테고리</span>
            <div className="wd-seg">
              {["자유", "질문", "모집", "칭찬"].map((c) => (
                <span key={c} className={c === "모집" ? "on" : ""}>{c}</span>
              ))}
            </div>
          </label>
          <label className="wd-field">
            <span>제목 <em>24 / 50</em></span>
            <div className="wd-input">Book-on 베타 테스터 모집합니다 (iOS)</div>
          </label>
          <label className="wd-field">
            <span>내용 <em>112 / 2,000</em></span>
            <div className="wd-input area focus" style={{ minHeight: 180 }}>
              11.01부터 2주간 테스트해주실 분 찾아요. 아이폰이면 누구나 OK, 커피 쿠폰 드려요.
              <br />
              <br />
              - 기간: 11.01 – 11.15
              <br />- 신청: 댓글로 기종 남겨주세요
            </div>
          </label>
          <div className="wd-grid g2" style={{ marginBottom: 22 }}>
            <label className="wd-field" style={{ marginBottom: 0 }}>
              <span>작성자 표시</span>
              <div className="wd-seg">
                <span className="on">실명 · 김준표</span>
                <span>익명</span>
              </div>
            </label>
            <label className="wd-field" style={{ marginBottom: 0 }}>
              <span>댓글 작성자</span>
              <div className="wd-seg">
                <span>실명만</span>
                <span className="on">익명 허용</span>
              </div>
            </label>
          </div>
          <div className="wd-banner gray" style={{ padding: "12px 14px", marginBottom: 22 }}>
            <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>i</span>
            <p style={{ margin: 0 }}>익명 댓글은 &lsquo;익명 1, 2…&rsquo; 번호로 표시되고 글쓴이 댓글엔 &lsquo;글쓴이&rsquo; 표시가 붙어요.</p>
          </div>
          <div className="wd-row" style={{ justifyContent: "flex-end" }}>
            <span className="wd-btn ghost">임시 저장</span>
            <span className="wd-btn">올리기</span>
          </div>
        </div>
      </div>
    </CommunityShell>
  );
}

function PostDetail() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, paddingTop: 30, alignItems: "start" }}>
      <article className="wd-card" style={{ padding: 30 }}>
        <div className="wd-between">
          <span className="wd-badge blue">모집</span>
          <span className="wd-x" style={{ background: "#fff", border: "1px solid #e5e8eb", fontSize: 14 }}>⋯</span>
        </div>
        <h1 style={{ margin: "14px 0 10px", fontSize: 26, letterSpacing: "-.05em", fontWeight: 620 }}>Book-on 베타 테스터 모집합니다 (iOS)</h1>
        <div className="wd-row wd-t10 wd-faint" style={{ gap: 10, marginBottom: 24 }}>
          <span className="wd-av sm dark">준</span>
          <b style={{ color: "#191f28" }}>김준표</b> · 3시간 전 · 조회 128
        </div>
        <div className="wd-doc" style={{ marginBottom: 26 }}>
          <p>11.01부터 2주간 테스트해주실 분 찾아요. 아이폰이면 누구나 OK, 커피 쿠폰 드려요.</p>
          <p>- 기간: 11.01 – 11.15<br />- 신청: 댓글로 기종 남겨주세요</p>
        </div>
        <div className="wd-row" style={{ gap: 8, paddingBottom: 20, borderBottom: "1px solid #e5e8eb" }}>
          <span className="wd-chip bon">♥ 공감 9</span>
          <span className="wd-chip">링크 복사</span>
        </div>
        <div className="wd-between" style={{ margin: "20px 0 4px" }}>
          <b className="wd-t12">댓글 12</b>
          <span className="wd-t9 wd-faint">익명 댓글 허용</span>
        </div>
        <div className="wd-comment">
          <span className="wd-av">1</span>
          <div>
            <header>익명 1 <small>2시간 전</small></header>
            <p>iPhone 13 mini 있어요! 참여할게요.</p>
            <div className="wd-foot"><span>공감 2</span><span>답글</span></div>
          </div>
        </div>
        <div className="wd-comment reply">
          <span className="wd-av dark">준</span>
          <div>
            <header>김준표 <span className="wd-badge blue" style={{ height: 17 }}>글쓴이</span> <small>1시간 전</small></header>
            <p>감사해요! TestFlight 초대 보내드릴게요.</p>
          </div>
        </div>
        <div className="wd-comment">
          <span className="wd-av blue">서</span>
          <div>
            <header>이서연 <small>40분 전</small></header>
            <p>15 Pro로 신청합니다</p>
            <div className="wd-foot"><span>공감 1</span><span>답글</span></div>
          </div>
        </div>
        <div className="wd-row" style={{ marginTop: 12 }}>
          <div className="wd-seg" style={{ width: 140 }}>
            <span className="on">실명</span>
            <span>익명</span>
          </div>
          <div className="wd-input ph" style={{ flex: 1 }}>댓글을 남겨주세요<span className="end">등록</span></div>
        </div>
      </article>
      <aside className="wd-card soft">
        <h3 style={{ fontSize: 12 }}>이 카테고리의 다른 글</h3>
        {["Moil 디자이너 1명 구해요", "NativeLab 데모데이 발표자 모집", "해커톤 팀원 구합니다"].map((x) => (
          <div key={x} className="wd-between wd-t10" style={{ padding: "10px 0" }}>{x}<span className="wd-faint">→</span></div>
        ))}
      </aside>
    </div>
  );
}

// #58 상세 (조회수), #59 공감, #60 댓글 (익명 번호 · 글쓴이), #61 링크 복사 + 토스트, #63 삭제 (더보기 메뉴)
export function BoardDetail() {
  return (
    <CommunityShell
      tab="게시판"
      overlay={
        <>
          <div className="wd-pop wd-menu" style={{ top: 186, left: 776 }}>
            <span>링크 복사</span>
            <span>수정</span>
            <hr />
            <span className="red">삭제</span>
          </div>
          <div className="wd-toast"><i>✓</i>링크를 복사했어요</div>
        </>
      }
    >
      <PostDetail />
    </CommunityShell>
  );
}

// #62 신고 (사유 선택)
export function BoardReport() {
  return (
    <CommunityShell
      tab="게시판"
      overlay={
        <div className="wd-scrim">
          <section className="wd-modal sm">
            <header>
              <div>
                <span>REPORT</span>
                <h2>이 글을 신고할까요?</h2>
                <p>신고자는 공개되지 않아요. 운영진이 확인 후 처리해요.</p>
              </div>
              <span className="wd-x">×</span>
            </header>
            <div className="wd-modal-body">
              <div className="wd-stack" style={{ gap: 8 }}>
                {["욕설·비하", "개인정보 노출", "도배·광고", "사실과 다른 내용", "기타"].map((x, i) => (
                  <div key={x} className="wd-row wd-t11" style={{ padding: "11px 12px", border: "1px solid #e5e8eb", borderRadius: 11, borderColor: i === 1 ? "#3182f6" : undefined }}>
                    <span className={`wd-radio ${i === 1 ? "on" : ""}`} />
                    {x}
                  </div>
                ))}
              </div>
            </div>
            <div className="wd-foot">
              <span className="wd-btn ghost">취소</span>
              <span className="wd-btn" style={{ background: "#f04452" }}>신고하기</span>
            </div>
          </section>
        </div>
      }
    >
      <div style={{ opacity: 0.6 }}>
        <PostDetail />
      </div>
    </CommunityShell>
  );
}

// #63 삭제 확인
export function BoardDelete() {
  return (
    <CommunityShell
      tab="게시판"
      overlay={
        <div className="wd-scrim">
          <div className="wd-alert">
            <span className="ico red">!</span>
            <h2>게시글을 삭제할까요?</h2>
            <p>댓글 12개도 함께 지워지고 되돌릴 수 없어요.</p>
            <div className="wd-foot">
              <span className="wd-btn ghost">취소</span>
              <span className="wd-btn" style={{ background: "#f04452" }}>삭제</span>
            </div>
          </div>
        </div>
      }
    >
      <div style={{ opacity: 0.6 }}>
        <PostDetail />
      </div>
    </CommunityShell>
  );
}

// #64 문의·건의 작성 (실명/익명), #65 대상 부서 선택
export function InquiryWrite() {
  return (
    <CommunityShell tab="문의·건의">
      <section className="wd-hero sm">
        <div>
          <Eyebrow>INQUIRY</Eyebrow>
          <h1>문의 · 건의</h1>
          <p>운영진에게 바로 묻고, 팀에 바라는 점을 남겨요.</p>
        </div>
        <div className="wd-tabs">
          <span className="on">새로 작성</span>
          <span>내 문의<small>2</small></span>
        </div>
      </section>
      <div className="wd-side">
        <div className="wd-card" style={{ padding: 28 }}>
          <label className="wd-field">
            <span>유형</span>
            <div className="wd-seg">
              <span className="on">문의</span>
              <span>건의</span>
              <span>불편 신고</span>
            </div>
          </label>
          <label className="wd-field">
            <span>받는 부서</span>
            <div className="wd-chips">
              {["NativeOps", "PMO", "FA", "Leader", "잘 모르겠어요"].map((d, i) => (
                <span key={d} className={`wd-chip ${i === 2 ? "bon" : ""}`}>{d}</span>
              ))}
            </div>
          </label>
          <label className="wd-field">
            <span>제목</span>
            <div className="wd-input">영수증 제출 기한이 지나면 어떻게 되나요?</div>
          </label>
          <label className="wd-field">
            <span>내용 <em>64 / 1,000</em></span>
            <div className="wd-input area focus">10월 사용분 영수증을 아직 못 받았는데, 30일이 지나면 정산에서 빠지는 건지 궁금해요.</div>
          </label>
          <label className="wd-field">
            <span>작성자 표시</span>
            <div className="wd-seg">
              <span>실명 · 김준표</span>
              <span className="on">익명</span>
            </div>
          </label>
          <div className="wd-row" style={{ justifyContent: "flex-end" }}>
            <span className="wd-btn">보내기</span>
          </div>
        </div>
        <aside className="wd-card soft">
          <h3 style={{ fontSize: 12 }}>익명으로 보내면</h3>
          <p className="wd-t10 wd-muted" style={{ lineHeight: 1.7, margin: "8px 0 0" }}>
            받는 부서도 작성자를 볼 수 없어요. 답변은 &lsquo;내 문의&rsquo;에서 확인할 수 있고, 답변이 오면 알림을 드려요.
          </p>
        </aside>
      </div>
    </CommunityShell>
  );
}

// #66 내 문의 + 처리 상태, #67 답변 보기
export function InquiryList() {
  return (
    <CommunityShell tab="문의·건의">
      <section className="wd-hero sm">
        <div>
          <Eyebrow>INQUIRY</Eyebrow>
          <h1>내 문의</h1>
        </div>
        <div className="wd-tabs">
          <span>새로 작성</span>
          <span className="on">내 문의<small>2</small></span>
        </div>
      </section>
      <div className="wd-grid" style={{ gridTemplateColumns: "380px 1fr", alignItems: "start" }}>
        <div className="wd-stack" style={{ gap: 8 }}>
          {[
            ["답변 완료", "green", "영수증 제출 기한이 지나면 어떻게 되나요?", "FA · 익명 · 10.22", true],
            ["검토 중", "blue", "회의실 예약 방식 건의", "NativeOps · 실명 · 10.20", false],
            ["접수", "", "게시판 이미지 첨부 기능 요청", "NativeOps · 실명 · 10.24", false],
          ].map(([s, t, x, m, on]) => (
            <div key={x as string} className="wd-card" style={{ padding: 16, borderColor: on ? "#3182f6" : undefined }}>
              <span className={`wd-badge ${t}`}>{s}</span>
              <b style={{ display: "block", margin: "10px 0 4px", fontSize: 12 }}>{x}</b>
              <span className="wd-t9 wd-faint">{m}</span>
            </div>
          ))}
        </div>
        <section className="wd-card" style={{ padding: 28 }}>
          <div className="wd-line" style={{ marginBottom: 26 }}>
            <div className="done"><span className="wd-av">✓</span><b>접수</b><small>10.22 10:12</small></div>
            <div className="done"><span className="wd-av">✓</span><b>검토 중</b><small>10.22 14:30</small></div>
            <div className="done"><span className="wd-av">✓</span><b>답변 완료</b><small>10.23 09:05</small></div>
          </div>
          <span className="wd-t9 wd-faint">내 문의 · 익명</span>
          <h2 style={{ margin: "8px 0 10px", fontSize: 20, letterSpacing: "-.04em" }}>영수증 제출 기한이 지나면 어떻게 되나요?</h2>
          <p className="wd-t11" style={{ lineHeight: 1.75, color: "#333d4b", margin: "0 0 22px" }}>10월 사용분 영수증을 아직 못 받았는데, 30일이 지나면 정산에서 빠지는 건지 궁금해요.</p>
          <div className="wd-card soft" style={{ borderLeft: "3px solid #3182f6", borderRadius: 14 }}>
            <div className="wd-row" style={{ gap: 8, marginBottom: 10 }}>
              <span className="wd-av sm green">민</span>
              <b className="wd-t11">FA 정민재</b>
              <span className="wd-t9 wd-faint">답변 · 10.23 09:05</span>
            </div>
            <p className="wd-t11" style={{ lineHeight: 1.75, margin: 0, color: "#333d4b" }}>
              30일이 지나도 빠지지 않아요. 결재 상세에서 &lsquo;영수증 추후 제출&rsquo;을 눌러두시면 11월 정산에 함께 반영됩니다. 영수증 받으시면 같은 결재에 첨부만 해주세요!
            </p>
          </div>
          <div className="wd-row" style={{ marginTop: 18, gap: 6 }}>
            <span className="wd-t10 wd-muted">답변이 도움이 됐나요?</span>
            <span className="wd-chip bon">네, 해결됐어요</span>
            <span className="wd-chip">추가로 물어볼게요</span>
          </div>
        </section>
      </div>
    </CommunityShell>
  );
}

// #68 공지 목록 (분류 필터 · 고정)
export function NoticeList() {
  const list = [
    ["필독", "red", "10월 정산 일정 안내 — 영수증은 10.30까지", "NativeOps · 10.24", true, "14/20 확인"],
    ["제도", "orange", "외주 수금 및 풀 배분 기준 개정 (10.27 시행)", "FA · 10.22", true, "14/20 확인"],
    ["일정", "violet", "10월 전체 회의 · 10.28 (수) 19:00", "Leader · 10.21", false, ""],
    ["일반", "", "인하우스 웹에 게시판·문의가 생겼어요", "NativeOps · 10.20", false, ""],
    ["일반", "", "2학기 신규 멤버 온보딩 안내", "NativeOps · 10.14", false, ""],
  ] as const;
  return (
    <CommunityShell tab="공지">
      <section className="wd-hero sm">
        <div>
          <Eyebrow>NOTICE</Eyebrow>
          <h1>공지</h1>
          <p>필독 공지는 확인하면 체크돼요.</p>
        </div>
      </section>
      <div className="wd-chips" style={{ marginBottom: 14 }}>
        {["전체", "필독", "제도", "일정", "일반"].map((c, i) => (
          <span key={c} className={`wd-chip ${i === 0 ? "on" : ""}`}>{c}</span>
        ))}
      </div>
      <div className="wd-card" style={{ padding: "4px 20px" }}>
        <div className="wd-list">
          {list.map(([k, t, x, m, pin, r]) => (
            <div key={x} className="wd-li" style={{ gridTemplateColumns: "56px 1fr auto auto" }}>
              <span className={`wd-badge ${t}`} style={{ justifySelf: "start" }}>{k}</span>
              <div>
                <b>
                  {pin && <span className="wd-badge dark" style={{ marginRight: 8, height: 18 }}>고정</span>}
                  {x}
                </b>
                <p>{m}</p>
              </div>
              <span className="wd-t9 wd-faint">{r}</span>
              <span className="wd-faint">→</span>
            </div>
          ))}
        </div>
      </div>
    </CommunityShell>
  );
}

// #69 공지 상세 (필독 · 관련 문서 · 확인했어요)
export function NoticeDetail() {
  return (
    <CommunityShell tab="공지">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, paddingTop: 30, alignItems: "start" }}>
        <article className="wd-card" style={{ padding: 32 }}>
          <div className="wd-row" style={{ gap: 6 }}>
            <span className="wd-badge red">필독</span>
            <span className="wd-badge dark">고정</span>
          </div>
          <h1 style={{ margin: "14px 0 10px", fontSize: 26, letterSpacing: "-.05em", fontWeight: 620 }}>10월 정산 일정 안내 — 영수증은 10.30까지</h1>
          <div className="wd-t10 wd-faint" style={{ marginBottom: 26 }}>NativeOps 최하은 · 10.24 09:00 · 조회 87</div>
          <div className="wd-doc">
            <p>10월 사용분 정산을 아래 일정으로 진행해요.</p>
            <h3>일정</h3>
            <p>- 영수증 제출 마감: <mark>10.30 (금) 23:59</mark><br />- FA 검토: 10.31<br />- 배분 완료 알림: 11.03</p>
            <h3>제출 방법</h3>
            <p>결재함 › 해당 결재 › 첨부파일에 영수증을 올려주세요. 아직 못 받은 영수증은 &lsquo;추후 제출&rsquo;을 눌러두세요.</p>
          </div>
          <b className="wd-t10" style={{ display: "block", margin: "26px 0 10px", color: "#4e5968" }}>관련 문서</b>
          <div className="wd-grid g2">
            <div className="wd-file"><span className="ext doc">DOC</span><div><b>외주 수금 및 풀 배분 기준</b><small>문서함 · v2.3</small></div><span className="end">→</span></div>
            <div className="wd-file"><span className="ext doc">DOC</span><div><b>영수증 제출 가이드</b><small>문서함 · 가이드</small></div><span className="end">→</span></div>
          </div>
        </article>
        <aside className="wd-card" style={{ borderColor: "#cfe0fd", position: "sticky", top: 0 }}>
          <h3 style={{ fontSize: 12 }}>필독 확인</h3>
          <p className="wd-t9 wd-faint" style={{ margin: "6px 0 14px" }}>읽었다면 확인을 눌러주세요. 운영진이 확인 현황을 봐요.</p>
          <div className="wd-between wd-t10" style={{ marginBottom: 8 }}>
            <span>14 / 20명</span>
            <span className="wd-faint">70%</span>
          </div>
          <div className="wd-bar" style={{ marginBottom: 16 }}><i style={{ width: "70%" }} /></div>
          <span className="wd-btn blue full">확인했어요</span>
        </aside>
      </div>
    </CommunityShell>
  );
}
