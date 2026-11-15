"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import CommunityShell from "@/components/inhouse/CommunityShell";
import { Eyebrow } from "@/components/inhouse/ui";
import { PROPOSAL_DEPTS, createProposal, fetchProposal, updateProposal } from "@/lib/proposals";
import { useMe } from "@/lib/session";

const MAX_TITLE = 100;
const MAX_BODY = 3000;

export default function ProposalWritePage() {
  return (
    <Suspense>
      <ProposalForm />
    </Suspense>
  );
}

// POST /proposals { title, body, category(담당 부서), dept, anonymous } · ?edit=id 면 PATCH /proposals/{id} (접수 단계만)
function ProposalForm() {
  const router = useRouter();
  const editId = useSearchParams().get("edit");
  const { me } = useMe();
  const [dept, setDept] = useState<string>(PROPOSAL_DEPTS[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;
    fetchProposal(editId)
      .then((p) => {
        if (!p.mine || p.status !== "접수") {
          setError("접수 단계인 내 제안만 고칠 수 있어요.");
          return;
        }
        setDept(p.dept);
        setTitle(p.title);
        setBody(p.body);
        setAnonymous(p.anonymous);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "제안을 불러오지 못했어요."))
      .finally(() => setLoading(false));
  }, [editId]);

  return (
    <CommunityShell>
      <form
        className="wd-narrow"
        style={{ width: "min(760px, 100%)" }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (sending) return;
          setError("");
          setSending(true);
          try {
            if (editId) {
              await updateProposal(editId, { title: title.trim(), body: body.trim(), dept });
              router.push(`/inhouse/community/proposals/${editId}`);
              return;
            }
            const { id } = await createProposal({ title: title.trim(), body: body.trim(), dept, anonymous });
            router.push(`/inhouse/community/proposals/${id}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "제안을 올리지 못했어요.");
            setSending(false);
          }
        }}
      >
        <section className="wd-hero sm">
          <div>
            <Eyebrow>PROPOSAL</Eyebrow>
            <h1>{editId ? "제안 고치기" : "운영 제안하기"}</h1>
            <p>담당 부서가 검토하고 진행 상태와 답변을 남겨요.</p>
          </div>
        </section>
        <div className="wd-card" style={{ padding: 28 }}>
          <div className="wd-field">
            <span>담당 부서</span>
            <div className="wd-seg" style={{ flexWrap: "wrap" }}>
              {[...PROPOSAL_DEPTS, ...((PROPOSAL_DEPTS as readonly string[]).includes(dept) ? [] : [dept])].map((d) => (
                <button type="button" key={d} className={dept === d ? "on" : ""} onClick={() => setDept(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <label className="wd-field">
            <span>
              제목 <em>{title.length} / {MAX_TITLE}</em>
            </span>
            <input className="wd-input" required maxLength={MAX_TITLE} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 회의 일정 공유 방식을 통일했으면 해요" />
          </label>
          <label className="wd-field">
            <span>
              내용 <em>{body.length.toLocaleString()} / {MAX_BODY.toLocaleString()}</em>
            </span>
            <textarea
              className="wd-input"
              required
              maxLength={MAX_BODY}
              style={{ minHeight: 220 }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={"지금 불편한 점과 바뀌었으면 하는 방향을 적어주세요.\n예) 현재 상황 / 제안 내용 / 기대 효과"}
            />
          </label>
          <div className="wd-field">
            <span>작성자 표시</span>
            <div className="wd-seg">
              <button type="button" className={!anonymous ? "on" : ""} disabled={!!editId} onClick={() => setAnonymous(false)}>
                실명 · {me?.name}
              </button>
              <button type="button" className={anonymous ? "on" : ""} disabled={!!editId} onClick={() => setAnonymous(true)}>
                익명
              </button>
            </div>
          </div>
          <div className="wd-banner gray" style={{ padding: "12px 14px", marginBottom: 22 }}>
            <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>i</span>
            <p style={{ margin: 0 }}>익명으로 올려도 담당 부서 답변과 진행 상태는 그대로 받아볼 수 있어요.</p>
          </div>
          {error && (
            <div className="wd-banner danger" role="alert" style={{ padding: "12px 14px", marginBottom: 16 }}>
              <span className="ico" style={{ width: 26, height: 26, fontSize: 11 }}>!</span>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}
          <div className="wd-row" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="wd-btn ghost" onClick={() => router.back()}>
              취소
            </button>
            <button type="submit" className="wd-btn" disabled={sending || loading || !title.trim() || !body.trim()}>
              {sending ? "보내는 중…" : editId ? "저장" : "제안하기"}
            </button>
          </div>
        </div>
      </form>
    </CommunityShell>
  );
}
