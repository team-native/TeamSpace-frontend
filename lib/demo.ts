// 추가 기능용 데모 데이터. 서버 연결 전까지 화면이 같은 값을 공유하도록 한곳에 모아둠
export type Tone = "" | "blue" | "green" | "orange" | "red" | "violet" | "dark";

export const DEPARTMENTS = ["Leader", "NativeOps", "PMO", "FA", "Core Platform", "Design", "NativeLab"] as const;

export type Person = {
  id: string;
  name: string;
  dept: (typeof DEPARTMENTS)[number];
  role: string;
  tone: Tone;
  email: string;
  github: string;
  joined: string;
  bio: string;
  interests: string[];
  projects: [string, string][];
  isNew?: boolean;
  lead?: boolean;
};

export const PEOPLE: Person[] = [
  { id: "junpyo", name: "김준표", dept: "Leader", role: "Founder · iOS", tone: "dark", email: "junpyo@native.team", github: "@junpyo", joined: "2025.03.02", bio: "작게 만들고 오래 쓰이는 제품을 좋아해요.", interests: ["SwiftUI", "디자인 시스템"], projects: [["Book-on", "iOS 리드"], ["TeamSpace", "PO"]], lead: true },
  { id: "haeun", name: "최하은", dept: "NativeOps", role: "운영 리드", tone: "blue", email: "haeun@native.team", github: "@haeun-choi", joined: "2025.03.02", bio: "팀이 덜 헤매도록 기준을 정리해요.", interests: ["운영", "문서화"], projects: [["TeamSpace", "운영"]], lead: true },
  { id: "doyun", name: "박도윤", dept: "PMO", role: "PM · Moil", tone: "violet", email: "doyun@native.team", github: "@doyun-park", joined: "2025.09.01", bio: "일정과 범위를 지키는 PM이에요.", interests: ["PM", "애자일"], projects: [["Moil", "PM"], ["Book-on", "PM"]], lead: true },
  { id: "minjae", name: "정민재", dept: "FA", role: "재무 담당", tone: "green", email: "minjae@native.team", github: "@minjae", joined: "2025.09.01", bio: "숫자가 맞아야 마음이 편해요.", interests: ["재무", "엑셀"], projects: [["TeamSpace", "재무"]], lead: true },
  { id: "seoyeon", name: "이서연", dept: "Core Platform", role: "iOS", tone: "blue", email: "seoyeon@native.team", github: "@seoyeon-lee", joined: "2026.10.20", bio: "작게 만들고 빨리 고치는 걸 좋아해요. SwiftUI 애니메이션에 관심 많아요.", interests: ["SwiftUI", "모션", "접근성", "러닝"], projects: [["Book-on", "iOS 개발 · 진행 중"], ["Moil", "QA 지원 · 진행 중"]], isNew: true },
  { id: "jiwoo", name: "한지우", dept: "Core Platform", role: "Web", tone: "orange", email: "jiwoo@native.team", github: "@jiwoo-han", joined: "2026.03.02", bio: "웹으로 빠르게 보여주는 걸 좋아해요.", interests: ["Next.js", "디자인"], projects: [["TeamSpace", "Web"]], lead: true },
  { id: "serin", name: "오세린", dept: "Design", role: "Product Designer", tone: "violet", email: "serin@native.team", github: "@serin-oh", joined: "2026.10.21", bio: "화면보다 흐름을 먼저 그려요.", interests: ["UX", "타이포그래피"], projects: [["Book-on", "Design"]], isNew: true, lead: true },
  { id: "taeo", name: "윤태오", dept: "NativeLab", role: "Backend", tone: "green", email: "taeo@native.team", github: "@taeo", joined: "2026.03.02", bio: "서버가 조용하면 행복해요.", interests: ["Go", "인프라"], projects: [["Book-on", "Backend"]], lead: true },
  { id: "siwoo", name: "박시우", dept: "Core Platform", role: "Web", tone: "", email: "siwoo@native.team", github: "@siwoo", joined: "2026.03.02", bio: "", interests: [], projects: [] },
  { id: "yuna", name: "강유나", dept: "Core Platform", role: "Android", tone: "", email: "yuna@native.team", github: "@yuna", joined: "2026.03.02", bio: "", interests: [], projects: [] },
  { id: "dohyun", name: "임도현", dept: "Core Platform", role: "Backend", tone: "", email: "dohyun@native.team", github: "@dohyun", joined: "2026.03.02", bio: "", interests: [], projects: [] },
];

