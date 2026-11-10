"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/inhouse/AdminShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { Av, Modal, useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import { createMember, deleteMember, fetchRoleMembers, ROLE_OPTIONS, fetchDepartmentNames, setFinancePermission, setMemberActive, setMemberRoles, updateMember, type NewMember, type RoleMember } from "@/lib/admin-api";
import { isAdminRole, loadMe, useMe } from "@/lib/session";

// 404 는 "그런 사용자가 없다"일 수도 있어서 서버 메시지를 그대로 보여주고, 405 만 기능 없음으로 본다
const notYet = (e: unknown, what: string) =>
  e instanceof ApiError && e.status === 405
    ? `서버에 아직 ${what} 기능이 없어요`
    : e instanceof Error
      ? e.message
      : `${what}하지 못했어요.`;
const EMPTY: NewMember = { name: "", email: "", dept: "", roles: [] };

// 멤버 권한 (Admin 만): 목록 GET /people
// 역할은 하나만: Admin · Leader · Member 는 PATCH /admin/users/{id}/roles, FA 는 재정 권한 API(켜면 FA, 끄면 Member)
// 비활성화 PATCH /admin/users/{id} { active } · 추가 POST /admin/users · 삭제 DELETE /admin/users/{id}
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
  const [depts, setDepts] = useState<string[]>([]);
  const [created, setCreated] = useState<{ name: string; email: string; password: string } | null>(null);

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
    fetchDepartmentNames().then(setDepts);
  }, [load]);

  // 지금 값이 목록에 없어도(예전 부서) 선택지에 보이게
  const deptOptions = (current: string) => (current && !depts.includes(current) ? [current, ...depts] : depts);

  const changeDept = async (m: RoleMember, dept: string) => {
    if (busy || dept === m.dept) return;
    setBusy(m.id);
    try {
      await updateMember(m.id, { dept });
      setRows((rs) => rs?.map((x) => (x.id === m.id ? { ...x, dept } : x)) ?? null);
      toast.show(`${m.name}님 부서를 ${dept || "미지정"}(으)로 바꿨어요`);
    } catch (e) {
      toast.show(notYet(e, "부서 변경"));
    } finally {
      setBusy("");
    }
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((m) => !q || `${m.name} ${m.email} ${m.dept} ${m.roles.join(" ")}`.toLowerCase().includes(q));
  }, [rows, query]);
  const adminCount = (rows ?? []).filter((m) => m.roles.includes("Admin")).length;

  // 한 사람에 역할 하나: Admin > Leader > FA > 일반 멤버
  const roleOf = (m: RoleMember) => ROLE_OPTIONS.map(([r]) => r as string).find((r) => m.roles.some((x) => x.toUpperCase() === r.toUpperCase())) ?? "";

  const changeRole = async (m: RoleMember, role: string) => {
    const prev = roleOf(m);
    if (busy || role === prev) return;
    // 마지막 Admin 이 Admin 을 잃으면 아무도 관리 화면에 못 들어온다
    if (prev === "Admin" && adminCount <= 1) {
      toast.show("Admin이 최소 한 명은 있어야 해요");
      return;
    }
    if (prev === "Admin" && m.id === me?.id && !window.confirm("내 Admin 역할을 바꾸면 이 화면에 다시 들어올 수 없어요. 계속할까요?")) return;
    // 서버는 역할을 정확히 하나만 받는다. 일반 멤버는 "Member"
    const next = [role || "Member"];
    setBusy(m.id);
    try {
      const r =
        role === "FA"
          ? await setFinancePermission(m.id, true)
          : prev === "FA" && !role
            ? await setFinancePermission(m.id, false)
            : await setMemberRoles(m.id, next);
      const roles = Array.isArray(r?.roles) ? r.roles : next;
      setRows((rs) => rs?.map((x) => (x.id === m.id ? { ...x, roles } : x)) ?? null);
      if (m.id === me?.id) loadMe(true);
      toast.show(`${m.name}님 역할을 ${role || "일반 멤버"}(으)로 바꿨어요`);
    } catch (e) {
      toast.show(notYet(e, "역할 변경"));
    } finally {
      setBusy("");
    }
  };

  const setActive = async (m: RoleMember) => {
    if (busy) return;
    if (m.active && m.roles.includes("Admin") && adminCount <= 1) {
      toast.show("마지막 Admin은 비활성화할 수 없어요");
      return;
    }
    setBusy(m.id);
    try {
      await setMemberActive(m.id, !m.active);
      setRows((rs) => rs?.map((x) => (x.id === m.id ? { ...x, active: !m.active } : x)) ?? null);
      toast.show(m.active ? `${m.name}님 계정을 비활성화했어요` : `${m.name}님 계정을 다시 켰어요`);
    } catch (e) {
      toast.show(notYet(e, "비활성화"));
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
      const role = draft.roles[0] ?? "";
      // FA 는 역할 API 로 못 정해서 Member 로 만든 뒤 재정 권한을 켠다
      const r = await createMember({ ...draft, name: draft.name.trim(), email: draft.email.trim(), roles: [role && role !== "FA" ? role : "Member"] });
      if (role === "FA") await setFinancePermission(String(r.id), true);
      if (r.temporaryPassword) setCreated({ name: draft.name.trim(), email: draft.email.trim(), password: String(r.temporaryPassword) });
      else toast.show(`${draft.name.trim()}님을 추가했어요`);
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
      sub="역할을 고르면 바로 적용돼요. 계정을 끄면 로그인할 수 없어요."
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
                <th>역할</th>
                <th>계정</th>
                <th className="num" />
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => {
                // 조직도에만 있고 아직 가입 안 한 사람은 계정이 없어서 바꿀 수 있는 게 없다
                const joined = !!m.email;
                return (
                <tr key={m.id} style={m.active ? undefined : { opacity: 0.5 }}>
                  <td>
                    <span className="wd-row" style={{ gap: 10 }}>
                      <Av name={m.name} size="sm" />
                      <span>
                        <b>{m.name}</b>
                        {m.id === me?.id && <span className="wd-badge" style={{ marginLeft: 6 }}>나</span>}
                        <span className="wd-t9 wd-faint" style={{ display: "block" }}>{m.email || "아직 가입 전이에요"}</span>
                      </span>
                    </span>
                  </td>
                  <td>
                    <select
                      className="wd-input"
                      aria-label={`${m.name} 부서`}
                      value={m.dept}
                      disabled={!joined || busy === m.id}
                      onChange={(e) => changeDept(m, e.target.value)}
                      style={{ width: 160 }}
                    >
                      <option value="">부서 미지정</option>
                      {deptOptions(m.dept).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="wd-input"
                      aria-label={`${m.name} 역할`}
                      value={roleOf(m)}
                      disabled={!joined || busy === m.id}
                      onChange={(e) => changeRole(m, e.target.value)}
                      style={{ width: 140 }}
                    >
                      <option value="">일반 멤버</option>
                      {ROLE_OPTIONS.map(([role]) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {joined ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={m.active}
                      aria-label={`${m.name} 계정 활성`}
                      disabled={busy === m.id || m.id === me?.id}
                      className={`wd-toggle ${m.active ? "on" : ""}`}
                      onClick={() => setActive(m)}
                    />
                    ) : (
                      <span className="wd-badge">가입 전</span>
                    )}
                  </td>
                  <td className="num">
                    {joined && m.id !== me?.id && (
                      <button type="button" className="wd-btn ghost sm" disabled={busy === m.id} onClick={() => setRemoving(m)}>
                        삭제
                      </button>
                    )}
                  </td>
                </tr>
                );
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="wd-faint">
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
      {created && (
        <Modal
          eyebrow="MEMBER"
          title={`${created.name}님을 추가했어요`}
          sub={created.email}
          onClose={() => setCreated(null)}
          footer={
            <>
              <button
                type="button"
                className="wd-btn ghost"
                onClick={() => navigator.clipboard?.writeText(created.password).then(() => toast.show("임시 비밀번호를 복사했어요"), () => toast.show("복사하지 못했어요"))}
              >
                복사
              </button>
              <button type="button" className="wd-btn" onClick={() => setCreated(null)}>
                확인
              </button>
            </>
          }
        >
          <p className="wd-t11" style={{ margin: "0 0 10px", lineHeight: 1.7 }}>
            임시 비밀번호예요. 이 창을 닫으면 다시 볼 수 없으니 본인에게 전달해 주세요.
          </p>
          <code className="wd-input" style={{ display: "block", fontSize: 15, letterSpacing: 0.5, userSelect: "all" }}>
            {created.password}
          </code>
        </Modal>
      )}
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
              {depts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select className="wd-input" value={draft.roles[0] ?? ""} onChange={(e) => setDraft({ ...draft, roles: e.target.value ? [e.target.value] : [] })}>
              <option value="">역할: 일반 멤버</option>
              {ROLE_OPTIONS.map(([role, desc]) => (
                <option key={role} value={role}>
                  {role} · {desc}
                </option>
              ))}
            </select>
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
