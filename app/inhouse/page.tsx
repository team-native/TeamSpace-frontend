"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PortalShell from "@/components/inhouse/PortalShell";
import { useRevealOnScroll } from "@/components/inhouse/useRevealOnScroll";
import { poolColor, useInhouseData, won, type InhouseData } from "@/lib/inhouse";
import { APPROVALS, NOTICES, POSTS } from "@/lib/demo";

export default function InhouseHome() {
  const { data, error } = useInhouseData();

  useRevealOnScroll(".pf-reveal", { threshold: 0.16, rootMargin: "0px 0px -40px" }, [data]);

  return (
    <PortalShell data={data} error={error} active="home">
      {data && (
        <>
          <section className="pf-home-hero">
            <div className="pf-home-copy pf-rise">
              <span>
                <i /> NATIVE TEAMSPACE
              </span>
              <h1>
                Native의 일을
                <br />
                한곳에서.
              </h1>
              <p>
                팀의 재무 흐름과 요청, 기준과 문서를
                <br />
                누구나 같은 화면에서 확인해요.
              </p>
            </div>
            <FinancePreview data={data} href="/inhouse/finance" />
          </section>

          <TodayPanel />

          <section className="pf-shortcuts">
            <div className="pf-section-copy pf-reveal">
              <span>WORKSPACE</span>
              <h2>
                필요한 일에 바로
                <br />
                도착할 수 있도록.
              </h2>
              <p>
                재무 확인부터 문서 요청, 운영 기준 열람까지
                <br />
                팀에서 자주 하는 일을 짧게 연결했어요.
              </p>
            </div>
            <div className="pf-shortcut-grid">
              <Link className="pf-shortcut pf-reveal" href="/inhouse/requests">
                <i>01</i>
                <span>전자결재</span>
                <h3>
                  비용과 인력 지원을
                  <br />
                  한곳에서 요청해요.
                </h3>
                <b>결재 작성하기 →</b>
              </Link>
              <Link className="pf-shortcut pf-reveal delay" href="/inhouse/documents">
                <i>02</i>
                <span>문서함</span>
                <h3>
                  규칙과 템플릿을
                  <br />
                  한곳에서 찾아요.
                </h3>
                <b>문서 찾아보기 →</b>
              </Link>
              <nav className="wd-scope pf-shortcut-more" aria-label="더 많은 바로가기">
                {[
                  ["재무", "/inhouse/finance"],
                  ["게시판", "/inhouse/community"],
                  ["문의·건의", "/inhouse/community/inquiry"],
                  ["팀원", "/inhouse/team"],
                ].map(([label, href]) => (
                  <Link key={href} href={href} className="wd-chip">
                    {label} →
                  </Link>
                ))}
              </nav>
            </div>
          </section>

          <section className="pf-recent">
            <div className="pf-section-copy pf-reveal">
              <span>RECENT</span>
              <h2>
                지금 팀이
                <br />
                알아야 할 것들.
              </h2>
            </div>
            <div className="pf-recent-list pf-reveal">
              {NOTICES.slice(0, 3).map((notice) => (
                <Link key={notice.id} href={`/inhouse/community/notices/${notice.id}`}>
                  <span>{notice.pinned ? `고정 · ${notice.kind}` : notice.kind}</span>
                  <div>
                    <b>{notice.title}</b>
                    <small>
                      {notice.author} · {notice.date}
                    </small>
                  </div>
                  <i>→</i>
                </Link>
              ))}
              {POSTS.filter((p) => !p.pinned)
                .slice(0, 1)
                .map((post) => (
                  <Link key={post.id} href={`/inhouse/community/${post.id}`}>
                    <span>게시판</span>
                    <div>
                      <b>{post.title}</b>
                      <small>
                        {post.author} · {post.when}
                      </small>
                    </div>
                    <i>→</i>
                  </Link>
                ))}
              <Link href="/inhouse/community/notices">
                <span>공지</span>
                <div>
                  <b>공지 전체 보기</b>
                  <small>필독 공지는 확인하면 체크돼요</small>
                </div>
                <i>→</i>
              </Link>
            </div>
          </section>

          <footer className="pf-footer">
            <b>Native inhouse</b>
            <span>팀의 운영이 투명하고 단순해지도록.</span>
            <small>INTERNAL USE ONLY</small>
          </footer>
        </>
      )}
    </PortalShell>
  );
}

type BalanceMode = "available" | "total";