export type NotiKind = "내 업무" | "재정" | "일정" | "공지";
export type Noti = { id: string; kind: NotiKind; ico: string; tone: Tone; title: string; meta: string; when: "오늘" | "이번 주"; href: string; unread: boolean; action?: boolean };

export const NOTIFICATIONS: Noti[] = [
  { id: "n1", kind: "내 업무", ico: "결", tone: "blue", title: "박도윤님이 'Moil 서버 비용' 결재를 요청했어요", meta: "비용 승인 · 182,000원 · 10분 전", when: "오늘", href: "/inhouse/requests/a-moil-server", unread: true, action: true },
  { id: "n2", kind: "재정", ico: "재", tone: "green", title: "Book-on 2차 중도금 1,500,000원이 입금됐어요", meta: "운영풀 +900,000원 · 적립풀 +600,000원 · 1시간 전", when: "오늘", href: "/inhouse/finance/receipts", unread: true },
  { id: "n3", kind: "공지", ico: "공", tone: "orange", title: "[필독] 10월 정산 일정 안내", meta: "NativeOps · 3시간 전", when: "오늘", href: "/inhouse/community/notices/settlement-oct", unread: true },
  { id: "n4", kind: "일정", ico: "일", tone: "violet", title: "10월 전체 회의 일정이 10.28 (수) 19:00로 바뀌었어요", meta: "Leader · 어제 18:20", when: "이번 주", href: "/inhouse/my/calendar", unread: false },
  { id: "n5", kind: "내 업무", ico: "결", tone: "blue", title: "'Book-on 테스트 기기 구매' 결재가 승인됐어요", meta: "최하은 승인 · 어제 14:02", when: "이번 주", href: "/inhouse/requests/a-bookon-device", unread: false },
  { id: "n6", kind: "공지", ico: "문", tone: "", title: "'외주 수금 및 풀 배분 기준'이 개정됐어요", meta: "제도 변경 · 10.22", when: "이번 주", href: "/inhouse/documents/finance-pool", unread: false },
];

export type ReceiptStatus = "청구 완료" | "입금 대기" | "입금 완료" | "연체";
export const RECEIPT_TONE: Record<ReceiptStatus, Tone> = { "청구 완료": "blue", "입금 대기": "orange", "입금 완료": "green", 연체: "red" };
export type ReceiptRow = { id: string; client: string; project: string; amount: number; status: ReceiptStatus; date: string; month: string };

export const RECEIPT_ROWS: ReceiptRow[] = [
  { id: "r1", client: "그린랩", project: "Book-on 앱 개발", amount: 1500000, status: "입금 완료", date: "10.21", month: "2026-10" },
  { id: "r2", client: "모일컴퍼니", project: "Moil 서버 고도화", amount: 800000, status: "입금 대기", date: "10.30 예정", month: "2026-10" },
  { id: "r3", client: "스튜디오 해", project: "브랜드 사이트 리뉴얼", amount: 2200000, status: "청구 완료", date: "10.15", month: "2026-10" },
  { id: "r4", client: "그린랩", project: "Book-on 앱 개발", amount: 1500000, status: "입금 완료", date: "09.20", month: "2026-09" },
  { id: "r5", client: "한빛학원", project: "출결 관리 웹", amount: 600000, status: "입금 완료", date: "09.08", month: "2026-09" },
  { id: "r6", client: "카페 소로", project: "주문 키오스크 UI", amount: 350000, status: "연체", date: "09.30 예정", month: "2026-09" },
  { id: "r7", client: "모일컴퍼니", project: "Moil 서버 고도화", amount: 1100000, status: "입금 대기", date: "08.31 예정", month: "2026-08" },
  { id: "r8", client: "한빛학원", project: "출결 관리 웹", amount: 900000, status: "입금 완료", date: "08.12", month: "2026-08" },
  { id: "r9", client: "스튜디오 해", project: "브랜드 사이트 리뉴얼", amount: 5400000, status: "청구 완료", date: "08.05", month: "2026-08" },
];

