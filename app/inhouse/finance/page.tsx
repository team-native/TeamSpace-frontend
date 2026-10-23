"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import ModalPortal from "@/components/inhouse/ModalPortal";
import PortalHeader from "@/components/inhouse/PortalHeader";
import { poolColor, useInhouseData, won, type InhouseData, type Receipt } from "@/lib/inhouse";

export default function FinancePage() {
  const { data, error } = useInhouseData();
  const [selected, setSelected] = useState<Receipt | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (error) {
    return (
      <main className="ih-state">
        <b>!</b>
        <h1>잠시 문제가 생겼어요</h1>
        <p>{error}</p>
        <button onClick={() => location.reload()}>다시 불러오기</button>
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

  return (
    <main className="pf-shell pf-finance">
      <PortalHeader member={data.member} />
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
              <em>이번 달 확정·예정 수금</em>
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
            <p>마지막 업데이트 · 오늘 09:42</p>
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
                  지난달보다 <b>12.8% 늘었어요</b>
                </span>
                <i>↗</i>
              </div>
            </Reveal>
            <Reveal className="ih-summary-card income" delay={80}>
              <span>이번 달 들어온 돈</span>
              <strong>
                +<CountUp value={data.summary.monthlyRevenue} />원
              </strong>
              <small>외주 프로젝트 3건</small>
              <i>↗</i>
            </Reveal>
            <Reveal className="ih-summary-card expense" delay={160}>
              <span>이번 달 나간 돈</span>
              <strong>
                -<CountUp value={data.summary.monthlyExpense} />원
              </strong>
              <small>운영비 포함 8건</small>
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
                  수금과 지출의 간격이
                  <br />
                  꾸준히 벌어지고 있어요
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

        <section className="ih-receipts ih-container">
          <Reveal className="ih-section-head">
            <div>
              <span>외주 수금</span>
              <h2>이번 달 수금 현황이에요</h2>
            </div>
            <span style={{ display: "flex", gap: 8 }}>
              <button className="ih-section-link" onClick={() => setExpanded((v) => !v)}>
                {expanded ? "최근 내역만 보기" : "전체 내역 펼치기"} <b>{expanded ? "↑" : "↓"}</b>
              </button>
              <Link className="ih-section-link" href="/inhouse/finance/receipts">
                수금 내역 전체 <b>→</b>
              </Link>
            </span>
          </Reveal>
          <Reveal className="ih-receipt-table" delay={100}>
            {data.receipts.slice(0, expanded ? data.receipts.length : 3).map((receipt, i) => (
              <button
                key={`${receipt.client}-${receipt.date}`}
                className="ih-receipt-row"
                onClick={() => setSelected(receipt)}
                style={{ "--row": i } as CSSProperties}
              >
                <div className="ih-client-logo">{receipt.client.slice(0, 1)}</div>
                <div>
                  <b>{receipt.client}</b>
                  <small>{receipt.project}</small>
                </div>
                <span className={receipt.status === "수금 완료" ? "done" : "scheduled"}>{receipt.status}</span>
                <time>{receipt.date}</time>
                <strong>{won.format(receipt.amount)}원</strong>
                <i aria-hidden="true">›</i>
              </button>
            ))}
          </Reveal>
        </section>

        {selected && <ReceiptModal item={selected} onClose={() => setSelected(null)} />}

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
  const stops = data.pools.map((pool, i) => {
    const from = data.pools.slice(0, i).reduce((sum, p) => sum + p.ratio, 0);
    const to = data.pools.slice(0, i + 1).reduce((sum, p) => sum + p.ratio, 0);
    return `${poolColor(pool.id)} ${from}% ${to}%`;
  });
  return `conic-gradient(${stops.join(",")})`;
}

function ReceiptModal({ item, onClose }: { item: Receipt; onClose: () => void }) {
  return (
    <ModalPortal>
      <div className="pf-modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <section className="pf-detail-modal" role="dialog" aria-modal="true" aria-label={`${item.client} 수금 상세`}>
          <header>
            <div>
              <span>RECEIPT DETAIL</span>
              <h2>{item.client} 수금 내역</h2>
            </div>
            <button onClick={onClose} aria-label="닫기">
              ×
            </button>
          </header>
          <div className="pf-detail-body">
            <div className="pf-detail-amount">
              <span>{item.status}</span>
              <strong>{won.format(item.amount)}원</strong>
              <small>입금일 · {item.date}</small>
            </div>
            <dl>
              <div>
                <dt>거래처</dt>
                <dd>{item.client}</dd>
              </div>
              <div>
                <dt>프로젝트</dt>
                <dd>{item.project}</dd>
              </div>
              <div>
                <dt>수금 상태</dt>
                <dd>{item.status}</dd>
              </div>
              <div>
                <dt>풀 배분</dt>
                <dd>운영 40% · 적립 30% · 배당 30%</dd>
              </div>
            </dl>
            <button className="pf-detail-close" onClick={onClose}>
              확인
            </button>
          </div>
        </section>
      </div>
    </ModalPortal>
  );
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
  const max = Math.max(...items.flatMap((f) => [f.income, f.expense])) * 1.12;
  const point = (value: number, i: number) => `${52 + i * (668 / (items.length - 1))},${207 - (value / max) * 175}`;
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
          <span key={f.month}>{f.month}</span>
        ))}
      </div>
    </div>
  );
}
