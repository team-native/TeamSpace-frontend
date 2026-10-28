"use client";

import { useState } from "react";
import AdminShell from "@/components/inhouse/AdminShell";
import { Av, Modal, useToast } from "@/components/inhouse/ui";
import { FINANCE_ROLES, type FinanceRole } from "@/lib/admin";
import { ME, PEOPLE, person } from "@/lib/demo";

export default function AdminFinanceRoles() {
  const toast = useToast();
  const [rows, setRows] = useState<FinanceRole[]>(FINANCE_ROLES);
  const [adding, setAdding] = useState(false);
  const [pick, setPick] = useState("");

  const set = (id: string, key: "view" | "edit", value: boolean) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value, changed: `방금 · ${ME.name}` } : r)));
    toast.show(`${person(id)?.name}님에게 권한 변경 알림을 보냈어요`);
  };
  const candidates = PEOPLE.filter((p) => !rows.some((r) => r.id === p.id));

  return (
    <AdminShell
      title="재정 정보 권한"
      sub="권한이 없으면 금액 대신 '권한 필요'로 보여요."
      right={
        <button type="button" className="wd-btn line" onClick={() => setAdding(true)} disabled={candidates.length === 0}>
          + 권한 추가
        </button>
      }
    >
      <div className="wd-card" style={{ padding: "18px 22px 6px", overflowX: "auto" }}>
        <table className="wd-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>부서</th>
              <th>전체 금액 열람</th>
              <th>수주 · 입금 등록</th>
              <th className="num">변경</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const p = person(r.id)!;
              const locked = p.dept === "Leader";
              return (
                <tr key={r.id}>
                  <td>
                    <span className="wd-row" style={{ gap: 10 }}>
                      <Av name={p.name} tone={p.tone} size="sm" />
                      <b>{p.name}</b>
                    </span>
                  </td>
                  <td>{p.dept}</td>
                  <td>
                    <button type="button" role="switch" aria-checked={r.view} aria-label={`${p.name} 전체 금액 열람`} disabled={locked} className={`wd-toggle ${r.view ? "on" : ""}`} onClick={() => set(r.id, "view", !r.view)} />
                  </td>
                  <td>
                    <button type="button" role="switch" aria-checked={r.edit} aria-label={`${p.name} 수주 · 입금 등록`} disabled={locked} className={`wd-toggle ${r.edit ? "on" : ""}`} onClick={() => set(r.id, "edit", !r.edit)} />
                  </td>
                  <td className="num">
                    <span className="wd-faint wd-t9">{locked ? "항상 켜짐" : r.changed ?? "—"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="wd-banner gray" style={{ marginTop: 14 }}>
        <span className="ico">i</span>
        <div>
          <b style={{ fontSize: 11 }}>권한을 바꾸면 본인에게 알림이 가요</b>
          <p>Leader 권한은 항상 켜져 있고 끌 수 없어요.</p>
        </div>
      </div>

      {adding && (
        <Modal
          eyebrow="FINANCE ROLE"
          title="권한 추가"
          sub="추가하면 전체 금액 열람이 켜진 상태로 목록에 들어가요."
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
                disabled={!pick}
                onClick={() => {
                  setRows((rs) => [...rs, { id: pick, view: true, edit: false, changed: `방금 · ${ME.name}` }]);
                  toast.show(`${person(pick)?.name}님에게 권한을 줬어요`);
                  setPick("");
                  setAdding(false);
                }}
              >
                추가
              </button>
            </>
          }
        >
          <label className="wd-field" style={{ marginBottom: 0 }}>
            <span>팀원</span>
            <select className="wd-input" value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">선택해 주세요</option>
              {candidates.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.dept}
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
