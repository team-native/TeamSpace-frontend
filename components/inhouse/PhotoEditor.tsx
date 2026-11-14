"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "./ui";

const FRAME = 260; // 화면의 편집 틀 크기
const OUT = 480; // 저장할 사진 크기 (정사각형)
const MAX_ZOOM = 4;

type Pos = { x: number; y: number };

// 프로필 사진 편집: 끌어서 위치, 슬라이더 · 휠로 크기. 투명한 부분은 고른 배경색으로 채운다
export default function PhotoEditor({ src, onCancel, onApply }: { src: string; onCancel: () => void; onApply: (dataUrl: string) => void }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [bg, setBg] = useState("#ffffff");
  const drag = useRef<{ start: Pos; from: Pos } | null>(null);

  useEffect(() => {
    const i = new window.Image();
    i.onload = () => setImg(i);
    i.onerror = () => setError("사진을 읽지 못했어요. JPG나 PNG로 다시 골라주세요.");
    i.src = src;
  }, [src]);

  // 틀을 꽉 채우는 최소 배율 × 확대
  const scale = img ? (FRAME / Math.min(img.width, img.height)) * zoom : 1;
  const w = img ? img.width * scale : 0;
  const h = img ? img.height * scale : 0;

  // 사진이 틀 밖으로 비지 않게 위치를 묶는다
  const clamp = useCallback(
    (p: Pos): Pos => {
      const mx = Math.max(0, (w - FRAME) / 2);
      const my = Math.max(0, (h - FRAME) / 2);
      return { x: Math.min(mx, Math.max(-mx, p.x)), y: Math.min(my, Math.max(-my, p.y)) };
    },
    [w, h],
  );

  useEffect(() => {
    setPos((p) => clamp(p));
  }, [clamp]);

  const apply = () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, OUT, OUT);
    const k = OUT / FRAME;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (FRAME / 2 + pos.x - w / 2) * k, (FRAME / 2 + pos.y - h / 2) * k, w * k, h * k);
    onApply(canvas.toDataURL("image/jpeg", 0.85));
  };

  const setZoomKeep = (z: number) => setZoom(Math.min(MAX_ZOOM, Math.max(1, z)));

  return (
    <Modal
      eyebrow="PHOTO"
      title="사진 편집"
      sub="끌어서 위치를 옮기고, 아래에서 크기를 조절해요."
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="wd-btn ghost" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="wd-btn" onClick={apply} disabled={!img}>
            적용
          </button>
        </>
      }
    >
      {error ? (
        <p className="wd-t11" role="alert" style={{ color: "var(--t-red)" }}>
          {error}
        </p>
      ) : (
        <div style={{ display: "grid", justifyItems: "center", gap: 16 }}>
          <div
            role="application"
            aria-label="사진 위치 조절. 화살표 키로도 옮길 수 있어요"
            tabIndex={0}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              drag.current = { start: { x: e.clientX, y: e.clientY }, from: pos };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (d) setPos(clamp({ x: d.from.x + e.clientX - d.start.x, y: d.from.y + e.clientY - d.start.y }));
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onWheel={(e) => setZoomKeep(zoom - e.deltaY * 0.002)}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 20 : 6;
              const move: Record<string, Pos> = { ArrowLeft: { x: step, y: 0 }, ArrowRight: { x: -step, y: 0 }, ArrowUp: { x: 0, y: step }, ArrowDown: { x: 0, y: -step } };
              const m = move[e.key];
              if (m) {
                e.preventDefault();
                setPos((p) => clamp({ x: p.x + m.x, y: p.y + m.y }));
              }
            }}
            style={{ position: "relative", width: FRAME, height: FRAME, overflow: "hidden", borderRadius: 16, background: bg, cursor: "grab", touchAction: "none", userSelect: "none" }}
          >
            {img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                draggable={false}
                style={{ position: "absolute", left: FRAME / 2 + pos.x - w / 2, top: FRAME / 2 + pos.y - h / 2, width: w, height: h, maxWidth: "none", pointerEvents: "none" }}
              />
            )}
            {/* 실제로 보이는 동그라미 바깥은 어둡게 */}
            <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", boxShadow: "0 0 0 999px rgba(0,0,0,.45)", pointerEvents: "none" }} />
          </div>
          <label className="wd-row wd-t10" style={{ gap: 10, width: FRAME }}>
            <span aria-hidden>－</span>
            <input type="range" min={1} max={MAX_ZOOM} step={0.01} value={zoom} onChange={(e) => setZoomKeep(Number(e.target.value))} aria-label="사진 크기" style={{ flex: 1 }} />
            <span aria-hidden>＋</span>
          </label>
          <div className="wd-row wd-t10" style={{ gap: 8 }}>
            <span className="wd-faint">배경</span>
            {[
              ["#ffffff", "흰색"],
              ["#f2f4f6", "회색"],
              ["#191f28", "검정"],
            ].map(([c, label]) => (
              <button
                key={c}
                type="button"
                aria-label={`배경 ${label}`}
                aria-pressed={bg === c}
                onClick={() => setBg(c)}
                style={{ width: 22, height: 22, borderRadius: 11, background: c, border: bg === c ? "2px solid var(--t-blue)" : "1px solid var(--t-line-strong)", cursor: "pointer" }}
              />
            ))}
            <span className="wd-faint">투명한 부분에 깔려요</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