function FinancePreview({ data, href }: { data: InhouseData; href: string }) {
  const [shown, setShown] = useState(0);
  const [mode, setMode] = useState<BalanceMode>("available");

  const operation = data.pools.find((p) => p.id === "operation")?.amount ?? data.summary.available;
  const reserve = data.pools.find((p) => p.id === "reserve")?.amount ?? data.summary.reserveBalance;
  const target = mode === "available" ? operation : operation + reserve;

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / 700, 1);
      setShown(Math.round(target * (1 - (1 - t) ** 4)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  // 보유금 추세는 월별 순이익으로 근사한 곡선
  const total = operation + reserve;
  const net = data.flow.map((f) => f.income - f.expense);
  const netSum = net.reduce((sum, v) => sum + Math.abs(v), 0) || 1;
  let running = total * 0.58;
  const raw = net.map((v) => (running += (v / netSum) * total * 0.42));
  const last = raw.at(-1) ?? total;
  const balanceSeries = raw.map((v, i) =>
    Math.max(total * 0.32, v + (total - last) * (i / Math.max(raw.length - 1, 1))),
  );
  const series = mode === "available" ? data.flow.map((f) => f.income) : balanceSeries;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const points = series.map((v, i) => ({
    x: i * (600 / (series.length - 1)) + 5,
    y: 119 - ((v - min) / range) * 76,
  }));
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="pf-finance-preview pf-rise delay">
      <div className="pf-preview-head">
        <div>
          <i /> 재무 트래픽
        </div>
        <span>{data.period}</span>
      </div>
      <div className="pf-balance-filter" aria-label="잔액 표시 기준">
        <button className={mode === "available" ? "active" : ""} onClick={() => setMode("available")}>
          사용 가능
        </button>
        <button className={mode === "total" ? "active" : ""} onClick={() => setMode("total")}>
          Native 보유금
        </button>
      </div>
      <div className="pf-preview-main">
        <small>{mode === "available" ? "지금 사용할 수 있는 금액" : "Native가 보유한 전체 자금"}</small>
        <strong>
          {won.format(shown)}원
        </strong>
        <p>
          {mode === "available"
            ? "현재 운영풀을 기준으로 계산했어요."
            : "운영풀과 적립풀을 합산했어요. 배당 예정액은 제외해요."}
        </p>
      </div>
      <div className={`pf-preview-chart ${mode}`}>
        <span>{mode === "available" ? "월별 수금 추세" : "월별 Native 보유금 추세"}</span>
        <svg
          key={mode}
          viewBox="0 0 610 145"
          role="img"
          aria-label={mode === "available" ? "1월부터 7월까지 월별 수금 추세" : "1월부터 7월까지 Native 보유금 추세"}
        >
          <polygon points={`${line} 605,135 5,135`} />
          <polyline points={line} />
          {points.map((p, i) => (
            <circle key={data.flow[i].month} cx={p.x} cy={p.y} r="3.5" />
          ))}
        </svg>
        <div>
          <small>{data.flow[0].month}</small>
          <small>{data.flow.at(-1)?.month}</small>
        </div>
      </div>
      <div className="pf-home-pools">
        {data.pools.map((pool) => (
          <div
            key={pool.id}
            className={`pool-${pool.id}`}
            style={{ "--pool-color": poolColor(pool.id) } as React.CSSProperties}
          >
            <span>
              <i style={{ background: poolColor(pool.id) }} />
              {pool.id === "dividend" ? "배당풀" : pool.label}
              <small>{pool.ratio}%</small>
            </span>
            <b>{pool.id === "dividend" ? `${pool.ratio}%` : `${won.format(pool.amount)}원`}</b>
          </div>
        ))}
      </div>
      <div className="pf-preview-meta">
        <span>
          <small>이번 달 수금</small>
          <b>+{won.format(data.summary.monthlyRevenue)}원</b>
        </span>
        <span>
          <small>이번 달 지출</small>
          <b>-{won.format(data.summary.monthlyExpense)}원</b>
        </span>
        <Link href={href}>
          자세히 보기 <b>→</b>
        </Link>
      </div>
    </div>
  );
}

// 오늘 할 일: 나에게 온 결재 + 읽어야 할 문서 + 응답할 일정
function TodayPanel() {
  const received = APPROVALS.filter((a) => a.received);
  const todos = [
    ...received.slice(0, 1).map((a) => ({
      tag: "결재",
      tone: "blue",
      title: `${a.title} 검토`,
      meta: `${a.author} · ${a.kind} · ${a.date}`,
      cta: "바로 검토",
      href: `/inhouse/requests/${a.id}`,
    })),
    {
      tag: "문서",
      tone: "orange",
      title: "외주 수금 및 풀 배분 기준 개정 확인",
      meta: "제도 변경 · 10.27 시행",
      cta: "읽기",
      href: "/inhouse/documents/finance-pool",
    },
    {
      tag: "일정",
      tone: "violet",
      title: "10월 전체 회의 참석 응답",
      meta: "10.28 (수) 19:00 · 본관 302호",
      cta: "응답",
      href: "/inhouse/my/calendar",
    },
  ];
  return (
    <section className="wd-scope pf-today pf-reveal">
      <div className="wd-wrap">
        {received.length > 0 && (
          <div className="wd-banner dark" style={{ marginBottom: 14 }}>
            <span className="ico">✓</span>
            <div>
              <b>새 결재 {received.length}건이 도착했어요</b>
              <p>{received.map((a) => a.title).join(" · ")}</p>
            </div>
            <Link className="wd-btn blue sm" href="/inhouse/requests?tab=received">
              받은 결재 보기 →
            </Link>
          </div>
        )}
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>오늘 할 일</h3>
            <span className="wd-t9 wd-faint">{todos.length}개</span>
          </div>
          <div className="wd-list">
            {todos.map((t) => (
              <div className="wd-li" key={t.title}>
                <span className={`wd-badge ${t.tone}`}>{t.tag}</span>
                <div>
                  <b>{t.title}</b>
                  <p>{t.meta}</p>
                </div>
                <Link className="wd-btn line sm" href={t.href}>
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
