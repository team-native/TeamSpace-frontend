"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/inhouse/AdminShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { Av, Modal, useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import { createMember, deleteMember, fetchRoleMembers, ROLE_OPTIONS, setMemberRoles, type NewMember, type RoleMember } from "@/lib/admin-api";
import { DEPARTMENTS } from "@/lib/shared";
import { isAdminRole, loadMe, useMe } from "@/lib/session";

const notYet = (e: unknown, what: string) =>
  e instanceof ApiError && (e.status === 404 || e.status === 405)
    ? `서버에 아직 ${what} 기능이 없어요`
    : e instanceof Error
      ? e.message
      : `${what}하지 못했어요.`;
const EMPTY: NewMember = { name: "", email: "", dept: "", roles: [] };

// 멤버 권한: 목록 GET /people · 역할 PATCH /admin/users/{id}/roles · 추가 POST /admin/users · 삭제 DELETE /admin/users/{id} (Admin 만)
export default function AdminMembers() {
  const toast = useToast();
  const { me } = useMe();
  const [rows, setRows] = useState<RoleMember[] | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [busy, setBusy] = useState("");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<NewMember>(EMPTY);
  const [removing, setRemoving] = useState<RoleMember | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRows(await fetchRoleMembers());
    } catch (e) {
      setError({ status: e instanceof ApiError ? e.status : 0, message: e instanceof Error ? e.message : "멤버 목록을 불러오지 못했어요." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((m) => !q || `${m.name} ${m.email} ${m.dept} ${m.roles.join(" ")}`.toLowerCase().includes(q));
  }, [rows, query]);
  const adminCount = (rows ?? []).filter((m) => m.roles.includes("Admin")).length;

  const toggle = async (m: RoleMember, role: string) => {
    if (busy) return;
    const on = !m.roles.includes(role);
    // 마지막 Admin 이 자기 Admin 을 빼면 아무도 관리 화면에 못 들어온다
    if (!on && role === "Admin" && adminCount <= 1) {
      toast.show("Admin이 최소 한 명은 있어야 해요");
      return;
    }
    if (!on && role === "Admin" && m.id === me?.id && !window.confirm("내 Admin 역할을 빼면 이 화면에 다시 들어올 수 없어요. 계속할까요?")) return;
    const next = on ? [...m.roles, role] : m.roles.filter((r) => r !== role);
    setBusy(m.id);
    try {
      const r = await setMemberRoles(m.id, next);
      const roles = Array.isArray(r?.roles) ? r.roles : next;
      setRows((rs) => rs?.map((x) => (x.id === m.id ? { ...x, roles } : x)) ?? null);
      if (m.id === me?.id) loadMe(true);
      toast.show(on ? `${m.name}님에게 ${role} 역할을 줬어요` : `${m.name}님의 ${role} 역할을 뺐어요`);
    } catch (e) {
      toast.show(notYet(e, "역할 변경"));
    } finally {
      setBusy("");
    }
  };

  const add = async () => {
    if (!draft.name.trim() || !/^\S+@\S+\.\S+$/.test(draft.email.trim())) {
      toast.show("이름과 이메일을 확인해 주세요");
      return;
    }
    setBusy("new");
    try {
      await createMember({ ...draft, name: draft.name.trim(), email: draft.email.trim() });
      toast.show(`${draft.name.trim()}님을 추가했어요`);
      setAdding(false);
      setDraft(EMPTY);
      load();
    } catch (e) {
      toast.show(notYet(e, "멤버 추가"));
    } finally {
      setBusy("");
    }
  };

  const remove = async (m: RoleMember) => {
    if (m.roles.includes("Admin") && adminCount <= 1) {
      toast.show("마지막 Admin은 삭제할 수 없어요");
      return;
    }
    setBusy(m.id);
    try {
      await deleteMember(m.id);
      setRows((rs) => rs?.filter((x) => x.id !== m.id) ?? null);
      toast.show(`${m.name}님을 삭제했어요`);
      setRemoving(null);
    } catch (e) {
      toast.show(notYet(e, "멤버 삭제"));
    } finally {
      setBusy("");
    }
  };

  if (error?.status === 403 || (me && !isAdminRole(me))) {
    return (
      <AdminShell title="멤버 권한">
        <EmptyState icon="!" title="역할은 Admin만 바꿀 수 있어요" description="권한이 필요하면 Admin에게 요청해 주세요." />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="멤버 권한"
      sub="역할을 켜고 끄면 바로 적용돼요. 역할이 하나도 없으면 일반 멤버예요."
      right={
        <span className="wd-row" style={{ gap: 8 }}>
          <label className="wd-search" style={{ width: 240 }}>
            <i>⌕</i>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름 · 이메일 · 역할 검색" />
          </label>
          <button type="button" className="wd-btn line" onClick={() => setAdding(true)}>
            + 멤버 추가
          </button>
        </span>
      }
    >
      {error && (
        <div className="wd-banner danger" style={{ marginBottom: 18 }}>
          <span className="ico">!</span>
          <div>
            <b>{error.message}</b>
          </div>
          <button type="button" className="wd-btn sm" onClick={load}>
            다시 시도
          </button>
        </div>
      )}
      {!rows && !error && (
        <p className="wd-t11 wd-faint" aria-busy="true">
          멤버 목록을 불러오는 중이에요…
        </p>
      )}
      {rows && (
        <div className="wd-card" style={{ padding: "18px 22px 6px", overflowX: "auto" }}>
          <table className="wd-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>부서</th>
                {ROLE_OPTIONS.map(([role, desc]) => (
                  <th key={role} title={desc}>
                    {role}
                  </th>
                ))}
                <th className="num" />
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="wd-row" style={{ gap: 10 }}>
                      <Av name={m.name} size="sm" />
                      <span>
                        <b>{m.name}</b>
                        {m.id === me?.id && <span className="wd-badge" style={{ marginLeft: 6 }}>나</span>}
                        <span className="wd-t9 wd-faint" style={{ display: "block" }}>{m.email}</span>
                      </span>
                    </span>
                  </td>
                  <td>{m.dept || "-"}</td>
                  {ROLE_OPTIONS.map(([role]) => (
                    <td key={role}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={m.roles.includes(role)}
                        aria-label={`${m.name} ${role} 역할`}
                        disabled={busy === m.id}
                        className={`wd-toggle ${m.roles.includes(role) ? "on" : ""}`}
                        onClick={() => toggle(m, role)}
                      />
                    </td>
                  ))}
                  <td className="num">
                    {m.id !== me?.id && (
                      <button type="button" className="wd-btn ghost sm" disabled={busy === m.id} onClick={() => setRemoving(m)}>
                        삭제
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={3 + ROLE_OPTIONS.length} className="wd-faint">
                    {query ? "검색 결과가 없어요." : "아직 멤버가 없어요."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="wd-banner gray" style={{ marginTop: 14 }}>
        <span className="ico">i</span>
        <div>
          <b style={{ fontSize: 11 }}>역할별로 할 수 있는 일</b>
          <p>{ROLE_OPTIONS.map(([role, desc]) => `${role}: ${desc}`).join(" · ")}</p>
        </div>
      </div>
      {adding && (
        <Modal
          eyebrow="MEMBER"
          title="멤버 추가"
          sub="추가하면 이메일로 로그인 안내가 가요."
          onClose={() => busy !== "new" && setAdding(false)}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => setAdding(false)} disabled={busy === "new"}>
                취소
              </button>
              <button type="button" className="wd-btn" onClick={add} disabled={busy === "new"}>
                {busy === "new" ? "추가하는 중…" : "추가"}
              </button>
            </>
          }
        >
          <div className="wd-stack" style={{ gap: 12 }}>
            <input className="wd-input" placeholder="이름" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <input className="wd-input" type="email" placeholder="이메일" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            <select className="wd-input" value={draft.dept} onChange={(e) => setDraft({ ...draft, dept: e.target.value })}>
              <option value="">부서 선택 (선택)</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className="wd-chips">
              {ROLE_OPTIONS.map(([role]) => {
                const on = draft.roles.includes(role);
                return (
                  <button
                    type="button"
                    key={role}
                    className={`wd-chip ${on ? "on" : ""}`}
                    onClick={() => setDraft({ ...draft, roles: on ? draft.roles.filter((r) => r !== role) : [...draft.roles, role] })}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
      {removing && (
        <Modal
          eyebrow="MEMBER"
          title={`${removing.name}님을 삭제할까요?`}
          sub={removing.email}
          onClose={() => busy !== removing.id && setRemoving(null)}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => setRemoving(null)} disabled={busy === removing.id}>
                취소
              </button>
              <button type="button" className="wd-btn danger" onClick={() => remove(removing)} disabled={busy === removing.id}>
                {busy === removing.id ? "삭제하는 중…" : "삭제"}
              </button>
            </>
          }
        >
          <p className="wd-t11" style={{ margin: 0, lineHeight: 1.7 }}>
            삭제하면 더 이상 로그인할 수 없어요.
          </p>
        </Modal>
      )}
      {toast.node}
    </AdminShell>
  );
}
