"use client";

import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import MyShell, { MyTitle } from "@/components/inhouse/MyShell";
import { Av, Modal, useToast } from "@/components/inhouse/ui";
import { PROJECTS, person } from "@/lib/demo";

const HOURS = ["주 3h", "주 6h", "주 10h+"];

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const project = PROJECTS.find((p) => p.id === id);
  const toast = useToast();
  const [applyFor, setApplyFor] = useState<string | null>(null);
  const [hours, setHours] = useState(HOURS[1]);
  const [note, setNote] = useState("");
  const [applied, setApplied] = useState<string[]>([]);
  if (!project) return notFound();

  return (
    <MyShell>
      <MyTitle
        eyebrow="PROJECT"
        title={project.name}
        sub={project.desc}
        right={
          project.openings.length > 0 && (
            <button type="button" className="wd-btn" onClick={() => setApplyFor(project.openings[0][0])}>
              참여 신청
            </button>
          )
        }
      />
      <div className="wd-grid g3" style={{ marginBottom: 18 }}>
        <div className="wd-card wd-stat">
          <small>진행률</small>
          <strong>{project.progress}%</strong>
          <div className="wd-bar" style={{ marginTop: 10 }}>
            <i style={{ width: `${project.progress}%` }} />
          </div>
        </div>
        <div className="wd-card wd-stat">
          <small>다음 마일스톤</small>
          <strong style={{ fontSize: 16 }}>{project.milestone}</strong>
        </div>
        <div className="wd-card wd-stat">
          <small>담당 PM</small>
          <strong style={{ fontSize: 16 }}>{project.pm}</strong>
        </div>
      </div>
      <div className="wd-grid g2">
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>멤버 {project.members.length}</h3>
          </div>
          {project.members.map(([pid, role]) => {
            const p = person(pid);
            if (!p) return null;
            return (
              <div key={pid} className="wd-row wd-t11" style={{ padding: "8px 0", gap: 10 }}>
                <Av name={p.name} tone={p.tone} size="sm" />
                <b style={{ fontWeight: 620 }}>{p.name}</b>
                <span className="wd-faint">{role}</span>
              </div>
            );
          })}
        </section>
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>모집 중인 자리</h3>
            <span className={`wd-badge ${project.openings.length ? "orange" : ""}`}>{project.openings.length}자리</span>
          </div>
          {project.openings.length === 0 && <p className="wd-t10 wd-faint" style={{ margin: 0 }}>지금은 모집 중인 자리가 없어요.</p>}
          {project.openings.map(([r, s]) => (
            <div key={r} className="wd-file" style={{ marginBottom: 8 }}>
              <span className="ext doc">+</span>
              <div>
                <b>{r}</b>
                <small>{s}</small>
              </div>
              <button type="button" className={`wd-btn sm ${applied.includes(r) ? "ghost" : "line"}`} style={{ marginLeft: "auto" }} disabled={applied.includes(r)} onClick={() => setApplyFor(r)}>
                {applied.includes(r) ? "신청 완료" : "신청"}
              </button>
            </div>
          ))}
        </section>
      </div>

      {applyFor && (
        <Modal
          eyebrow="APPLY"
          title={`${project.name} 참여 신청`}
          sub={`PM ${project.pm}님이 확인 후 알려드려요.`}
          size="sm"
          onClose={() => setApplyFor(null)}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => setApplyFor(null)}>
                취소
              </button>
              <button
                type="button"
                className="wd-btn"
                onClick={() => {
                  setApplied([...applied, applyFor]);
                  setApplyFor(null);
                  setNote("");
                  toast.show(`${applyFor} 자리에 신청했어요`);
                }}
              >
                신청하기
              </button>
            </>
          }
        >
          <div className="wd-field">
            <span>지원 자리</span>
            <div className="wd-seg">
              {project.openings.map(([r]) => (
                <button type="button" key={r} className={applyFor === r ? "on" : ""} onClick={() => setApplyFor(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="wd-field">
            <span>투입 가능 시간</span>
            <div className="wd-seg">
              {HOURS.map((h) => (
                <button type="button" key={h} className={hours === h ? "on" : ""} onClick={() => setHours(h)}>
                  {h}
                </button>
              ))}
            </div>
          </div>
          <label className="wd-field" style={{ marginBottom: 0 }}>
            <span>
              하고 싶은 말 <em>선택</em>
            </span>
            <textarea className="wd-input" style={{ minHeight: 90 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="관련 경험이나 가능한 일정을 알려주세요" />
          </label>
        </Modal>
      )}
      {toast.node}
    </MyShell>
  );
}
