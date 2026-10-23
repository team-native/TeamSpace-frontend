import type { ReactNode } from "react";

const MENU = ["홈", "재무", "결재", "문서함", "팀원", "커뮤니티"] as const;
export type Menu = (typeof MENU)[number];

export function Bell({ on = false, count = 3 }: { on?: boolean; count?: number }) {
  return (
    <span className={`wd-bell ${on ? "on" : ""}`} aria-label="알림">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {count > 0 && <b>{count}</b>}
    </span>
  );
}

export function Header({ active, bellOn = false, badge = 3 }: { active?: Menu; bellOn?: boolean; badge?: number }) {
  return (
    <header className="pf-header">
      <span className="pf-brand">
        <span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/native-logo.png" alt="Native" width={30} height={30} />
        </span>
        <b>Native</b>
      </span>
      <nav aria-label="인하우스 메뉴">
        {MENU.map((m) => (
          <a key={m} className={active === m ? "active" : ""}>
            {m}
            {m === "결재" && <em>2</em>}
          </a>
        ))}
      </nav>
      <div className="wd-actions">
        <Bell on={bellOn} count={badge} />
        <span className="wd-me">
          <span>김</span>
          <span>
            <b>김준표</b>
            <small>junpyo@native.team</small>
          </span>
        </span>
      </div>
    </header>
  );
}

export default function Screen({
  active,
  bellOn,
  badge,
  overlay,
  className = "",
  children,
}: {
  active?: Menu;
  bellOn?: boolean;
  badge?: number;
  overlay?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`wd-screen pf-shell ${className}`}>
      <Header active={active} bellOn={bellOn} badge={badge} />
      {children}
      {overlay}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="wd-eyebrow">
      <i /> {children}
    </span>
  );
}

export function Modal({
  eyebrow,
  title,
  sub,
  size = "",
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  size?: "" | "sm" | "lg";
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="wd-scrim">
      <section className={`wd-modal ${size}`}>
        <header>
          <div>
            <span>{eyebrow}</span>
            <h2>{title}</h2>
            {sub && <p>{sub}</p>}
          </div>
          <span className="wd-x">×</span>
        </header>
        <div className="wd-modal-body">{children}</div>
        {footer && <div className="wd-foot">{footer}</div>}
      </section>
    </div>
  );
}