export const CONTRACTS: Record<string, { pm: string; signed: string; total: number; collected: number; step: number; stepDates: string[]; staff: string; split: string; next: string; file: string }> = {
  "Book-on 앱 개발": { pm: "박도윤 · PMO", signed: "2026.08.04", total: 4500000, collected: 3000000, step: 3, stepDates: ["08.01", "08.02", "08.04", "진행 중", "11.20 예정", "—"], staff: "iOS 2 · Design 1 · Backend 1", split: "운영 60% · 적립 30% · 배당 10%", next: "잔금 1,500,000원 · 11.20", file: "Book-on_용역계약서_서명본.pdf" },
};
export const CONTRACT_STEPS = ["상담", "견적", "계약", "제작", "납품", "수금"];

export type ApprovalStatus = "작성 중" | "결재 대기" | "검토 중" | "승인" | "반려";
export const APPROVAL_TONE: Record<ApprovalStatus, Tone> = { "작성 중": "", "결재 대기": "orange", "검토 중": "blue", 승인: "green", 반려: "red" };
export const EXPENSE_TYPES = ["물품 구매", "도구·구독", "외부 비용", "교육·행사", "기타"] as const;
export const STAFF_ROLES = ["iOS", "Web", "Design", "PM"] as const;

export type Approval = {
  id: string;
  kind: "비용 승인" | "인력 지원";
  type: string;
  title: string;
  amount: string;
  status: ApprovalStatus;
  date: string;
  author: string;
  authorId: string;
  project: string;
  useDate: string;
  reason: string;
  line: { who: string; role: string; state: "done" | "now" | "wait"; at: string }[];
  files: [string, string, string][];
  comments: { who: string; whoId: string; meta: string; text: string }[];
  received?: boolean;
  rejectReason?: string;
};

const DEFAULT_LINE = (state: ApprovalStatus): Approval["line"] => [
  { who: "김준표", role: "기안", state: "done", at: "10.24 09:20" },
  { who: "최하은", role: "검토", state: state === "검토 중" || state === "결재 대기" ? "now" : "done", at: state === "승인" ? "10.24 14:02" : "검토 중" },
  { who: "정민재", role: "승인", state: state === "승인" ? "done" : "wait", at: state === "승인" ? "10.24 15:10" : "대기" },
];

