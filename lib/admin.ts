// 운영 관리(관리자) 화면 가짜 데이터. 서버 붙이면 이 파일만 교체
import type { Tone } from "./demo";

// 관리자 메뉴가 보이는 부서
export const ADMIN_DEPTS = ["Leader", "NativeOps", "FA"] as const;
export const isAdmin = (dept: string) => (ADMIN_DEPTS as readonly string[]).includes(dept);

export type FinanceRole = { id: string; view: boolean; edit: boolean; changed?: string };
export const FINANCE_ROLES: FinanceRole[] = [
  { id: "junpyo", view: true, edit: true },
  { id: "minjae", view: true, edit: true },
  { id: "haeun", view: true, edit: false },
  { id: "doyun", view: false, edit: false },
  { id: "jiwoo", view: false, edit: false },
];

export type OrderStatus = "제작" | "입금 대기" | "청구 완료" | "수금 완료" | "연체";
export const ORDER_TONE: Record<OrderStatus, Tone> = { 제작: "blue", "입금 대기": "orange", "청구 완료": "blue", "수금 완료": "green", 연체: "red" };
export type Order = { id: string; project: string; client: string; pm: string; status: OrderStatus; total: number; collected: number };
export const ORDERS: Order[] = [
  { id: "o-bookon", project: "Book-on 앱 개발", client: "그린랩", pm: "박도윤", status: "제작", total: 4500000, collected: 3000000 },
  { id: "o-moil", project: "Moil 서버 고도화", client: "모일컴퍼니", pm: "박도윤", status: "입금 대기", total: 1900000, collected: 0 },
  { id: "o-brand", project: "브랜드 사이트 리뉴얼", client: "스튜디오 해", pm: "한지우", status: "청구 완료", total: 7600000, collected: 0 },
  { id: "o-attend", project: "출결 관리 웹", client: "한빛학원", pm: "한지우", status: "수금 완료", total: 1500000, collected: 1500000 },
  { id: "o-kiosk", project: "주문 키오스크 UI", client: "카페 소로", pm: "박도윤", status: "연체", total: 350000, collected: 0 },
];

// 입금 배분 비율 (문서함 '외주 수금 및 풀 배분 기준' v2.3)
export const POOL_SPLIT: [string, number, Tone][] = [
  ["운영풀", 0.6, "blue"],
  ["적립풀", 0.25, "violet"],
  ["배당풀", 0.15, "orange"],
];

// 전체 인원(프로필 미등록 포함). 필독 확인 현황의 분모와 같음
export const TEAM_SIZE = 20;
