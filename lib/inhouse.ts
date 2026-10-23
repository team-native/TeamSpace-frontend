import preview from "./preview.json";

export type PoolId = "operation" | "reserve" | "dividend";

export type Pool = {
  id: PoolId;
  label: string;
  amount: number;
  ratio: number;
  color: string;
  note: string;
};

export type Receipt = {
  client: string;
  project: string;
  amount: number;
  status: string;
  date: string;
};

export type InhouseData = {
  period: string;
  demo: boolean;
  summary: {
    available: number;
    monthlyRevenue: number;
    monthlyExpense: number;
    externalReceipts: number;
    reserveBalance: number;
  };
  pools: Pool[];
  flow: { month: string; income: number; expense: number }[];
  receipts: Receipt[];
  notices: { category: string; title: string; meta: string }[];
  member: { email: string; name: string };
};

// 원본은 /api/inhouse 응답을 쓰지만, 지금은 미리보기(데모) 데이터로 고정
export function useInhouseData(): { data: InhouseData | null; error: string } {
  return { data: preview as InhouseData, error: "" };
}

export const won = new Intl.NumberFormat("ko-KR");

const poolColors: Record<string, string> = {
  operation: "#3182f6",
  reserve: "#7c5cff",
  dividend: "#ff8a3d",
};

export function poolColor(id: string) {
  return poolColors[id] ?? "#3182f6";
}

export const profileKey = (email: string) => `native-inhouse-profile:${email}`;