export const APPROVALS: Approval[] = [
  { id: "a-bookon-device", kind: "비용 승인", type: "물품 구매", title: "Book-on 테스트 기기 구매", amount: "420,000원", status: "검토 중", date: "10.24", author: "김준표", authorId: "junpyo", project: "Book-on", useDate: "2026.10.28", reason: "iOS 17 실기기 테스트용 iPhone 1대가 필요해요. 현재 테스트 기기가 iOS 16 한 대뿐이라 위젯·라이브 액티비티 QA가 막혀 있어요.", line: DEFAULT_LINE("검토 중"), files: [["PDF", "애플스토어_견적서.pdf", "284KB"], ["JPG", "기존기기_상태.jpg", "1.1MB"]], comments: [{ who: "최하은", whoId: "haeun", meta: "NativeOps · 1시간 전", text: "리퍼 제품도 괜찮다면 30만원대로 가능할 것 같아요. 확인 부탁드려요!" }, { who: "김준표", whoId: "junpyo", meta: "기안자 · 40분 전", text: "리퍼도 괜찮아요. 견적 다시 첨부할게요." }] },
  { id: "a-figma", kind: "비용 승인", type: "도구·구독", title: "Figma 팀 플랜 연간 구독", amount: "540,000원", status: "결재 대기", date: "10.23", author: "김준표", authorId: "junpyo", project: "TeamSpace", useDate: "2026.11.01", reason: "디자이너 2명 합류로 팀 플랜이 필요해요.", line: DEFAULT_LINE("결재 대기"), files: [], comments: [] },
  { id: "a-hackathon", kind: "비용 승인", type: "교육·행사", title: "11월 해커톤 간식비", amount: "150,000원", status: "작성 중", date: "임시 저장", author: "김준표", authorId: "junpyo", project: "—", useDate: "2026.11.14", reason: "", line: DEFAULT_LINE("작성 중"), files: [], comments: [] },
  { id: "a-moil-designer", kind: "인력 지원", type: "Design 1명", title: "Moil 디자이너 1명 지원", amount: "4주", status: "승인", date: "10.18", author: "김준표", authorId: "junpyo", project: "Moil", useDate: "2026.10.20 – 11.14", reason: "온보딩 화면 리디자인에 디자이너 1명이 필요해요.", line: DEFAULT_LINE("승인"), files: [], comments: [] },
  { id: "a-lecture", kind: "비용 승인", type: "외부 비용", title: "외부 강연 초청비", amount: "300,000원", status: "반려", date: "10.12", author: "김준표", authorId: "junpyo", project: "—", useDate: "2026.10.30", reason: "iOS 실무 강연자 초청 사례비예요.", line: DEFAULT_LINE("반려"), files: [], comments: [], rejectReason: "이번 분기 교육 예산을 넘어요. 다음 분기에 다시 올려주세요." },
  { id: "a-moil-server", kind: "비용 승인", type: "도구·구독", title: "Moil 서버 비용", amount: "182,000원", status: "검토 중", date: "10.24", author: "박도윤", authorId: "doyun", project: "Moil", useDate: "2026.11.01", reason: "트래픽 증가로 DB 인스턴스를 한 단계 올려야 해요. 3개월 사용 예정이에요.", line: [{ who: "박도윤", role: "기안", state: "done", at: "10.24 09:50" }, { who: "김준표", role: "검토", state: "now", at: "내 차례" }, { who: "정민재", role: "승인", state: "wait", at: "대기" }], files: [["PDF", "AWS_견적.pdf", "120KB"]], comments: [], received: true },
  { id: "a-bookon-designer", kind: "인력 지원", type: "Design 1명", title: "Book-on 디자이너 1명 지원", amount: "3주", status: "결재 대기", date: "10.24", author: "한지우", authorId: "jiwoo", project: "Book-on", useDate: "2026.11.03 – 11.21", reason: "베타 피드백 반영을 위해 디자이너 1명이 3주 필요해요.", line: [{ who: "한지우", role: "기안", state: "done", at: "10.24 08:10" }, { who: "김준표", role: "검토", state: "now", at: "내 차례" }, { who: "최하은", role: "승인", state: "wait", at: "대기" }], files: [], comments: [], received: true },
];

export const HANDLED = [
  { status: "승인" as ApprovalStatus, title: "Book-on 도메인 갱신", date: "10.22" },
  { status: "반려" as ApprovalStatus, title: "개인 장비 구매 지원", date: "10.19" },
  { status: "승인" as ApprovalStatus, title: "NativeLab 서버 비용", date: "10.15" },
];

export type Doc = {
  slug: string;
  category: string;
  type: "RULE" | "FINANCE" | "TEMPLATE" | "GUIDE";
  title: string;
  copy: string;
  date: string;
  version?: string;
  effective?: string;
  owner?: string;
  revised?: boolean;
  sections?: { title: string; revised?: boolean; lines: { text: string; was?: string; now?: string; after?: string }[] }[];
};

