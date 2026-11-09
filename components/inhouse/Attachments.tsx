"use client";

import { useState } from "react";
import { downloadUpload, fileSize, type Attachment } from "@/lib/api";

const ext = (name: string) => (name.includes(".") ? name.split(".").pop()!.slice(0, 4).toUpperCase() : "FILE");

// 첨부 파일 목록: 누르면 GET /uploads/{id} 로 받아서 저장
export default function Attachments({ files, title = "첨부 파일" }: { files: Attachment[]; title?: string }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  if (files.length === 0) return null;
  return (
    <>
      <b className="wd-t10" style={{ display: "block", margin: "26px 0 10px", color: "var(--t-muted)" }}>
        {title} {files.length}
      </b>
      <div className="wd-grid g2">
        {files.map((f) => (
          <button
            type="button"
            key={f.id}
            className="wd-file"
            style={{ textAlign: "left", cursor: "pointer" }}
            disabled={busy === f.id}
            onClick={async () => {
              setError("");
              setBusy(f.id);
              try {
                await downloadUpload(f);
              } catch (e) {
                setError(e instanceof Error ? e.message : "파일을 받지 못했어요.");
              } finally {
                setBusy("");
              }
            }}
          >
            <span className="ext doc">{ext(f.name)}</span>
            <div>
              <b>{f.name}</b>
              <small>{busy === f.id ? "받는 중…" : fileSize(f.size) || "내려받기"}</small>
            </div>
            <span className="end">↓</span>
          </button>
        ))}
      </div>
      {error && (
        <p className="wd-t10" role="alert" style={{ color: "var(--t-red)", margin: "8px 0 0" }}>
          {error}
        </p>
      )}
    </>
  );
}
