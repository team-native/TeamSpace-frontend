"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import PortalShell from "@/components/inhouse/PortalShell";
import { won, type InhouseData } from "@/lib/inhouse";
import { fetchDashboard, type Dashboard } from "@/lib/dashboard";
import { fetchDocs, type DocItem } from "@/lib/docs";
import { whenText } from "@/lib/events";
import { fetchFinanceSummary, type FinanceSummary } from "@/lib/finance";
import { useMe } from "@/lib/session";

type Shortcut = { title: string; desc: string; badge: string; href: string; icon: keyof typeof ICONS };

// 자주 찾는 곳 아이콘: 한 가지 선 굵기의 단색
const ICONS = {
  approval: "M7 3h7l4 4v14H7zM14 3v4h4M10 13l2 2 4-4",
  finance: "M4 19V9M10 19V5M16 19v-7M22 19H2",
  docs: "M3 6h6l2 2h10v11H3zM3 10h18",
  board: "M4 5h16v11H9l-5 4zM8 9h8M8 12h5",
  inquiry: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6M12 17h.01",
  team: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-3.9 3.1-7 7-7s7 3.1 7 7M16 3.5a4 4 0 0 1 0 7.5M18 14c2.4.8 4 3.2 4 7",
};

// 첫 화면 카드: 마우스를 따라 살짝 기울고 빛이 따라온다
function tilt(e: React.PointerEvent<HTMLDivElement>) {
  if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const card = (e.target as HTMLElement).closest<HTMLElement>(".hd-card");
  e.currentTarget.querySelectorAll<HTMLElement>(".hd-card").forEach((c) => {
    if (c !== card) c.style.removeProperty("--rx"), c.style.removeProperty("--ry");
  });
  if (!card) return;
  const r = card.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  card.style.setProperty("--rx", `${(0.5 - py) * 6}deg`);
  card.style.setProperty("--ry", `${(px - 0.5) * 8}deg`);
  card.style.setProperty("--mx", `${px * 100}%`);
  card.style.setProperty("--my", `${py * 100}%`);
}
function untilt(e: React.PointerEvent<HTMLDivElement>) {
  e.currentTarget.querySelectorAll<HTMLElement>(".hd-card").forEach((c) => {
    c.style.removeProperty("--rx");
    c.style.removeProperty("--ry");
  });
}