export const DOCS: Doc[] = [
  { slug: "project-principles", category: "운영 규칙", type: "RULE", title: "Native 프로젝트 운영 원칙", copy: "아이디어 제안부터 PO 결정, 팀 구성과 출시까지의 기준", date: "2026.07.18", version: "v1.4", effective: "2026.07.20", owner: "Leader · 김준표", sections: [{ title: "제1조 목적", lines: [{ text: "이 원칙은 Native의 프로젝트가 제안부터 출시까지 같은 기준으로 움직이도록 정한다." }] }, { title: "제2조 제안", lines: [{ text: "누구나 아이디어를 제안할 수 있고, PO는 2주 안에 진행 여부를 답한다." }] }] },
  { slug: "finance-pool", category: "재무", type: "FINANCE", title: "외주 수금 및 풀 배분 기준", copy: "운영풀·적립풀·배당풀의 배분과 정산 방식", date: "2026.10.22", version: "v2.3", effective: "2026.10.27", owner: "FA · 정민재", revised: true, sections: [
    { title: "제1조 목적", lines: [{ text: "외주 수금액을 투명하게 배분하기 위한 기준을 정한다." }] },
    { title: "제2조 용어", lines: [{ text: "운영풀은 팀 운영비, 적립풀은 다음 분기 투자금, 배당풀은 참여자 배당금을 말한다." }] },
    { title: "제3조 배분 비율", revised: true, lines: [{ text: "① 외주 수금액은 입금 확인 후 7일 안에 아래 비율로 배분한다." }, { text: "② 운영풀 60%, 적립풀 ", was: "30%", now: "25%", after: ", 배당풀 15%." }, { text: "③ 적립풀은 다음 분기 장비·교육 예산으로만 사용한다." }] },
    { title: "제4조 수금 절차", lines: [{ text: "① 담당 PM은 납품 완료 후 3일 안에 청구서를 발행한다." }, { text: "② FA는 입금을 확인하고 재정 알림을 발송한다." }] },
    { title: "제5조 정산 주기", revised: true, lines: [{ text: "① 배당풀은 ", was: "분기", now: "매월 말일", after: " 기준으로 정산한다." }] },
    { title: "제6조 예외", lines: [{ text: "무상 프로젝트는 운영풀 100%로 처리한다." }] },
  ] },
  { slug: "kickoff-template", category: "템플릿", type: "TEMPLATE", title: "프로젝트 킥오프 문서", copy: "목표, 사용자, 핵심 기능과 일정을 정리하는 시작 문서", date: "2026.07.10", owner: "PMO" },
  { slug: "equipment-template", category: "템플릿", type: "TEMPLATE", title: "장비 구매 요청서", copy: "테스트 기기·주변기기 구매를 결재로 올릴 때 쓰는 양식", date: "2026.09.30", owner: "NativeOps" },
  { slug: "outsourcing-guide", category: "NativeLab", type: "GUIDE", title: "외주 프로젝트 진행 가이드", copy: "문의 접수부터 계약, 제작, 납품과 수금까지의 절차", date: "2026.07.08", owner: "PMO" },
  { slug: "meeting-rules", category: "팀 규칙", type: "RULE", title: "회의와 의사결정 원칙", copy: "짧게 논의하고 명확하게 기록하는 팀의 방식", date: "2026.07.03", owner: "Leader" },
];

export const DOC_HISTORY: Record<string, { ver: string; date: string; who: string; note: string }[]> = {
  "finance-pool": [
    { ver: "v2.3", date: "2026.10.22", who: "정민재", note: "적립풀 30→25%, 배당풀 10→15%, 정산 주기 분기→월" },
    { ver: "v2.2", date: "2026.07.15", who: "정민재", note: "수금 절차에 청구서 발행 기한(3일) 추가" },
    { ver: "v2.1", date: "2026.05.02", who: "최하은", note: "예외 조항(무상 프로젝트) 신설" },
    { ver: "v2.0", date: "2026.03.01", who: "김준표", note: "풀 3분할 체계 도입 (운영·적립·배당)" },
  ],
};

