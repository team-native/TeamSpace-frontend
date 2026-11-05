"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import MyShell, { MyTitle } from "@/components/inhouse/MyShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { Av, Modal, useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import { usePeople } from "@/lib/people";
import { applyProject, fetchProject, type Project } from "@/lib/projects";

const HOURS = ["주 3h", "주 6h", "주 10h+"];

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { people } = usePeople();
  const [project, setProject] = useState<Project | null>(null);
  const [loadError, setLoadError] = useState<{ status: number; message: string } | null>(null);
  const [applyFor, setApplyFor] = useState<string | null>(null);
  const [hours, setHours] = useState(HOURS[1]);
  const [note, setNote] = useState("");
  // 서버는 프로젝트당 한 번만 신청을 받아서, 신청하면 모든 자리를 닫는다
  const [applied, setApplied] = useState(false);
  const [sending, setSending] = useState(false);
  const req = useRef(0);

  const load = useCallback(async () => {
    const rid = ++req.current;
    setLoadError(null);
    try {
      const p = await fetchProject(id);
      if (rid === req.current) setProject(p);
    } catch (e) {
      if (rid === req.current)
        setLoadError({ status: e instanceof ApiError ? e.status : 0, message: e instanceof Error ? e.message : "프로젝트를 불러오지 못했어요." });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // 멤버 key 는 사용자 id 이거나 이름이라서 팀원 목록에서 찾아 본다
  const memberName = (key: string) => people?.find((p) => p.id === key || p.name === key)?.name ?? (/^\d+$/.test(key) ? "팀원" : key);
  const memberTone = (key: string) => people?.find((p) => p.id === key || p.name === key)?.tone;

  const submit = async () => {
    if (!project || !applyFor || sending) return;
    setSending(true);
    try {
      await applyProject(project.id, { position: applyFor, hours, note: note.trim() });
      setApplied(true);
      setApplyFor(null);
      setNote("");
      toast.show(`${applyFor} 자리에 신청했어요`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setApplied(true);
        setApplyFor(null);
        toast.show("이미 참여 신청한 프로젝트예요");
      } else {
        toast.show(e instanceof Error ? e.message : "신청하지 못했어요.");
      }
    } finally {
      setSending(false);
    }
  };

  if (loadError) {
    const missing = loadError.status === 404;
    return (
      <MyShell>
        <EmptyState
          icon={missing ? "⌕" : "!"}
          title={missing ? "프로젝트를 찾을 수 없어요" : "프로젝트를 불러오지 못했어요"}
          description={missing ? "삭제됐거나 주소가 바뀌었을 수 있어요." : loadError.message}
          actionLabel={missing ? "참여 프로젝트로" : "다시 시도"}
          onAction={missing ? () => (window.location.href = "/inhouse/my/projects") : load}
        />
      </MyShell>
    );
  }

  if (!project) {
    return (
      <MyShell>
        <p className="wd-t11 wd-faint" aria-busy="true">
          프로젝트를 불러오는 중이에요…
        </p>
      </MyShell>
    );
  }

  return (
    <MyShell>
      <MyTitle
        eyebrow="PROJECT"
        title={project.name}
        sub={project.desc}
        right={
          project.openings.length > 0 && (
            <button type="button" className="wd-btn" disabled={applied} onClick={() => setApplyFor(project.openings[0].role)}>
              {applied ? "신청 완료" : "참여 신청"}
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
          <strong style={{ fontSize: 16 }}>{project.milestone || "-"}</strong>
        </div>
        <div className="wd-card wd-stat">
          <small>담당 PM</small>
          <strong style={{ fontSize: 16 }}>{project.pm || "-"}</strong>
        </div>
      </div>
      <div className="wd-grid g2">
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>멤버 {project.members.length}</h3>
          </div>
          {project.members.length === 0 && <p className="wd-t10 wd-faint" style={{ margin: 0 }}>아직 등록된 멤버가 없어요.</p>}
          {project.members.map(({ key, role }) => (
            <div key={key} className="wd-row wd-t11" style={{ padding: "8px 0", gap: 10 }}>
              <Av name={memberName(key)} tone={memberTone(key)} size="sm" />
              <b style={{ fontWeight: 620 }}>{memberName(key)}</b>
              <span className="wd-faint">{role}</span>
            </div>
          ))}
        </section>
        <section className="wd-card">
          <div className="wd-card-head">
            <h3>모집 중인 자리</h3>
            <span className={`wd-badge ${project.openings.length ? "orange" : ""}`}>{project.openings.length}자리</span>
          </div>
          {project.openings.length === 0 && <p className="wd-t10 wd-faint" style={{ margin: 0 }}>지금은 모집 중인 자리가 없어요.</p>}
          {project.openings.map((o) => (
            <div key={`${o.role}-${o.title}`} className="wd-file" style={{ marginBottom: 8 }}>
              <span className="ext doc">+</span>
              <div>
                <b>{o.title}</b>
                <small>{[`${o.headcount}명`, o.detail].filter(Boolean).join(" · ")}</small>
              </div>
              <button type="button" className={`wd-btn sm ${applied ? "ghost" : "line"}`} style={{ marginLeft: "auto" }} disabled={applied} onClick={() => setApplyFor(o.role)}>
                {applied ? "신청 완료" : "신청"}
              </button>
            </div>
          ))}
        </section>
      </div>

      {applyFor && (
        <Modal
          eyebrow="APPLY"
          title={`${project.name} 참여 신청`}
          sub={project.pm ? `PM ${project.pm}님이 확인 후 알려드려요.` : "PM이 확인 후 알려드려요."}
          size="sm"
          onClose={() => setApplyFor(null)}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => setApplyFor(null)}>
                취소
              </button>
              <button type="button" className="wd-btn" onClick={submit} disabled={sending} aria-busy={sending}>
                {sending ? "보내는 중…" : "신청하기"}
              </button>
            </>
          }
        >
          <div className="wd-field">
            <span>지원 자리</span>
            <div className="wd-seg">
              {Array.from(new Set(project.openings.map((o) => o.role))).map((r) => (
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
