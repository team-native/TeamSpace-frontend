"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import PortalShell from "@/components/inhouse/PortalShell";
import { useRevealOnScroll } from "@/components/inhouse/useRevealOnScroll";
import { poolColor, won, type InhouseData } from "@/lib/inhouse";
import { fetchDashboard, type Dashboard } from "@/lib/dashboard";
import { fetchDocs, type DocItem } from "@/lib/docs";
import { whenText } from "@/lib/events";
import { fetchFinanceSummary, type FinanceSummary } from "@/lib/finance";
import { fetchNotices, type Notice } from "@/lib/notices";
import { fetchPosts, type Post } from "@/lib/board";
import { useMe } from "@/lib/session";

type Shortcut = { icon: string; title: string; desc: string; badge: string; tone: string; href: string };

export default function InhouseHome() {
  const { me } = useMe();
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [dashError, setDashError] = useState("");
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const req = useRef(0);

  const load = useCallback(async () => {
    if (!me) return;
    const id = ++req.current;
    setDashError("");
    // 홈은 여러 곳을 모아 보여줘서, 한 곳이 실패해도 나머지는 보여준다
    fetchDashboard(me.id)
      .then((d) => id === req.current && setDash(d))
      .catch((e) => id === req.current && setDashError(e instanceof Error ? e.message : "오늘 할 일을 불러오지 못했어요."));
    fetchFinanceSummary()
      .then((f) => id === req.current && setFinance(f))
      .catch(() => {});
    fetchDocs(100)
      .then((list) => id === req.current && setDocs(list))
      .catch(() => {});
    fetchNotices("전체")
      .then((page) => id === req.current && setNotices(page.items.slice(0, 3)))
      .catch(() => id === req.current && setNotices([]));
    fetchPosts({ sort: "최신순", limit: 5 })
      .then((page) => id === req.current && setPost(page.items.find((p) => !p.pinned) ?? null))
      .catch(() => {});
  }, [me]);

  useEffect(() => {
    load();
  }, [load]);

  useRevealOnScroll(".pf-reveal", { threshold: 0.16, rootMargin: "0px 0px -40px" }, [dash, finance, notices]);

  const unreadRevised = docs.filter((d) => d.revised && !d.read);
  const shortcuts: Shortcut[] = [
    { icon: "결", title: "전자결재", desc: "비용 · 인력 결재 올리기", badge: dash ? `받은 결재 ${dash.receivedApprovalCount}` : "", tone: "blue", href: "/inhouse/requests" },
    { icon: "재", title: "재무", desc: "풀 잔액과 수금 확인", badge: finance ? `이번 달 +${won.format(finance.summary.monthlyRevenue)}` : "", tone: "green", href: "/inhouse/finance" },
    { icon: "문", title: "문서함", desc: "규칙과 템플릿 찾기", badge: unreadRevised.length ? `개정 ${unreadRevised.length}건` : "", tone: "orange", href: "/inhouse/documents" },
    { icon: "게", title: "게시판", desc: "팀 이야기 나누기", badge: "", tone: "violet", href: "/inhouse/community" },
    { icon: "?", title: "문의 · 건의", desc: "운영진에게 묻기", badge: "", tone: "", href: "/inhouse/community/inquiry" },
    { icon: "팀", title: "팀원", desc: "부서와 조직도 보기", badge: "", tone: "", href: "/inhouse/team" },
  ];

  return (
    <PortalShell active="home">
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
        {finance && <FinancePreview data={finance} href="/inhouse/finance" />}
      </section>

      <TodayPanel dash={dash} error={dashError} docs={unreadRevised} onRetry={load} />

      <section className="pf-shortcuts">
        <div className="pf-section-copy pf-reveal">
          <span>WORKSPACE</span>
          <h2>
            필요한 일에 바로
            <br />
            도착할 수 있도록.
          </h2>
          <p>
            자주 하는 일 여섯 가지를 한 화면에 모았어요.
            <br />
            각 카드에 지금 확인할 숫자가 함께 보여요.
          </p>
        </div>
        <div className="wd-scope wd-grid g3 pf-reveal">
          {shortcuts.map((c) => (
            <Link key={c.href} href={c.href} className="wd-card pf-home-shortcut">
              <div className="wd-between">
                <span className={`wd-av ${c.tone}`} style={{ borderRadius: 12 }}>
                  {c.icon}
                </span>
                {c.badge && <span className={`wd-badge ${c.tone}`}>{c.badge}</span>}
              </div>
              <b>{c.title}</b>
              <span className="wd-t10 wd-faint">{c.desc} →</span>
            </Link>
          ))}
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
          {notices?.map((notice) => (
            <Link key={notice.id} href={`/inhouse/community/notices/${notice.id}`}>
              <span>{notice.pinned ? `고정 · ${notice.kind}` : notice.kind}</span>
              <div>
                <b>{notice.title}</b>
                <small>
                  {[notice.author, notice.date].filter(Boolean).join(" · ")}
                </small>
              </div>
              <i>→</i>
            </Link>
          ))}
          {post && (
            <Link href={`/inhouse/community/${post.id}`}>
              <span>게시판</span>
              <div>
                <b>{post.title}</b>
                <small>
                  {[post.author, post.when].filter(Boolean).join(" · ")}
                </small>
              </div>
              <i>→</i>
            </Link>
          )}
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
  const max = series.length ? Math.max(...series) : 0;
  const min = series.length ? Math.min(...series) : 0;
  const range = max - min || 1;
  const points = series.map((v, i) => ({
    x: series.length === 1 ? 305 : i * (600 / (series.length - 1)) + 5,
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
          aria-label={mode === "available" ? "월별 수금 추세" : "월별 Native 보유금 추세"}
        >
          {points.length > 1 && <polygon points={`${line} 605,135 5,135`} />}
          {points.length > 1 && <polyline points={line} />}
          {points.map((p, i) => (
            <circle key={data.flow[i].month} cx={p.x} cy={p.y} r="3.5" />
          ))}
        </svg>
        <div>
          <small>{data.flow[0]?.month ?? "기록 없음"}</small>
          <small>{data.flow.length > 1 ? data.flow.at(-1)?.month : ""}</small>
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

// 오늘 할 일: 나에게 온 결재 + 내 할 일 + 응답할 일정 + 읽어야 할 개정 문서
function TodayPanel({ dash, error, docs, onRetry }: { dash: Dashboard | null; error: string; docs: DocItem[]; onRetry: () => void }) {
  const received = dash?.approvals ?? [];
  const items = dash
    ? [
        ...received.slice(0, 3).map((a) => ({
          key: `a${a.id}`,
          tag: "결재",
          tone: "blue",
          title: `${a.title} 검토`,
          meta: [a.author, a.kind, a.date].filter(Boolean).join(" · "),
          cta: "바로 검토",
          href: `/inhouse/requests/${a.id}`,
        })),
        // 결재에서 만들어진 할 일은 위 결재와 겹쳐서 뺀다
        ...dash.todos
          .filter((t) => !t.fromApproval)
          .slice(0, 3)
          .map((t) => ({
            key: `t${t.id}`,
            tag: "할 일",
            tone: "green",
            title: t.title,
            meta: [t.category, t.project, t.dueDate && `${t.dueDate.slice(5).replace("-", ".")} 까지`].filter(Boolean).join(" · "),
            cta: "보기",
            href: t.href || "/inhouse/my",
          })),
        ...docs.slice(0, 1).map((d) => ({
          key: `d${d.slug}`,
          tag: "문서",
          tone: "orange",
          title: `${d.title} 개정 확인`,
          meta: ["제도 변경", d.effective && `${d.effective} 시행`].filter(Boolean).join(" · "),
          cta: "읽기",
          href: `/inhouse/documents/${d.slug}`,
        })),
        ...dash.events
          .filter((e) => e.needsReply)
          .slice(0, 1)
          .map((e) => ({
            key: `e${e.id}`,
            tag: "일정",
            tone: "violet",
            title: `${e.title} 참석 응답`,
            meta: [whenText(e), e.place].filter(Boolean).join(" · "),
            cta: "응답",
            href: "/inhouse/my/calendar",
          })),
      ]
    : [];

  return (
    <section className="wd-scope pf-today pf-reveal">
      <div className="wd-wrap">
        {received.length > 0 && (
          <div className="wd-banner dark" style={{ marginBottom: 14 }}>
            <span className="ico">✓</span>
            <div>
              <b>검토할 결재 {dash?.receivedApprovalCount ?? received.length}건이 있어요</b>
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
            {dash && <span className="wd-t9 wd-faint">{items.length}개</span>}
          </div>
          {error && (
            <div className="wd-banner danger">
              <span className="ico">!</span>
              <div>
                <b>{error}</b>
              </div>
              <button type="button" className="wd-btn sm" onClick={onRetry}>
                다시 시도
              </button>
            </div>
          )}
          {!dash && !error && <p className="wd-t10 wd-faint" aria-busy="true">불러오는 중이에요…</p>}
          {dash && items.length === 0 && <p className="wd-t10 wd-faint" style={{ margin: 0 }}>지금 처리할 일이 없어요.</p>}
          <div className="wd-list">
            {items.map((t) => (
              <div className="wd-li" key={t.key}>
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
