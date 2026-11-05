"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import PortalHeader from "@/components/inhouse/PortalHeader";
import { poolColor, won, type InhouseData, type Receipt } from "@/lib/inhouse";
import ReceiptDetailModal from "@/components/inhouse/ReceiptDetailModal";
import { RECEIPT_TONE, useFinanceSummary } from "@/lib/finance";
import { useMe } from "@/lib/session";

// "2026-10" → "10월"
const monthLabel = (m: string) => (/^\d{4}-\d{2}/.test(m) ? `${Number(m.slice(5, 7))}월` : m);

function syncedText(iso: string | null): string {
  if (!iso) return "은행 거래를 아직 불러오지 않았어요";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  const today = new Date().toDateString() === d.toDateString();
  return `마지막 업데이트 · ${today ? "오늘" : `${p(d.getMonth() + 1)}.${p(d.getDate())}`} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function FinancePage() {
  const { data, error, reload } = useFinanceSummary();
  const { me } = useMe();
  const [selected, setSelected] = useState<Receipt | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (error) {
    return (
      <main className="ih-state">
        <b>!</b>
        <h1>잠시 문제가 생겼어요</h1>
        <p>{error}</p>
        <button onClick={reload}>다시 불러오기</button>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="ih-state loading">
        <div className="ih-loader">
          <i />
          <i />
          <i />
        </div>
        <p>Native의 흐름을 불러오고 있어요</p>
      </main>
    );
  }

  const member = { name: me?.name ?? data.member.name, email: me?.email ?? data.member.email };
  // 지난달 대비: 흐름에 이번 달과 지난달이 모두 있을 때만
  const thisFlow = data.flow.find((f) => f.month === data.month);
  const prevFlow = data.flow[data.flow.findIndex((f) => f.month === data.month) - 1];
  const net = (f?: { income: number; expense: number }) => (f ? f.income - f.expense : 0);
  const trend =
    thisFlow && prevFlow && net(prevFlow) !== 0
      ? Math.round(((net(thisFlow) - net(prevFlow)) / Math.abs(net(prevFlow))) * 1000) / 10
      : null;

  return (
    <main className="pf-shell pf-finance">
      <PortalHeader member={member} />
      <div className="ih-shell">
        <section className="ih-hero" id="finance">
          <div className="ih-hero-copy ih-enter">
            <span className="ih-kicker">
              <i /> FINANCE · 재무 현황
            </span>
            <h1>
              팀의 돈이 흐르는 길을
              <br />
              한눈에 보여드려요.
            </h1>
            <p>
              외주 수금부터 운영, 적립, 배당까지.
              <br />
              복잡한 숫자를 이해하기 쉬운 흐름으로 정리했어요.
            </p>
            <div className="ih-hero-actions">
              <Link href="/inhouse/requests">
                결재 안건 올리기 <b>→</b>
              </Link>
            </div>
          </div>

          <div className="ih-traffic-card ih-enter delay-1">
            <div className="ih-traffic-head">
              <span>이번 달 재무 트래픽</span>
              <small>
                {data.period} <b>{data.demo ? "데모 데이터" : "LIVE"}</b>
              </small>
            </div>
            <div className="ih-traffic-source">
              <small>외주 수금액</small>
              <strong>
                <CountUp value={data.summary.externalReceipts} />원
              </strong>
              <em>등록된 확정·예정 수금 합계</em>
            </div>
            <div className="ih-flow-step">
              <span>확정·예정 수금을 세 개의 풀로 자동 배분</span>
              <i>↓</i>
            </div>
            <div className="ih-traffic-pools">
              {data.pools.map((pool, i) => (
                <div
                  key={pool.id}
                  className={`pool-${pool.id}`}
                  style={{ "--pool": poolColor(pool.id), "--delay": `${0.55 + i * 0.16}s` } as CSSProperties}
                >
                  <i />
                  <small>{pool.id === "dividend" ? "배당풀" : pool.label}</small>
                  <strong>{pool.id === "dividend" ? `${pool.ratio}%` : `${won.format(pool.amount)}원`}</strong>
                  <span>{pool.ratio}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ih-overview ih-container">
          <Reveal className="ih-section-head">
            <div>
              <span>이번 달</span>
              <h2>돈의 흐름을 요약했어요</h2>
            </div>
            <p>{syncedText(data.lastSyncedAt)}</p>
          </Reveal>
          <div className="ih-summary-grid">
            <Reveal className="ih-balance-card" delay={0}>
              <div>
                <span>지금 사용할 수 있는 금액</span>
                <small>현재 운영풀</small>
              </div>
              <strong>
                <CountUp value={data.summary.available} />원
              </strong>
              <div className="ih-balance-bottom">
                <span>
                  {trend === null ? (
                    "운영풀에 남아 있는 금액이에요"
                  ) : (
                    <>
                      지난달보다 <b>{Math.abs(trend)}% {trend >= 0 ? "늘었어요" : "줄었어요"}</b>
                    </>
                  )}
                </span>
                <i>{trend !== null && trend < 0 ? "↘" : "↗"}</i>
              </div>
            </Reveal>
            <Reveal className="ih-summary-card income" delay={80}>
              <span>이번 달 들어온 돈</span>
              <strong>
                +<CountUp value={data.summary.monthlyRevenue} />원
              </strong>
              <small>입금 완료 기준</small>
              <i>↗</i>
            </Reveal>
            <Reveal className="ih-summary-card expense" delay={160}>
              <span>이번 달 나간 돈</span>
              <strong>
                -<CountUp value={data.summary.monthlyExpense} />원
              </strong>
              <small>승인된 결재 · 은행 지출</small>
              <i>↘</i>
            </Reveal>
            <Reveal className="ih-summary-card reserve" delay={240}>
              <span>현재 쌓인 적립풀</span>
              <strong>
                <CountUp value={data.summary.reserveBalance} />원
              </strong>
              <small>다음 프로젝트를 위한 자금</small>
              <i>＋</i>
            </Reveal>
          </div>
        </section>

        <section className="ih-chart-section ih-container">
          <Reveal className="ih-chart-card">
            <div className="ih-chart-head">
              <div>
                <span>월별 현금 흐름</span>
                <h3>
                  달마다 들어오고 나간
                  <br />
                  돈을 비교해요
                </h3>
              </div>
              <div className="ih-chart-legend">
                <span>
                  <i className="blue" />
                  들어온 돈
                </span>
                <span>
                  <i className="gray" />
                  나간 돈
                </span>
              </div>
            </div>
            <FlowChart items={data.flow} />
          </Reveal>
          <Reveal className="ih-allocation-card" delay={100}>
            <span>풀 배분</span>
            <h3>
              들어온 돈은
              <br />
              이렇게 나누고 있어요
            </h3>
            <div className="ih-donut" style={{ background: donutGradient(data) }}>
              <div>
                <b>100%</b>
                <small>자동 배분</small>
              </div>
            </div>
            <ul>
              {data.pools.map((pool) => (
                <li key={pool.id} className={`pool-${pool.id}`}>
                  <i style={{ background: poolColor(pool.id) }} />
                  <div>
                    <b>{pool.id === "dividend" ? "배당풀" : pool.label}</b>
                    <small>{pool.note}</small>
                  </div>
                  <strong style={{ color: poolColor(pool.id) }}>{pool.ratio}%</strong>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {data.detailed && (
        <section className="ih-receipts ih-container">
          <Reveal className="ih-section-head">
            <div>
              <span>외주 수금</span>
              <h2>최근 수금 현황이에요</h2>
            </div>
            <span style={{ display: "flex", gap: 8 }}>
              {data.receipts.length > 3 && (
              <button className="ih-section-link" onClick={() => setExpanded((v) => !v)}>
                {expanded ? "최근 내역만 보기" : "전체 내역 펼치기"} <b>{expanded ? "↑" : "↓"}</b>
              </button>
              )}
              <Link className="ih-section-link" href="/inhouse/finance/receipts">
                수금 내역 전체 <b>→</b>
              </Link>
            </span>
          </Reveal>
          <Reveal className="ih-receipt-table" delay={100}>
            {data.receipts.length === 0 && (
              <p style={{ padding: "28px 24px", margin: 0, color: "#8b95a1", fontSize: 14 }}>아직 등록된 수금이 없어요.</p>
            )}
            {data.receipts.slice(0, expanded ? data.receipts.length : 3).map((receipt, i) => (
              <button
                key={`${receipt.client}-${receipt.date}-${i}`}
                className="ih-receipt-row"
                onClick={() => setSelected(receipt)}
                style={{ "--row": i } as CSSProperties}
              >
                <div className="ih-client-logo">{receipt.client.slice(0, 1)}</div>
                <div>
                  <b>{receipt.client}</b>
                  <small>{receipt.project}</small>
                </div>
                <span className={receipt.status === "입금 완료" ? "done" : "scheduled"} data-tone={RECEIPT_TONE[receipt.status] ?? ""}>
                  {receipt.status}
                </span>
                <time>{receipt.date}</time>
                <strong>{won.format(receipt.amount)}원</strong>
                <i aria-hidden="true">›</i>
              </button>
            ))}
          </Reveal>
        </section>
        )}

        {selected && (
          <ReceiptDetailModal
            type="receipt"
            item={selected}
            pools={data.pools}
            onClose={() => setSelected(null)}
          />
        )}

        <footer className="ih-footer">
          <div className="ih-wordmark">
            <span>
              <Image src="/native-logo.png" alt="" fill style={{ objectFit: "cover" }} sizes="30px" unoptimized />
            </span>
            <b>Native</b>
          </div>
          <p>플랫폼에 맞는 자연스러운 경험을 설계하고 구현합니다.</p>
          <small>INTERNAL USE ONLY · 2026 NATIVE</small>
        </footer>
      </div>
    </main>
  );
}

function donutGradient(data: InhouseData) {
  if (data.pools.reduce((sum, p) => sum + p.ratio, 0) === 0) return "#e5e8eb";
  const stops = data.pools.map((pool, i) => {
    const from = data.pools.slice(0, i).reduce((sum, p) => sum + p.ratio, 0);
    const to = data.pools.slice(0, i + 1).reduce((sum, p) => sum + p.ratio, 0);
    return `${poolColor(pool.id)} ${from}% ${to}%`;
  });
  return `conic-gradient(${stops.join(",")})`;
}

function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1100, 1);
      setShown(Math.round(value * (1 - (1 - t) ** 4)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{won.format(shown)}</>;
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.16,
      rootMargin: "0px 0px -40px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`ih-reveal ${visible ? "visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function FlowChart({ items }: { items: InhouseData["flow"] }) {
  if (items.length === 0) {
    return <p style={{ padding: "60px 0", textAlign: "center", color: "#8b95a1", fontSize: 14 }}>아직 쌓인 월별 기록이 없어요.</p>;
  }
  const max = Math.max(1, ...items.flatMap((f) => [f.income, f.expense])) * 1.12;
  // 한 달뿐이면 가운데에 점 하나
  const point = (value: number, i: number) =>
    `${items.length === 1 ? 386 : 52 + i * (668 / (items.length - 1))},${207 - (value / max) * 175}`;
  const income = items.map((f, i) => point(f.income, i)).join(" ");
  const expense = items.map((f, i) => point(f.expense, i)).join(" ");
  const area = `M ${income.replaceAll(" ", " L ")} L 720,207 L 52,207 Z`;

  return (
    <div className="ih-chart-wrap">
      <svg viewBox="0 0 760 245" role="img" aria-label="월별 수입 및 지출 추이">
        <defs>
          <linearGradient id="financeArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3182f6" stopOpacity=".16" />
            <stop offset="1" stopColor="#3182f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="area" d={area} />
        <polyline className="expense-line" points={expense} />
        <polyline className="income-line" points={income} />
        {items.map((f, i) => {
          const [cx, cy] = point(f.income, i).split(",");
          return <circle key={f.month} cx={cx} cy={cy} r="4.5" />;
        })}
      </svg>
      <div className="ih-chart-labels">
        {items.map((f) => (
          <span key={f.month}>{monthLabel(f.month)}</span>
        ))}
      </div>
    </div>
  );
}
