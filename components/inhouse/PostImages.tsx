"use client";

import { useEffect, useState } from "react";
import { fetchUploadBlob, type Attachment } from "@/lib/api";
import { Modal } from "./ui";

// 토큰이 있어야 받을 수 있어서 직접 받아 blob 주소로 보여준다
export function useUploadUrl(id: string | null) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    let made = "";
    setUrl("");
    setFailed(false);
    fetchUploadBlob(id)
      .then((b) => {
        made = URL.createObjectURL(b);
        if (alive) setUrl(made);
        else URL.revokeObjectURL(made);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [id]);
  return { url, failed };
}

export function UploadImage({ id, alt, style, onClick }: { id: string; alt: string; style?: React.CSSProperties; onClick?: (url: string) => void }) {
  const { url, failed } = useUploadUrl(id);
  const box: React.CSSProperties = { display: "block", width: "100%", height: "100%", objectFit: "cover", borderRadius: 12, background: "var(--t-soft)", ...style };
  if (failed) {
    return (
      <span className="wd-t10 wd-faint" style={{ ...box, display: "grid", placeItems: "center" }}>
        사진을 불러오지 못했어요
      </span>
    );
  }
  if (!url) return <span aria-busy="true" style={{ ...box, minHeight: 120, background: "var(--t-soft)" }} />;
  // eslint-disable-next-line @next/next/no-img-element
  const img = <img src={url} alt={alt} style={box} />;
  return onClick ? (
    <button type="button" onClick={() => onClick(url)} style={{ all: "unset", cursor: "zoom-in", display: "block", width: "100%", height: "100%" }}>
      {img}
    </button>
  ) : (
    img
  );
}

// 게시글 본문 아래 사진 묶음. 누르면 크게 본다
export default function PostImages({ files }: { files: Attachment[] }) {
  const [open, setOpen] = useState<{ url: string; name: string } | null>(null);
  if (files.length === 0) return null;
  const single = files.length === 1;
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: single ? "1fr" : "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 26 }}>
        {files.map((f) => (
          <div key={f.id} style={{ aspectRatio: single ? "auto" : "1 / 1" }}>
            <UploadImage id={f.id} alt={f.name} style={single ? { width: "auto", maxWidth: "100%", height: "auto", maxHeight: 420, objectFit: "contain", background: "transparent" } : undefined} onClick={(url) => setOpen({ url, name: f.name })} />
          </div>
        ))}
      </div>
      {open && (
        <Modal eyebrow="PHOTO" title={open.name} onClose={() => setOpen(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open.url} alt={open.name} style={{ display: "block", width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 12 }} />
        </Modal>
      )}
    </>
  );
}