// 문장을 단어로 나눠 차례로 떠오르게 한다
function Words({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="hd-word" aria-hidden="true" style={{ ["--i" as string]: start + i }}>
          {w}
          {i < text.split(" ").length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

export default function InhouseHome() {
  const { me } = useMe();
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [dashError, setDashError] = useState("");
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [docs, setDocs] = useState<DocItem[]>([]);
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
  }, [me]);

  // 아래 구역은 화면에 들어올 때 한 번 움직인다
  useEffect(() => {
    const els = document.querySelectorAll(".hd-reveal:not(.is-in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (list) => list.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      }),
      { threshold: 0.2 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  });

  useEffect(() => {
    load();
  }, [load]);

  const unreadRevised = docs.filter((d) => d.revised && !d.read);
  const todo = todayItems(dash, unreadRevised);
  const shortcuts: Shortcut[] = [
    { icon: "approval", title: "전자결재", desc: "비용 · 인력 결재 올리기", badge: dash ? `받은 결재 ${dash.receivedApprovalCount}` : "", href: "/inhouse/requests" },
    { icon: "finance", title: "재무", desc: "풀 잔액과 수금 확인", badge: finance ? `이번 달 +${won.format(finance.summary.monthlyRevenue)}` : "", href: "/inhouse/finance" },
    { icon: "docs", title: "문서함", desc: "규칙과 템플릿 찾기", badge: unreadRevised.length ? `개정 ${unreadRevised.length}건` : "", href: "/inhouse/documents" },
    { icon: "board", title: "게시판", desc: "팀 이야기 나누기", badge: "", href: "/inhouse/community" },
    { icon: "inquiry", title: "문의 · 건의", desc: "운영진에게 묻기", badge: "", href: "/inhouse/community/inquiry" },
    { icon: "team", title: "팀원", desc: "부서와 조직도 보기", badge: "", href: "/inhouse/team" },
  ];

  return (
    <PortalShell active="home">
      <div className="wd-scope hd">
        <section className="hd-hero">
          <div className="hd-intro">
            <p>{introText(dash, todo.length)}</p>
            <div>
              <h1 aria-label="Native의 일을 한곳에서.">
                <span className="hd-line" aria-hidden="true">
                  <span>Native의 일을</span>
                </span>
                <span className="hd-line" aria-hidden="true">
                  <span>한곳에서.</span>
                </span>
              </h1>
              <a className="hd-pill down" href="#today">
                오늘 할 일 보기 <i aria-hidden="true"><span>↓</span></i>
              </a>
            </div>
          </div>
          <div className="hd-hero-cards" onPointerMove={tilt} onPointerLeave={untilt}>
            {finance && <BalanceCard data={finance} href="/inhouse/finance" />}
            <ApprovalCard dash={dash} />
          </div>
        </section>

        {finance && <FinanceStory data={finance} />}

        <section className="hd-split hd-rise" id="today">
          <div className="hd-split-head">
            <h2>오늘 할 일</h2>
            <p>{dash ? (todo.length ? `${todo.length}건이 기다리고 있어요.` : "지금 처리할 일이 없어요.") : "불러오는 중이에요…"}</p>
          </div>
          <TodayList dash={dash} items={todo} error={dashError} onRetry={load} />
        </section>

        <section className="hd-split hd-go">
          <div className="hd-split-head hd-rise">
            <h2>자주 찾는 곳</h2>
            <p>자주 쓰는 메뉴로 바로 가요.</p>
          </div>
          <nav className="hd-tiles hd-reveal" aria-label="자주 찾는 곳">
            {shortcuts.map((c, i) => (
              <Link key={c.href} href={c.href} style={{ ["--i" as string]: i }}>
                <span className="hd-tile-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d={ICONS[c.icon]} />
                  </svg>
                </span>
                <b>{c.title}</b>
                <small>{c.desc}</small>
                {c.badge && <em>{c.badge}</em>}
                <i className="hd-tile-go" aria-hidden="true">
                  <span>→</span>
                </i>
              </Link>
            ))}
          </nav>
        </section>
      </div>

      <footer className="pf-footer">
        <b>Native inhouse</b>
        <span>팀의 운영이 투명하고 단순해지도록.</span>
        <small>Native 내부 전용</small>
      </footer>
    </PortalShell>
  );
}

function introText(dash: Dashboard | null, todoCount: number) {
  if (!dash) return "오늘의 일을 모으고 있어요.";
  if (!todoCount) return "오늘은 처리할 일이 없어요. 팀 소식과 재무 현황을 확인해 보세요.";
  return `오늘 처리할 일이 ${todoCount}건 있어요. 결재와 일정, 팀의 돈 흐름을 이 화면에서 차례로 볼 수 있어요.`;
}

type BalanceMode = "available" | "total";

const manwon = (v: number) => `${won.format(Math.round(v / 10000))}만`;

// 눈금은 1·2·5 단위로 올려서 읽기 쉬운 숫자만 쓴다
function niceMax(v: number) {
  if (v <= 0) return 1;
  const unit = 10 ** Math.floor(Math.log10(v));
  return ([1, 2, 5, 10].find((m) => m * unit >= v) ?? 10) * unit;
}

// 숫자가 처음 보일 때와 바뀔 때 짧게 올라간다. 움직임을 줄인 설정이면 바로 보여준다
function useCountUp(target: number, ms = 700) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(target);
      return;
    }
    const from = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min((now - from) / ms, 1);
      setShown(Math.round(target * (1 - (1 - p) ** 4)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);
  return shown;
}

function BalanceCard({ data, href }: { data: InhouseData; href: string }) {
  const [mode, setMode] = useState<BalanceMode>("available");

  const operation = data.pools.find((p) => p.id === "operation")?.amount ?? data.summary.available;
  const reserve = data.pools.find((p) => p.id === "reserve")?.amount ?? data.summary.reserveBalance;
  const balance = mode === "available" ? operation : operation + reserve;

  const shown = useCountUp(balance);

  return (
    <article className="hd-card hd-balance">
      <div className="hd-card-head">
        <h2>재무 현황</h2>
        <div className={`fin-seg ${mode}`} aria-label="잔액 표시 기준">
          <button className={mode === "available" ? "on" : ""} onClick={() => setMode("available")}>
            사용 가능
          </button>
          <button className={mode === "total" ? "on" : ""} onClick={() => setMode("total")}>
            전체 보유금
          </button>
        </div>
      </div>
      <Spark flow={data.flow} />
      <div className="hd-card-foot">
        <p className="fin-label">{mode === "available" ? "운영풀 잔액" : "운영풀 + 적립풀 (배당 예정액 제외)"}</p>
        <strong className="fin-balance">{won.format(shown)}원</strong>
        <Link className="hd-pill" href={href}>
          재무 자세히 보기 <i aria-hidden="true"><span>→</span></i>
        </Link>
      </div>
    </article>
  );
}

// 잔액 카드의 작은 수금 추세. 축과 숫자는 아래 그래프에서 읽는다
function Spark({ flow }: { flow: InhouseData["flow"] }) {
  if (flow.length < 2) return null;
  const top = Math.max(...flow.map((f) => f.income)) || 1;
  const x = (i: number) => (i / (flow.length - 1)) * 100;
  const y = (v: number) => 92 - (v / top) * 84;
  const line = flow.map((f, i) => `${x(i)},${y(f.income)}`).join(" ");
  return (
    <div className="hd-spark" aria-hidden="true">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="hd-spark-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--t-cobalt)", stopOpacity: 0.14 }} />
          <stop offset="1" style={{ stopColor: "var(--t-cobalt)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${line} 100,100`} fill="url(#hd-spark-area)" />
      <polyline points={line} />
    </svg>
    <i className="hd-spark-dot" style={{ top: `${y(flow[flow.length - 1].income)}%` }} />
    </div>
  );
}

// 받은 결재: 지금 내 차례인 것 중 위의 두 건을 함께 보여준다
function ApprovalCard({ dash }: { dash: Dashboard | null }) {
  const count = dash?.receivedApprovalCount ?? dash?.approvals.length ?? 0;
  const shown = useCountUp(count, 500);
  const top = dash?.approvals.slice(0, 3) ?? [];
  return (
    <article className="hd-card hd-approval">
      <div className="hd-card-head">
        <h2>받은 결재</h2>
      </div>
      <strong>
        {dash ? shown : "–"}
        <small>건</small>
      </strong>
      {top.length > 0 ? (
        <div className="hd-appr">
          {top.map((a, i) => (
            <Link key={a.id} href={`/inhouse/requests/${a.id}`} style={{ ["--i" as string]: i }}>
              <div>
                <b>{a.title}</b>
                <small>{[a.author, a.date].filter(Boolean).join(" · ")}</small>
              </div>
              <i aria-hidden="true">→</i>
            </Link>
          ))}
        </div>
      ) : (
        <p className="hd-appr-empty">{dash ? "지금 검토할 결재가 없어요." : "불러오는 중이에요…"}</p>
      )}
      <div className="hd-card-foot">
        <Link className="hd-pill line" href="/inhouse/requests?tab=received">
          결재함 열기 <i aria-hidden="true"><span>→</span></i>
        </Link>
      </div>
    </article>
  );
}

// 이번 달 이야기: 문장으로 먼저 읽고, 그래프와 풀 금액으로 이어진다
function FinanceStory({ data }: { data: InhouseData }) {
  const { monthlyRevenue, monthlyExpense } = data.summary;
  const net = monthlyRevenue - monthlyExpense;
  const flow = data.flow;
  const average = flow.length ? flow.reduce((sum, f) => sum + f.income, 0) / flow.length : 0;
  const total = data.pools.reduce((sum, p) => sum + p.amount, 0);
  const first = `${data.period}에는 ${won.format(monthlyRevenue)}원이 들어오고 ${won.format(monthlyExpense)}원이 나갔어요.`;
  const second = net < 0 ? `나간 돈이 ${won.format(-net)}원 더 많아요.` : `${won.format(net)}원이 팀에 남았어요.`;

  return (
    <section className="hd-story">
      <p className="hd-statement hd-reveal" aria-label={`${first} ${second}`}>
        <Words text={first} />{" "}
        <span className="hd-rest">
          <Words text={second} start={first.split(" ").length} />
        </span>
      </p>
      <div className="hd-story-grid hd-reveal">
        <article className="hd-card hd-flow">
          <div className="hd-card-head">
            <h2>월별 수금</h2>
            {flow.length > 0 && (
              <span className="hd-avg">
                최근 {flow.length}개월 평균 <b>{won.format(Math.round(average))}원</b>
              </span>
            )}
          </div>
          <FlowChart flow={flow} />
        </article>
        <article className="hd-card hd-poolcard">
          <div className="hd-card-head">
            <h2>풀 배분</h2>
          </div>
          <div className="hd-stack" aria-hidden="true">
            {data.pools.map((pool) => (
              <i key={pool.id} className={`p-${pool.id}`} style={{ flexGrow: pool.ratio || 1 }} />
            ))}
          </div>
          <ul className="hd-poollist">
            {data.pools.map((pool) => (
              <li key={pool.id} style={{ ["--i" as string]: data.pools.indexOf(pool) }}>
                <span>
                  <i className={`hd-key p-${pool.id}`} aria-hidden="true" />
                  {POOL_NAME[pool.id] ?? pool.label} <small>{pool.ratio}%</small>
                </span>
                <b>{won.format(pool.amount)}원</b>
              </li>
            ))}
          </ul>
          <p className="hd-pooltotal">
            <span>합계</span>
            <b>{won.format(total)}원</b>
          </p>
        </article>
      </div>
    </section>
  );
}

const POOL_NAME: Record<string, string> = { operation: "운영풀", reserve: "적립풀", dividend: "배당풀" };

// 월별 수금 선그래프: 서버가 준 값만 그린다. 마우스를 올리면 그달의 지출도 함께 보여준다
function FlowChart({ flow }: { flow: InhouseData["flow"] }) {
  if (!flow.length) return <p className="fin-empty">아직 수금 기록이 없어요.</p>;
  const top = niceMax(Math.max(...flow.map((f) => f.income)));
  const x = (i: number) => ((i + 0.5) / flow.length) * 100;
  const y = (v: number) => (v / top) * 100;
  const line = flow.map((f, i) => `${x(i)},${100 - y(f.income)}`).join(" ");
  const area = `${x(0)},100 ${line} ${x(flow.length - 1)},100`;

  return (
    <figure className="fin-chart">
      <div className="fin-plot">
        {[1, 0.5, 0].map((r) => (
          <div key={r} className="fin-grid" style={{ bottom: `${r * 100}%` }}>
            <small>{r ? manwon(top * r) : "0"}</small>
          </div>
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="fin-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--t-cobalt)", stopOpacity: 0.14 }} />
              <stop offset="1" style={{ stopColor: "var(--t-cobalt)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#fin-area)" />
          <polyline points={line} />
        </svg>
        <div className="fin-cols">
          {flow.map((f, i) => (
            <div key={f.month} className={`fin-col${i >= flow.length - 2 ? " end" : ""}${i === flow.length - 1 ? " last" : ""}`} tabIndex={0}>
              <i className="fin-dot" style={{ bottom: `${y(f.income)}%`, ["--i" as string]: i }} />
              <div className="fin-tip" role="tooltip">
                <b>{f.month}</b>
                <span>수금 {won.format(f.income)}원</span>
                <span>지출 {won.format(f.expense)}원</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="fin-months">
        {flow.map((f) => (
          <small key={f.month}>{f.month}</small>
        ))}
      </div>
      <table className="fin-sr">
        <caption>월별 수금·지출</caption>
        <tbody>
          {flow.map((f) => (
            <tr key={f.month}>
              <th>{f.month}</th>
              <td>수금 {won.format(f.income)}원</td>
              <td>지출 {won.format(f.expense)}원</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

const TAG_TONE: Record<string, string> = { 결재: "blue", "할 일": "orange", 문서: "violet", 일정: "green" };

type TodoItem = { key: string; tag: string; title: string; meta: string; cta: string; href: string };

// 오늘 할 일: 나에게 온 결재 + 내 할 일 + 응답할 일정 + 읽어야 할 개정 문서
function todayItems(dash: Dashboard | null, docs: DocItem[]): TodoItem[] {
  if (!dash) return [];
  return [
    ...dash.approvals.slice(0, 3).map((a) => ({
      key: `a${a.id}`,
      tag: "결재",
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
        title: t.title,
        meta: [t.category, t.project, t.dueDate && `${t.dueDate.slice(5).replace("-", ".")} 까지`].filter(Boolean).join(" · "),
        cta: "보기",
        href: t.href || "/inhouse/my",
      })),
    ...docs.slice(0, 1).map((d) => ({
      key: `d${d.slug}`,
      tag: "문서",
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
        title: `${e.title} 참석 응답`,
        meta: [whenText(e), e.place].filter(Boolean).join(" · "),
        cta: "응답",
        href: "/inhouse/my/calendar",
      })),
  ];
}

function TodayList({ dash, items, error, onRetry }: { dash: Dashboard | null; items: TodoItem[]; error: string; onRetry: () => void }) {
  if (error) {
    return (
      <div className="wd-banner danger">
        <span className="ico">!</span>
        <div>
          <b>{error}</b>
        </div>
        <button type="button" className="wd-btn sm" onClick={onRetry}>
          다시 시도
        </button>
      </div>
    );
  }
  if (!dash || items.length === 0) return null;
  return (
    <div className="hd-todos hd-reveal">
      {items.map((t) => (
        <Link href={t.href} key={t.key}>
          <div>
            <b>{t.title}</b>
            <small>
              <i className={`hd-dot ${TAG_TONE[t.tag]}`} />
              {[t.tag, t.meta].filter(Boolean).join(" · ")}
            </small>
          </div>
          <em>{t.cta} →</em>
        </Link>
      ))}
    </div>
  );
}