export const TEMPLATE_FIELDS: Record<string, [string, string][]> = {
  "equipment-template": [["비용 유형", "물품 구매 (자동 선택)"], ["구매 품목", "모델명 · 수량 · 단가"], ["사용 목적", "어떤 테스트/작업에 쓰는지"], ["대체 방안", "기존 장비로 안 되는 이유"], ["견적서", "필수 첨부 · PDF/이미지"], ["반납 계획", "프로젝트 종료 후 보관 위치"]],
  "kickoff-template": [["프로젝트 목표", "한 문장으로"], ["대상 사용자", "누가 쓰는지"], ["핵심 기능", "3개 이내"], ["일정", "마일스톤과 날짜"], ["역할", "PM · 디자인 · 개발"]],
};

export type Project = { id: string; name: string; desc: string; role: string; progress: number; status: string; tone: Tone; due: string; milestone: string; pm: string; members: [string, string][]; openings: [string, string][] };

export const PROJECTS: Project[] = [
  { id: "book-on", name: "Book-on", desc: "독서 기록 앱 · 그린랩 외주 · 2026.08 – 2026.11", role: "iOS 리드", progress: 68, status: "진행 중", tone: "blue", due: "11.20 납품", milestone: "베타 배포 · 11.05", pm: "박도윤", members: [["doyun", "PM"], ["junpyo", "iOS 리드"], ["seoyeon", "iOS"], ["serin", "Design"], ["taeo", "Backend"]], openings: [["Web 프론트엔드", "1명 · 관리자 페이지 · 주 6시간"], ["QA", "1명 · 베타 테스트 · 11.01 – 11.15"]] },
  { id: "moil", name: "Moil", desc: "모임 관리 앱 · 자체 서비스 · 2026.06 –", role: "QA 지원", progress: 42, status: "진행 중", tone: "violet", due: "12.05 베타", milestone: "스프린트 6 · 11.07", pm: "박도윤", members: [["doyun", "PM"], ["seoyeon", "QA"], ["jiwoo", "Web"]], openings: [["iOS", "1명 · 위젯 · 주 6시간"]] },
  { id: "teamspace", name: "TeamSpace", desc: "Native 인하우스 · 2026.09 –", role: "PO", progress: 85, status: "마무리", tone: "green", due: "10.31 오픈", milestone: "웹 오픈 · 10.31", pm: "김준표", members: [["junpyo", "PO"], ["jiwoo", "Web"], ["haeun", "운영"]], openings: [] },
];

export type CalEvent = { day: number; title: string; tone: Tone; time?: string; place?: string; host?: string; agenda?: string; rsvp?: boolean };
export const EVENTS: CalEvent[] = [
  { day: 3, title: "Book-on 킥오프", tone: "blue" },
  { day: 9, title: "한글날 휴무", tone: "orange" },
  { day: 14, title: "디자인 리뷰", tone: "violet" },
  { day: 17, title: "NativeLab 데모데이", tone: "blue" },
  { day: 21, title: "Moil 스프린트 회고", tone: "violet" },
  { day: 24, title: "FA 정산 마감", tone: "orange" },
  { day: 28, title: "10월 전체 회의", tone: "blue", time: "10.28 (수) 19:00 – 20:30", place: "본관 302호 · 온라인 병행", host: "김준표 · Leader", agenda: "11월 프로젝트 배정, 정산 기준 개정 안내", rsvp: true },
  { day: 30, title: "영수증 제출 마감", tone: "orange" },
];

export const BOARD_CATEGORIES = ["자유", "질문", "모집", "칭찬"] as const;
export type Post = { id: string; category: string; title: string; body: string; author: string; anonymous: boolean; anonComments: boolean; views: number; likes: number; when: string; pinned?: boolean; mine?: boolean };
export type Comment = { id: string; postId: string; author: string; anonymous: boolean; text: string; when: string; likes: number; replyTo?: string };

