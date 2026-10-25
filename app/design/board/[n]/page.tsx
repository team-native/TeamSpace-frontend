import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { AdminDocRevise, AdminEvent, AdminFinanceRole, AdminHome, AdminIncome, AdminInquiry, AdminNotice, AdminReport } from "@/components/design/screens/admin";
import {
  DarkApproval,
  DarkMySpace,
  ErrorPage,
  HomeShortcuts,
  MobileApproval,
  MobileCalendar,
  MobileOrg,
  ProfileMenu,
  StatesSheet,
  StyleGuide,
  TeamUnified,
} from "@/components/design/screens/remaining";

// 여러 화면을 한 번에 Figma로 캡처하기 위한 보드 (세로로 쌓거나 가로로 나란히)
const BOARDS: Record<string, { row?: boolean; screens: ComponentType[] }> = {
  "1": { screens: [AdminHome, AdminNotice, AdminEvent, AdminDocRevise] },
  "2": { screens: [AdminInquiry, AdminReport, AdminFinanceRole, AdminIncome] },
  "3": { screens: [DarkMySpace, DarkApproval, StatesSheet, ErrorPage] },
  "4": { screens: [HomeShortcuts, TeamUnified, ProfileMenu, StyleGuide] },
  "5": { row: true, screens: [MobileOrg, MobileCalendar, MobileApproval] },
  "6": { screens: [AdminIncome] },
};

export function generateStaticParams() {
  return Object.keys(BOARDS).map((n) => ({ n }));
}

export default async function Board({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const board = BOARDS[n];
  if (!board) notFound();
  return (
    <div className={board.row ? "wd-board wd-board-row" : "wd-board"}>
      {board.screens.map((View, i) => (
        <View key={i} />
      ))}
    </div>
  );
}
