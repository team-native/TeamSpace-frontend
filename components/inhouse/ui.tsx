"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { initial, person, type Tone } from "@/lib/demo";
import ModalPortal from "./ModalPortal";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="wd-eyebrow">
      <i /> {children}
    </span>
  );
}

export function Av({ name, id, tone, size = "" }: { name: string; id?: string; tone?: Tone; size?: "" | "sm" | "lg" | "xl" }) {
  const t = tone ?? (id ? person(id)?.tone : undefined) ?? "";
  return <span className={`wd-av ${size} ${t}`}>{initial(name)}</span>;
}

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
}

export function Modal({
  eyebrow,
  title,
  sub,
  size = "",
  onClose,
  footer,
  children,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  size?: "" | "sm" | "lg";
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  useEscape(onClose);
  return (
    <ModalPortal>
      <div className="wd-scope">
        <div className="wd-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <section className={`wd-modal ${size}`} role="dialog" aria-modal="true" aria-label={title}>
            <header>
              <div>
                <span>{eyebrow}</span>
                <h2>{title}</h2>
                {sub && <p>{sub}</p>}
              </div>
              <button type="button" className="wd-x" onClick={onClose} aria-label="닫기">
                ×
              </button>
            </header>
            <div className="wd-modal-body">{children}</div>
            {footer && <div className="wd-foot">{footer}</div>}
          </section>
        </div>
      </div>
    </ModalPortal>
  );
}

export function Confirm({
  title,
  message,
  confirmLabel,
  danger = false,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEscape(onClose);
  return (
    <ModalPortal>
      <div className="wd-scope">
        <div className="wd-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <div className="wd-alert" role="alertdialog" aria-modal="true" aria-label={title}>
            <span className={`ico ${danger ? "red" : ""}`}>{danger ? "!" : "✓"}</span>
            <h2>{title}</h2>
            <p>{message}</p>
            <div className="wd-foot">
              <button type="button" className="wd-btn ghost" onClick={onClose}>
                취소
              </button>
              <button
                type="button"
                className="wd-btn"
                style={danger ? { background: "#f04452" } : undefined}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

// 화면 하단 토스트. show("문구") 로 띄우고 2초 뒤 사라짐
export function useToast() {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((text: string) => {
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 2000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = message ? (
    <div className="wd-toast" role="status">
      <i>✓</i>
      {message}
    </div>
  ) : null;
  return { show, node };
}

export function useOutside<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, onClose]);
  return ref;
}

export async function copyLink(path?: string) {
  const url = path ? `${location.origin}${path}` : location.href;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // 클립보드 권한이 없으면 무시
  }
}
