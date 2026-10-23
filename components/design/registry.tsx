import type { ComponentType } from "react";
import { LoginReset, SignupDept } from "./screens/account";
import { BellDropdown, HomeExtended, Notifications } from "./screens/home";
import { MemberDetail, OrgChart, TeamSearch } from "./screens/team";
import { ContractDetail, Receipts } from "./screens/finance";
import { ApprovalDetail, ApprovalList, ApprovalReject, ApprovalReview, ApprovalWrite } from "./screens/approval";
import { DocumentDetail, DocumentHistory, DocumentsSearch, TemplateDetail } from "./screens/docs";
import { CalendarView, MySpace, ProfileEdit, ProjectApply, ProjectDetail, Settings } from "./screens/my";
import {
  BoardDelete,
  BoardDetail,
  BoardList,
  BoardReport,
  BoardWrite,
  InquiryList,
  InquiryWrite,
  NoticeDetail,
  NoticeList,
} from "./screens/community";

// [slug, 프레임 이름, 노션 기능 번호, 컴포넌트]
export const SCREENS: [string, string, string, ComponentType][] = [
  ["01-1", "01-1 로그인 · 비밀번호 찾기", "#1", LoginReset],
  ["01-2", "01-2 가입 요청 · 부서 선택", "#2", SignupDept],
  ["02-1", "02-1 홈 · 오늘 할 일 · 공지 피드", "#3 #4 #5", HomeExtended],
  ["02-2", "02-2 알림 센터", "#6 #7 #8 #9 #11", Notifications],
  ["02-3", "02-3 헤더 알림 · 웹 푸시", "#6 #10", BellDropdown],
  ["02-4", "02-4 팀원 · 검색 · 필터", "#12 #13 #14", TeamSearch],
  ["02-5", "02-5 조직도", "#15", OrgChart],
  ["02-6", "02-6 팀원 상세", "#16", MemberDetail],
  ["03-1", "03-1 수금 내역 · 기간 선택", "#17 #19 #20", Receipts],
  ["03-2", "03-2 수주 상세", "#18", ContractDetail],
  ["04-1", "04-1 결재함 · 상태 필터 · 받은 결재", "#21 #27", ApprovalList],
  ["04-2", "04-2 결재 작성 · 첨부 · 결재선 · 임시 저장", "#22 #23 #24", ApprovalWrite],
  ["04-3", "04-3 결재 상세 · 코멘트 · 취소/수정", "#25 #26", ApprovalDetail],
  ["04-4", "04-4 결재 검토 · 승인", "#28", ApprovalReview],
  ["04-5", "04-5 반려 사유", "#29", ApprovalReject],
  ["05-1", "05-1 문서함 · 최근 검색어 · 개정 배너", "#30 #31", DocumentsSearch],
  ["05-2", "05-2 문서 상세 · 개정 강조 · 읽음 확인", "#32 #33 #34", DocumentDetail],
  ["05-3", "05-3 변경 내역", "#35", DocumentHistory],
  ["05-4", "05-4 템플릿 상세", "#36 #37", TemplateDetail],
  ["06-1", "06-1 내 공간 홈", "#38 #50 #51", MySpace],
  ["06-2", "06-2 프로필", "#39", ProfileEdit],
  ["06-3", "06-3 설정 · 알림 · 방해 금지", "#40 #41 #42 #43 #44 #45", Settings],
  ["06-4", "06-4 일정 캘린더 · 상세", "#46 #47", CalendarView],
  ["06-5", "06-5 프로젝트 상세", "#48", ProjectDetail],
  ["06-6", "06-6 프로젝트 참여 신청", "#49", ProjectApply],
  ["07-1", "07-1 게시판 목록", "#52 #53", BoardList],
  ["07-2", "07-2 글쓰기", "#54 #55 #56 #57", BoardWrite],
  ["07-3", "07-3 게시글 상세 · 댓글 · 링크 복사", "#58 #59 #60 #61 #63", BoardDetail],
  ["07-4", "07-4 신고", "#62", BoardReport],
  ["07-5", "07-5 삭제 확인", "#63", BoardDelete],
  ["07-6", "07-6 문의 · 건의 작성", "#64 #65", InquiryWrite],
  ["07-7", "07-7 내 문의 · 답변", "#66 #67", InquiryList],
  ["07-8", "07-8 공지 목록", "#68", NoticeList],
  ["07-9", "07-9 공지 상세", "#69", NoticeDetail],
];
