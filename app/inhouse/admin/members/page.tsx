"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/inhouse/AdminShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { Av, useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import { fetchRoleMembers, ROLE_OPTIONS, setMemberRoles, type RoleMember } from "@/lib/admin-api";
import { isAdminRole, loadMe, useMe } from "@/lib/session";

// 멤버 권한: 목록 GET /people · 변경 PATCH /admin/users/{id}/roles (Admin 만)
export default function AdminMembers() {
  const toast = useToast();
  const { me } = useMe();
  const [rows, setRows] = useState<RoleMember[] | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [busy, setBusy] = useState("");
  const [query, setQuery] = useState("");

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
      toast.show(
        e instanceof ApiError && (e.status === 404 || e.status === 405)
          ? "서버에 아직 역할 변경 기능이 없어요"
          : e instanceof Error
            ? e.message
            : "역할을 바꾸지 못했어요.",
      );
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
        <label className="wd-search" style={{ width: 260 }}>
          <i>⌕</i>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름 · 이메일 · 역할 검색" />
        </label>
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
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={2 + ROLE_OPTIONS.length} className="wd-faint">
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
      {toast.node}
    </AdminShell>
  );
}