export const POSTS: Post[] = [
  { id: "rules", category: "공지", title: "게시판 이용 규칙 (익명 정책 포함)", body: "익명이어도 존중은 실명처럼. 신고 3회 누적 시 자동 숨김돼요.", author: "NativeOps", anonymous: false, anonComments: false, views: 412, likes: 18, when: "10.01", pinned: true },
  { id: "bookon-beta", category: "모집", title: "Book-on 베타 테스터 모집합니다 (iOS)", body: "11.01부터 2주간 테스트해주실 분 찾아요. 아이폰이면 누구나 OK, 커피 쿠폰 드려요.\n\n- 기간: 11.01 – 11.15\n- 신청: 댓글로 기종 남겨주세요", author: "김준표", anonymous: false, anonComments: true, views: 128, likes: 9, when: "3시간 전", mine: true },
  { id: "cafe", category: "자유", title: "학교 근처 조용한 작업 카페 추천해주세요", body: "콘센트 많고 오래 있어도 눈치 안 보이는 곳이면 좋겠어요.", author: "익명", anonymous: true, anonComments: true, views: 86, likes: 4, when: "어제" },
  { id: "swiftdata", category: "질문", title: "SwiftData 마이그레이션 해보신 분?", body: "스키마 v2로 올릴 때 lightweight가 안 먹혀서요… 경험 공유 부탁드려요.", author: "이서연", anonymous: false, anonComments: false, views: 54, likes: 2, when: "2일 전" },
  { id: "moil-qa", category: "칭찬", title: "이번 주 Moil QA 해주신 분들 감사해요", body: "덕분에 크래시 7건 잡았습니다. 다들 최고!", author: "익명", anonymous: true, anonComments: true, views: 97, likes: 21, when: "2일 전" },
];

export const COMMENTS: Comment[] = [
  { id: "c1", postId: "bookon-beta", author: "익명", anonymous: true, text: "iPhone 13 mini 있어요! 참여할게요.", when: "2시간 전", likes: 2 },
  { id: "c2", postId: "bookon-beta", author: "김준표", anonymous: false, text: "감사해요! TestFlight 초대 보내드릴게요.", when: "1시간 전", likes: 0, replyTo: "c1" },
  { id: "c3", postId: "bookon-beta", author: "이서연", anonymous: false, text: "15 Pro로 신청합니다", when: "40분 전", likes: 1 },
];

export const REPORT_REASONS = ["욕설·비하", "개인정보 노출", "도배·광고", "사실과 다른 내용", "기타"];

export type InquiryStatus = "접수" | "검토 중" | "답변 완료";
export const INQUIRY_TONE: Record<InquiryStatus, Tone> = { 접수: "", "검토 중": "blue", "답변 완료": "green" };
export type Inquiry = { id: string; type: string; dept: string; title: string; body: string; anonymous: boolean; status: InquiryStatus; date: string; steps: string[]; answer?: { who: string; whoId: string; at: string; text: string } };

export const INQUIRIES: Inquiry[] = [
  { id: "q1", type: "문의", dept: "FA", title: "영수증 제출 기한이 지나면 어떻게 되나요?", body: "10월 사용분 영수증을 아직 못 받았는데, 30일이 지나면 정산에서 빠지는 건지 궁금해요.", anonymous: true, status: "답변 완료", date: "10.22", steps: ["10.22 10:12", "10.22 14:30", "10.23 09:05"], answer: { who: "FA 정민재", whoId: "minjae", at: "10.23 09:05", text: "30일이 지나도 빠지지 않아요. 결재 상세에서 '영수증 추후 제출'을 눌러두시면 11월 정산에 함께 반영됩니다. 영수증 받으시면 같은 결재에 첨부만 해주세요!" } },
  { id: "q2", type: "건의", dept: "NativeOps", title: "회의실 예약 방식 건의", body: "회의실 예약을 인하우스 일정에서 같이 할 수 있으면 좋겠어요.", anonymous: false, status: "검토 중", date: "10.20", steps: ["10.20 11:00", "10.21 09:40", ""] },
  { id: "q3", type: "건의", dept: "NativeOps", title: "게시판 이미지 첨부 기능 요청", body: "게시글에 사진을 올릴 수 있으면 좋겠어요.", anonymous: false, status: "접수", date: "10.24", steps: ["10.24 08:30", "", ""] },
];

