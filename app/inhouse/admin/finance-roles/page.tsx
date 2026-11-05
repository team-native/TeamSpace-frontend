"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/inhouse/AdminShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { Av, Modal, useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import { fetchFinancePermissions, setFinancePermission, type FinanceMember } from "@/lib/admin-api";
import { loadMe, useMe } from "@/lib/session";

// Admin · Leader 는 역할만으로 항상 열람 가능해서 끌 수 없다
const locked = (m: FinanceMember) => m.roles.includes("Admin") || m.roles.includes("Leader");

export default function AdminFinanceRoles() {
  const toast = useToast();
  const { me } = useMe();
  const [rows, setRows] = useState<FinanceMember[] | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [busy, setBusy] = useState("");
  const [adding, setAdding] = useState(false);
  const [pick, setPick] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      setRows(await fetchFinancePermissions());
    } catch (e) {
      setError({ status: e instanceof ApiError ? e.status : 0, message: e instanceof Error ? e.message : "권한 목록을 불러오지 못했어요." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const granted = useMemo(() => (rows ?? []).filter((m) => m.canView), [rows]);
  const candidates = useMemo(
    () => (rows ?? []).filter((m) => !m.canView && `${m.name} ${m.email}`.toLowerCase().includes(query.trim().toLowerCase())),
    [rows, query],
  );

  const change = async (m: FinanceMember, on: boolean) => {
    if (busy) return;
    setBusy(m.id);
    try {
      const r = await setFinancePermission(m.id, on);
      setRows((rs) => rs?.map((x) => (x.id === m.id ? { ...x, roles: r.roles, canView: r.canViewFinance } : x)) ?? null);
      if (m.id === me?.id) loadMe(true);
      toast.show(on ? `${m.name}님에게 재정 권한을 줬어요` : `${m.name}님의 재정 권한을 뺐어요`);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "권한을 바꾸지 못했어요.");
    } finally {
      setBusy("");
    }
  };

  if (error?.status === 403) {
    return (
      <AdminShell title="재정 정보 권한">
        <EmptyState icon="!" title="재정 권한은 Admin만 관리할 수 있어요" description="Leader · FA 역할은 이 화면을 볼 수 없어요." />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="재정 정보 권한"
      sub="권한이 없으면 재무 화면에서 요약만 보이고 수금 내역은 열 수 없어요."
      right={
        <button type="button" className="wd-btn line" onClick={() => setAdding(true)} disabled={!rows || rows.every((m) => m.canView)}>
          + 권한 추가
        </button>
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
          권한 목록을 불러오는 중이에요…
        </p>
      )}
      {rows && (
        <div className="wd-card" style={{ padding: "18px 22px 6px", overflowX: "auto" }}>
          <table className="wd-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>역할</th>
                <th>재정 열람 · 수금 등록</th>
                <th className="num">비고</th>
              </tr>
            </thead>
            <tbody>
              {granted.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="wd-row" style={{ gap: 10 }}>
                      <Av name={m.name} size="sm" />
                      <span>
                        <b>{m.name}</b>
                        <span className="wd-t9 wd-faint" style={{ display: "block" }}>{m.email}</span>
                      </span>
                    </span>
                  </td>
                  <td>{m.roles.join(" · ") || "Member"}</td>
                  <td>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={m.canView}
                      aria-label={`${m.name} 재정 권한`}
                      disabled={locked(m) || busy === m.id}
                      className={`wd-toggle ${m.canView ? "on" : ""}`}
                      onClick={() => change(m, !m.canView)}
                    />
                  </td>
                  <td className="num">
                    <span className="wd-faint wd-t9">{locked(m) ? "역할로 항상 켜짐" : "FA"}</span>
                  </td>
                </tr>
              ))}
              {granted.length === 0 && (
                <tr>
                  <td colSpan={4} className="wd-faint">
                    아직 재정 권한이 있는 사람이 없어요.
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
          <b style={{ fontSize: 11 }}>권한을 주면 FA 역할이 붙어요</b>
          <p>Admin · Leader는 역할만으로 항상 열람할 수 있어서 끌 수 없어요.</p>
        </div>
      </div>

      {adding && rows && (
        <Modal
          eyebrow="FINANCE ROLE"
          title="권한 추가"
          sub="추가하면 FA 역할이 붙고 재무 상세와 수금 등록이 열려요."
          size="sm"
          onClose={() => setAdding(false)}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => setAdding(false)}>
                취소
              </button>
              <button
                type="button"
                className="wd-btn"
                disabled={!pick || !!busy}
                onClick={async () => {
                  const m = rows.find((x) => x.id === pick);
                  if (!m) return;
                  await change(m, true);
                  setPick("");
                  setQuery("");
                  setAdding(false);
                }}
              >
                추가
              </button>
            </>
          }
        >
          <label className="wd-field">
            <span>찾기</span>
            <input className="wd-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름 또는 이메일" />
          </label>
          <label className="wd-field" style={{ marginBottom: 0 }}>
            <span>팀원</span>
            <select className="wd-input" value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">선택해 주세요 ({candidates.length}명)</option>
              {candidates.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.email}
                </option>
              ))}
            </select>
          </label>
        </Modal>
      )}
      {toast.node}
    </AdminShell>
  );
}
