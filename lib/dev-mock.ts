// 개발 전용 가짜 서버. npm run dev + NEXT_PUBLIC_DEV_BYPASS=1 일 때만 lib/api.ts 가 불러온다 (실서버로 아무것도 보내지 않음)
// 저장은 새로고침하면 사라진다. 프로필 · 설정만 이번 탭에서 유지한다
type Raw = Record<string, unknown>;

const day = (offset: number, time = "10:00") => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.toISOString().slice(0, 10)}T${time}:00+09:00`;
};
const page = (items: unknown[], extra: Raw = {}) => ({ items, nextCursor: null, ...extra });

let me: Raw = {
  id: "dev-admin",
  name: "테스트 관리자",
  email: "admin@native.test",
  dept: "NativeOps",
  role: "운영 리드",
  major: "운영",
  cohort: "3기",
  github: "native-admin",
  photo: "",
  joined: day(-200),
  bio: "화면 확인용 관리자 계정이에요.",
  interests: ["운영", "디자인"],
  projects: [["moil", "PM"]],
  isNew: false,
  lead: true,
  roles: ["Admin", "Leader", "FA"],
};
const restore = (key: string, base: Raw): Raw => {
  try {
    return { ...base, ...JSON.parse(localStorage.getItem(key) ?? "{}") };
  } catch {
    return base;
  }
};
const keep = (key: string, value: Raw): Raw => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  return value;
};
let settings: Raw = restore("dev-mock-settings", { theme: "라이트", passwordChangedAt: day(-40) });
let notiSettings: Raw = restore("dev-mock-noti", {
  push: true,
  kinds: { "내 업무": true, 재정: true, 일정: true, 공지: true, "규칙 (제도 변경)": true, 게시판: false },
  dnd: false,
  dndFrom: "22:00",
  dndTo: "08:00",
  dndDays: ["토", "일"],
});

const PEOPLE = [
  ["p1", "강민서", "Leader", "Founder", true, false],
  ["p2", "최하은", "NativeOps", "운영 리드", true, false],
  ["p3", "박도윤", "PMO", "PM", false, false],
  ["p4", "정민재", "FA", "재무 담당", false, false],
  ["p5", "이서연", "Core Platform", "iOS", false, true],
  ["p6", "한지우", "Core Platform", "Web", false, false],
  ["p7", "오세린", "Design", "Product Designer", false, true],
  ["p8", "윤태오", "NativeLab", "Backend", true, false],
  ["p9", "서지안", "NativeLab", "AI", false, false],
  ["p10", "임규리", "Design", "Brand Designer", false, false],
].map(([id, name, dept, role, lead, isNew]) => ({
  id,
  name,
  dept,
  role,
  lead,
  isNew,
  email: `${id}@native.test`,
  major: role,
  cohort: "3기",
  github: String(id),
  joined: day(isNew ? -5 : -180),
  bio: `${dept}에서 ${role}을(를) 맡고 있어요.`,
  interests: ["협업", "제품"],
  projects: [["Moil", String(role)]],
  roles: lead ? ["Leader"] : [],
}));

const LINE = [
  { who: "최하은", userId: "p2", role: "운영 검토", state: "done", at: day(-2) },
  { who: "테스트 관리자", userId: "dev-admin", role: "최종 승인", state: "now", at: "검토 중" },
];
const APPROVALS = [
  ["a1", "Moil 서버 비용 승인", "결재 대기", "비용 승인", "182,000원", 182000, true],
  ["a2", "Book-on 디자이너 1명 지원", "결재 대기", "인력 지원", "3주", 0, true],
  ["a3", "Figma 팀 플랜 연간 구독", "검토 중", "비용 승인", "540,000원", 540000, false],
  ["a4", "11월 해커톤 간식비", "작성 중", "비용 승인", "150,000원", 150000, false],
  ["a5", "Moil 디자이너 1명 지원", "승인", "인력 지원", "4주", 0, false],
  ["a6", "외부 강연 초청비", "반려", "비용 승인", "300,000원", 300000, false],
].map(([id, title, status, kind, amount, amountValue, received], i) => ({
  id,
  title,
  status,
  kind,
  amount,
  amountValue,
  received,
  type: kind === "인력 지원" ? "프로젝트 인력" : "도구·구독",
  date: day(-i - 1),
  author: received ? "박도윤" : "테스트 관리자",
  authorId: received ? "p3" : "dev-admin",
  project: "Moil",
  useDate: day(7).slice(0, 10),
  reason: "다음 스프린트 진행에 필요해서 요청해요.",
  period: "2주",
  staff: kind === "인력 지원" ? { 디자이너: 1 } : {},
  line: LINE,
  files: [{ id: "f1", filename: "견적서.pdf", size: 182000, contentType: "application/pdf" }],
  comments: [{ id: "c1", who: "최하은", whoId: "p2", meta: "운영 검토", text: "금액 확인했어요.", createdAt: day(-1) }],
  rejectReason: status === "반려" ? "이번 분기 예산을 넘어서 다음 달에 다시 올려 주세요." : "",
}));

const COMMENTS = [
  { id: "cm1", postId: "b1", author: "한지우", text: "정리 고마워요!", createdAt: day(-1), likes: 2 },
  { id: "cm2", postId: "b1", anonymous: true, text: "다음 스터디도 기대돼요.", createdAt: day(0, "09:00"), likes: 0, replyTo: "cm1" },
];
const POSTS = [
  ["b1", "정보 공유", "이번 주 코드리뷰 스터디 후기", "오세린", 42, 8, true, false],
  ["b2", "자유", "사무실 커피 머신 교체 어떠세요", "", 31, 12, false, false],
  ["b3", "모집", "11월 해커톤 같이 나갈 분 찾아요", "이서연", 58, 6, false, false],
  ["b4", "질문", "디자인 토큰 네이밍 규칙 있나요?", "윤태오", 24, 3, false, false],
  ["b5", "칭찬", "이번 릴리스 고생 많으셨어요", "테스트 관리자", 76, 21, false, true],
  ["b6", "팀 소식", "새 멤버 두 분이 합류했어요", "최하은", 90, 17, false, false],
].map(([id, category, title, author, views, likes, pinned, mine], i) => ({
  id,
  category,
  title,
  author,
  anonymous: !author,
  anonComments: i % 2 === 0,
  views,
  likes,
  pinned,
  mine,
  createdAt: day(-i, "11:00"),
  commentCount: id === "b1" ? COMMENTS.length : i,
  body: `${title}\n\n화면 확인용 예시 글이에요. 줄바꿈과 긴 문장이 어떻게 보이는지 볼 수 있도록 두 문단으로 적었어요.`,
}));

const NOTICES = [
  ["n1", "필독", "11월 전체 회의 안내", true, true, 6, 10],
  ["n2", "제도", "외주 수금 및 풀 배분 기준 개정", false, true, 8, 10],
  ["n3", "일정", "해커톤 일정이 11월 22일로 확정됐어요", false, false, 0, 0],
  ["n4", "일반", "사무실 이용 수칙을 다시 안내드려요", false, false, 0, 0],
].map(([id, kind, title, pinned, mustRead, confirmed, total], i) => ({
  id,
  kind,
  title,
  pinned,
  mustRead,
  confirmed,
  total,
  author: "최하은",
  authorRole: "NativeOps",
  createdAt: day(-i * 2),
  publishedAt: day(-i * 2),
  confirmedByMe: i === 1,
  views: 40 - i * 5,
  body: `${title}\n\n자세한 내용은 첨부와 관련 문서를 확인해 주세요.`,
  linkedDocuments: [{ slug: "pool-rule", title: "풀 배분 기준" }],
  attachments: i === 0 ? [{ id: "f2", filename: "회의 안건.pdf", size: 420000 }] : [],
}));

const INQUIRIES = [
  ["q1", "문의", "NativeOps", "법인카드 사용 기준이 궁금해요", "접수", null],
  ["q2", "건의", "Design", "디자인 리뷰 시간을 고정하면 좋겠어요", "검토 중", null],
  ["q3", "불편 신고", "Core Platform", "테스트 기기 대여 절차가 복잡해요", "답변 완료", { who: "최하은", whoId: "p2", at: day(-1), text: "신청서를 한 장으로 줄였어요." }],
  ["q4", "문의", "FA", "입금 확인은 언제 되나요?", "해결됨", { who: "정민재", whoId: "p4", at: day(-6), text: "매주 금요일에 반영해요." }],
].map(([id, type, dept, title, status, answer], i) => ({
  id,
  type,
  dept,
  title,
  status,
  answer,
  body: `${title}\n예시 문의 내용이에요.`,
  anonymous: i === 1,
  createdAt: day(-i - 1),
  steps: [day(-i - 1), i >= 1 ? day(-i) : "", answer ? day(-1) : ""],
  replies: answer ? [{ who: "테스트 관리자", at: day(-1), text: "확인했어요, 감사해요." }] : [],
}));

const DOCS = [
  ["pool-rule", "재무", "FINANCE", "풀 배분 기준", "외주 수금을 운영 · 적립 · 배당으로 나누는 기준", true, false],
  ["expense-rule", "규칙", "RULE", "비용 사용 규칙", "비용 승인이 필요한 경우와 한도", false, true],
  ["member-rule", "규칙", "RULE", "멤버 활동 규칙", "참여와 역할에 관한 약속", false, true],
  ["onboarding", "가이드", "GUIDE", "신규 멤버 온보딩", "처음 합류했을 때 해야 할 일", false, false],
  ["expense-form", "템플릿", "TEMPLATE", "비용 승인 요청서", "결재에 첨부하는 기본 양식", false, true],
].map(([slug, category, type, title, copy, revised, read], i) => ({
  slug,
  category,
  type,
  title,
  copy,
  revised,
  read,
  readAt: read ? day(-3) : "",
  date: day(-i * 7),
  version: `v1.${3 - (i % 3)}`,
  effective: day(-i * 7 + 3),
  owner: "NativeOps",
  approvalTypes: type === "TEMPLATE" ? ["비용 승인"] : [],
  usageThisMonth: type === "TEMPLATE" ? 12 : 0,
  fields: type === "TEMPLATE" ? [["사용 목적", "무엇에 쓰는지 적어 주세요"], ["요청 금액", "원 단위"]] : [],
  fileId: type === "TEMPLATE" ? "f3" : "",
  fileName: "비용 승인 요청서.docx",
  sections: [
    { title: "목적", lines: [{ text: copy }] },
    { title: "기준", revised, lines: revised ? [{ text: "운영 풀 비율은 ", was: "40%", now: "50%", after: " 로 합니다." }, { text: "분기마다 다시 확인해요." }] : [{ text: "담당자가 확인한 뒤 적용해요." }, { text: "분기마다 다시 확인해요." }] },
  ],
}));

const PROJECTS = [
  ["moil", "Moil", "모임 일정을 한곳에서 관리하는 앱", "PM", 72, "진행 중", "blue", "베타 공개"],
  ["book-on", "Book-on", "독서 기록 서비스", "디자인 리뷰", 45, "진행 중", "violet", "디자인 시안 확정"],
  ["ecoguard", "EcoGuard", "환경 모니터링 대시보드", "", 100, "완료", "green", ""],
].map(([id, name, description, role, progress, status, tone, nextMilestone]) => ({
  id,
  slug: id,
  name,
  description,
  role,
  progress,
  status,
  tone,
  nextMilestone,
  due: day(30).slice(0, 10),
  pm: "박도윤",
  members: [["p3", "PM"], ["p6", "Web"], ["p7", "Design"]],
  openings: id === "ecoguard" ? [] : [{ role: "디자이너", title: "프로덕트 디자이너", remaining: 1, period: "4주", description: "화면 설계와 디자인 시스템" }],
}));

const RECEIPTS = [
  ["r1", "A스튜디오", "Moil", 3200000, "입금 완료", -20],
  ["r2", "B컴퍼니", "Book-on", 1800000, "입금 대기", -6],
  ["r3", "C랩스", "EcoGuard", 2500000, "청구 완료", -3],
  ["r4", "D파트너스", "Moil", 950000, "연체", -35],
].map(([id, client, project, amount, status, offset]) => ({ id, client, project, amount, status, date: day(Number(offset)).slice(0, 10) })) as Raw[];

function events(month?: unknown) {
  const m = typeof month === "string" ? month : new Date().toISOString().slice(0, 7);
  return [
    ["e1", "전체 회의", "07", "19:00", "20:30", "팀", "본관 302호", true],
    ["e2", "Moil 스프린트 리뷰", "12", "16:00", "17:00", "프로젝트", "온라인", false],
    ["e3", "디자인 리뷰", "18", "14:00", "15:00", "팀", "회의실 A", true],
    ["e4", "해커톤", "22", "10:00", "18:00", "전체", "본관 1층", true],
    ["e5", "개인 면담", "25", "11:00", "11:30", "개인", "회의실 B", false],
  ].map(([id, title, d, start, end, scope, place, rsvp]) => ({
    id,
    title,
    date: `${m}-${d}`,
    start,
    end,
    scope,
    place,
    rsvp,
    host: "최하은",
    agenda: "진행 상황 공유와 다음 일정 논의",
    audience: "전체 멤버",
    myRsvp: id === "e3" ? "참석" : "",
    rsvpCount: 6,
  }));
}

const summary = (month?: unknown) => ({
  period: "이번 달",
  month: typeof month === "string" ? month : new Date().toISOString().slice(0, 7),
  demo: false,
  lastSyncedAt: day(0, "09:00"),
  summary: { available: 3482000, monthlyRevenue: 7500000, monthlyExpense: 2118000, externalReceipts: 8450000, reserveBalance: 2535000 },
  pools: [
    { id: "operation", label: "운영", amount: 4225000, ratio: 50, note: "서버 · 구독 · 행사" },
    { id: "reserve", label: "적립", amount: 2535000, ratio: 30, note: "다음 분기 준비금" },
    { id: "dividend", label: "배당", amount: 1690000, ratio: 20, note: "참여 멤버 배분" },
  ],
  flow: [-5, -4, -3, -2, -1, 0].map((n, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + n);
    return { month: `${d.getMonth() + 1}월`, income: 3200000 + i * 900000, expense: 1500000 + (i % 3) * 400000 };
  }),
  receipts: RECEIPTS,
  notices: [{ category: "재무", title: "외주 수금 및 풀 배분 기준 개정", meta: "이번 주 시행" }],
  member: { email: me.email, name: me.name },
});

const CONTRACT = {
  pm: "박도윤",
  signed: day(-60).slice(0, 10),
  total: 8000000,
  collected: 3200000,
  step: 4,
  stepDates: [-60, -55, -50, -30].map((n) => day(n).slice(0, 10)),
  staff: "PM 1 · 디자인 1 · 개발 2",
  split: "착수 40% · 납품 60%",
  next: "납품 후 잔금 청구",
  fileId: "f4",
  fileName: "계약서.pdf",
};

const REPORTS = [
  { id: "rp1", postId: "b2", reason: "도배", detail: "같은 글이 반복돼요.", status: "PENDING", createdAt: day(-1) },
  { id: "rp2", postId: "b2", reason: "욕설", detail: "", status: "PENDING", createdAt: day(0, "08:00") },
  { id: "rp3", postId: "b4", reason: "기타", detail: "주제와 달라요.", status: "반려", handledBy: "최하은", handledAt: day(-3), note: "문제 없음", createdAt: day(-4) },
];

const NOTIFICATIONS = [
  ["내 업무", "결재", "새 결재가 도착했어요", "Moil 서버 비용 승인", "/inhouse/requests/a1", true, true, 0],
  ["재정", "입금", "입금이 확인됐어요", "A스튜디오 3,200,000원", "/inhouse/finance/receipts", true, false, 0],
  ["일정", "일정", "내일 전체 회의가 있어요", "본관 302호 19:00", "/inhouse/my/calendar", false, true, -1],
  ["공지", "필독", "필독 공지가 올라왔어요", "11월 전체 회의 안내", "/inhouse/community/notices/n1", false, false, -4],
  ["내 업무", "결재", "결재가 승인됐어요", "Moil 디자이너 1명 지원", "/inhouse/requests/a5", false, false, -9],
].map(([kind, meta, title, message, href, unread, action, offset], i) => ({
  id: `no${i}`,
  kind,
  meta,
  title,
  message,
  href,
  unread,
  action,
  createdAt: day(Number(offset), "09:30"),
}));

const pick = <T extends Raw>(list: T[], key: string, value: string): T => list.find((x) => x[key] === value) ?? { ...list[0], [key]: value };

function read(path: string, query: Raw): unknown {
  const s = path.split("/").filter(Boolean).map(decodeURIComponent);
  const box = query.box;
  switch (path) {
    case "/me":
      return me;
    case "/me/settings":
      return settings;
    case "/me/notification-settings":
      return notiSettings;
    case "/me/summary":
      return { unreadNotifications: 2, submittedApprovals: 4, myPosts: 1, myProposals: 0, myInquiries: 2, receivedApprovals: 2 };
    case "/me/activity":
      return page([
        { kind: "approval", id: "a3", title: "Figma 팀 플랜 연간 구독", createdAt: day(-1) },
        { kind: "post", id: "b5", title: "이번 릴리스 고생 많으셨어요", createdAt: day(-2) },
        { kind: "comment", id: "cm1", postTitle: "이번 주 코드리뷰 스터디 후기", createdAt: day(-3) },
        { kind: "inquiry", id: "q1", title: "법인카드 사용 기준이 궁금해요", createdAt: day(-4) },
      ]);
    case "/me/projects":
      return page(PROJECTS.slice(0, 2));
    case "/projects":
      return page(PROJECTS);
    case "/dashboard/home":
      return {
        summary: { todoCount: 3, todayTodoCount: 2, unreadNotifications: 2, receivedApprovalCount: 2 },
        todos: [
          { id: "approval:a1", title: "Moil 서버 비용 승인 검토", category: "결재", dueDate: day(0).slice(0, 10), href: "/inhouse/requests/a1", sourceType: "approval" },
          { id: "t2", title: "풀 배분 기준 개정 확인", category: "문서", dueDate: day(1).slice(0, 10), href: "/inhouse/documents/pool-rule" },
          { id: "t3", title: "베타 공개 체크리스트 정리", category: "개인 업무", dueDate: day(3).slice(0, 10), href: "", projectName: "Moil" },
        ],
        approvals: APPROVALS.slice(0, 2),
        events: events().slice(0, 3),
      };
    case "/people":
      return page(PEOPLE);
    case "/approvals":
      return page(box === "received" ? APPROVALS.filter((a) => a.received) : box === "handled" ? APPROVALS.slice(4) : APPROVALS.filter((a) => !a.received));
    case "/posts":
      return page(POSTS);
    case "/notices":
    case "/admin/notices":
      return page(query.kind === "필독" ? NOTICES.filter((n) => n.mustRead) : NOTICES);
    case "/inquiries":
      return page(INQUIRIES);
    case "/admin/inquiries":
      return page(query.status ? INQUIRIES.filter((q) => q.status === query.status) : INQUIRIES);
    case "/admin/reports":
      return page(REPORTS.filter((r) => !query.status || r.status === query.status));
    case "/admin/finance/permissions":
      return page(PEOPLE.slice(0, 6).map((p, i) => ({ id: p.id, name: p.name, email: p.email, roles: i === 0 ? ["Admin"] : i === 3 ? ["FA"] : p.roles, canViewFinance: i === 0 || i === 3 })));
    case "/docs":
      return page(DOCS);
    case "/events":
      return page(events(query.month));
    case "/finance/summary":
      return summary(query.month);
    case "/finance/receipts":
    case "/admin/finance/receipts":
      return page(RECEIPTS, { totals: { totalOrder: 8450000, paid: 3200000, pending: 4300000, overdue: 950000 } });
    case "/notifications":
      return page(NOTIFICATIONS, { unreadCount: 2 });
    case "/push/vapid-public-key":
      return { publicKey: "" };
  }
  if (s[0] === "approvals") return pick(APPROVALS as Raw[], "id", s[1]);
  if (s[0] === "posts") return { ...pick(POSTS as Raw[], "id", s[1]), comments: COMMENTS };
  if (s[0] === "notices") return pick(NOTICES as Raw[], "id", s[1]);
  if (s[0] === "admin" && s[1] === "notices" && s[3] === "unconfirmed") return page(PEOPLE.slice(6));
  if (s[0] === "admin" && s[1] === "notices") return pick(NOTICES as Raw[], "id", s[2]);
  if (s[0] === "admin" && s[1] === "events") return pick(events() as Raw[], "id", s[2]);
  if (s[0] === "inquiries") return pick(INQUIRIES as Raw[], "id", s[1]);
  if (s[0] === "docs" && s[2] === "history")
    return page([
      { ver: "v1.3", date: day(-3), who: "최하은", note: "운영 풀 비율 조정" },
      { ver: "v1.2", date: day(-40), who: "정민재", note: "배당 기준 문구 수정" },
      { ver: "v1.0", date: day(-120), who: "강민서", note: "최초 등록" },
    ]);
  if (s[0] === "docs") return pick(DOCS as Raw[], "slug", s[1]);
  if (s[0] === "events") return pick(events() as Raw[], "id", s[1]);
  if (s[0] === "projects") return pick(PROJECTS as Raw[], "id", s[1]);
  if (s[0] === "finance" && s[1] === "contracts") return CONTRACT;
  if (s[0] === "admin" && s[1] === "finance" && s[2] === "contracts") return CONTRACT;
  return page([]);
}

function write(path: string, method: string, input: Raw): unknown {
  if (path === "/me") return (me = { ...me, ...input });
  if (path === "/me/settings") {
    const { currentPassword: _c, newPassword: _n, ...rest } = input;
    return (settings = keep("dev-mock-settings", { ...settings, ...rest }));
  }
  if (path === "/me/notification-settings") {
    const kinds = { ...(notiSettings.kinds as Raw), ...((input.kinds as Raw) ?? {}) };
    return (notiSettings = keep("dev-mock-noti", { ...notiSettings, ...input, kinds }));
  }
  const s = path.split("/").filter(Boolean).map(decodeURIComponent);
  const last = s[s.length - 1];
  const id = s.length > 1 ? s[s.length - (["approve", "reject", "cancel", "resolve", "answer", "decision", "like", "comments", "report", "read", "confirm"].includes(last) ? 2 : 1)] : "dev-new";
  const now = day(0, "12:00");
  const who = String(me.name);
  if (last === "approve") return { id, status: "승인" };
  if (last === "reject") return { id, status: "반려" };
  if (last === "cancel") return { id, status: "작성 중" };
  if (last === "resolve") return { id, status: "해결됨" };
  if (last === "answer") return { id, status: "답변 완료", answer: { who, at: now, text: input.text } };
  if (last === "decision") return { id, status: input.decision };
  if (last === "like") return { liked: true, likes: 9 };
  if (last === "comments") return { ...input, id: `dev-${Date.now()}`, postId: id, author: who, who, whoId: me.id, at: now, createdAt: now, likes: 0, mine: true };
  if (last === "read") return { read: true, readAt: now, confirmed: 7 };
  if (last === "confirm") return { confirmed: 7, total: 10, confirmedByMe: true };
  if (last === "apply") return { applicationId: "dev-application", status: "접수" };
  if (path === "/uploads") return { id: `dev-upload-${Date.now()}`, filename: "첨부 파일", size: 1024 };
  if (s[1] === "permissions" || s[2] === "permissions") return { id, roles: input.canViewFinance ? ["FA"] : [], canViewFinance: !!input.canViewFinance };
  if (path === "/admin/docs") return { slug: input.slug || "dev-new", version: input.version };
  return { ...input, id: method === "POST" ? `dev-${Date.now()}` : id, status: input.status ?? "결재 대기" };
}

export async function devApi(path: string, method: string, query: Raw = {}, body?: unknown): Promise<unknown> {
  await new Promise((r) => setTimeout(r, 120));
  const result = method === "GET" ? read(path, query) : write(path, method, (body ?? {}) as Raw);
  return JSON.parse(JSON.stringify(result ?? null));
}