export type Notice = { id: string; kind: "필독" | "제도" | "일정" | "일반"; tone: Tone; title: string; author: string; date: string; pinned?: boolean; mustRead?: boolean; confirmed: number; total: number; body: { h?: string; p: string; mark?: string; after?: string }[]; related: [string, string][] };

export const NOTICES: Notice[] = [
  { id: "settlement-oct", kind: "필독", tone: "red", title: "10월 정산 일정 안내 — 영수증은 10.30까지", author: "NativeOps 최하은", date: "10.24 09:00", pinned: true, mustRead: true, confirmed: 14, total: 20, body: [{ p: "10월 사용분 정산을 아래 일정으로 진행해요." }, { h: "일정", p: "- 영수증 제출 마감: ", mark: "10.30 (금) 23:59", after: "\n- FA 검토: 10.31\n- 배분 완료 알림: 11.03" }, { h: "제출 방법", p: "결재함 › 해당 결재 › 첨부파일에 영수증을 올려주세요. 아직 못 받은 영수증은 '추후 제출'을 눌러두세요." }], related: [["finance-pool", "외주 수금 및 풀 배분 기준"], ["outsourcing-guide", "외주 프로젝트 진행 가이드"]] },
  { id: "pool-revised", kind: "제도", tone: "orange", title: "외주 수금 및 풀 배분 기준 개정 (10.27 시행)", author: "FA 정민재", date: "10.22 18:00", pinned: true, mustRead: true, confirmed: 14, total: 20, body: [{ p: "적립풀 비율과 배당 정산 주기가 바뀌어요. 문서함에서 바뀐 부분을 확인해주세요." }], related: [["finance-pool", "외주 수금 및 풀 배분 기준"]] },
  { id: "all-hands-oct", kind: "일정", tone: "violet", title: "10월 전체 회의 · 10.28 (수) 19:00", author: "Leader 김준표", date: "10.21 12:00", confirmed: 0, total: 20, body: [{ p: "본관 302호 · 온라인 병행. 일정에서 참석 여부를 알려주세요." }], related: [] },
  { id: "web-community", kind: "일반", tone: "", title: "인하우스 웹에 게시판·문의가 생겼어요", author: "NativeOps 최하은", date: "10.20 10:00", confirmed: 0, total: 20, body: [{ p: "커뮤니티 메뉴에서 게시판, 문의·건의, 공지를 볼 수 있어요." }], related: [] },
  { id: "onboarding", kind: "일반", tone: "", title: "2학기 신규 멤버 온보딩 안내", author: "NativeOps 최하은", date: "10.14 10:00", confirmed: 0, total: 20, body: [{ p: "신규 멤버는 문서함의 운영 원칙부터 읽어주세요." }], related: [["project-principles", "Native 프로젝트 운영 원칙"]] },
];

export const ME = PEOPLE[0];
export const person = (id: string) => PEOPLE.find((p) => p.id === id);
export const initial = (name: string) => (name.length >= 3 ? name.slice(1, 2) : name.slice(0, 1));

// 브라우저 저장소 (데모). 서버 붙이면 이 함수들만 교체
export function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function saveLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장소를 못 쓰는 환경이면 화면 상태만 유지
  }
}
export const DRAFTS_KEY = "native-inhouse-approval-drafts";
export const NOTICE_READ_KEY = "native-inhouse-notice-confirmed";
