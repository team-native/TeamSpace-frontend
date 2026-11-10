"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell, { refreshAdminCounts } from "@/components/inhouse/AdminShell";
import EmptyState from "@/components/inhouse/EmptyState";
import { Av, Modal, useToast } from "@/components/inhouse/ui";
import { ApiError } from "@/lib/api";
import { approveSignupRequest, fetchRoleMembers, fetchSignupRequests, markSignupsSeen, rejectSignupRequest, type RoleMember, type SignupRequest } from "@/lib/admin-api";
import { relTime } from "@/lib/board";

const TABS = [
  ["PENDING", "대기"],
  ["APPROVED", "승인됨"],
  ["REJECTED", "반려"],
  ["ALL", "전체"],
] as const;
type Tab = (typeof TABS)[number][0];
const STATUS_LABEL: Record<string, string> = { PENDING: "대기", APPROVED: "승인됨", REJECTED: "반려" };

// 가입 요청: GET /admin/signup-requests · 승인 POST /admin/signup-requests/{id}/approve { memberId? }
export default function AdminSignups() {
  const toast = useToast();
  const [rows, setRows] = useState<SignupRequest[] | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [tab, setTab] = useState<Tab>("PENDING");
  const [confirm, setConfirm] = useState<SignupRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState<SignupRequest | null>(null);
  const [reason, setReason] = useState("");
  // 조직도에는 있지만 아직 계정이 없는 사람
  const [unjoined, setUnjoined] = useState<RoleMember[]>([]);
  const [linkTo, setLinkTo] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await fetchSignupRequests();
      setRows(list);
      // 한 번 봤으면 메뉴의 숫자는 지운다
      markSignupsSeen(list);
      refreshAdminCounts();
    } catch (e) {
      setError({ status: e instanceof ApiError ? e.status : 0, message: e instanceof Error ? e.message : "가입 요청을 불러오지 못했어요." });
    }
  }, []);

  useEffect(() => {
    load();
    fetchRoleMembers()
      .then((ms) => setUnjoined(ms.filter((m) => m.memberId && !m.account)))
      .catch(() => setUnjoined([]));
  }, [load]);

  // 승인 창을 열 때 이름이 딱 한 명과 같으면 그 사람을 미리 골라 둔다
  const openApprove = (r: SignupRequest) => {
    const same = unjoined.filter((m) => m.name === r.name.trim());
    setLinkTo(same.length === 1 ? same[0].id : "");
    setConfirm(r);
  };

  const count = (t: Tab) => (rows ?? []).filter((r) => t === "ALL" || r.status === t).length;
  const shown = useMemo(
    () => (rows ?? []).filter((r) => tab === "ALL" || r.status === tab).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [rows, tab],
  );

  const approve = async (r: SignupRequest) => {
    setBusy(true);
    try {
      await approveSignupRequest(r.id, linkTo || undefined);
      if (linkTo) setUnjoined((ms) => ms.filter((m) => m.id !== linkTo));
      setRows((rs) => rs?.map((x) => (x.id === r.id ? { ...x, status: "APPROVED" } : x)) ?? null);
      refreshAdminCounts();
      toast.show(`${r.name || r.email}님 가입을 승인했어요`);
      setConfirm(null);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "승인하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  const reject = async (r: SignupRequest) => {
    setBusy(true);
    try {
      await rejectSignupRequest(r.id, reason.trim());
      setRows((rs) => rs?.map((x) => (x.id === r.id ? { ...x, status: "REJECTED" } : x)) ?? null);
      refreshAdminCounts();
      toast.show(`${r.name || r.email}님 가입 요청을 반려했어요`);
      setRejecting(null);
      setReason("");
    } catch (e) {
      toast.show(
        e instanceof ApiError && (e.status === 404 || e.status === 405)
          ? "서버에 아직 반려 기능이 없어요"
          : e instanceof Error
            ? e.message
            : "반려하지 못했어요.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (error?.status === 403) {
    return (
      <AdminShell title="가입 요청">
        <EmptyState icon="!" title="가입 승인은 관리자만 할 수 있어요" description="권한이 필요하면 Admin에게 요청해 주세요." />
      </AdminShell>
    );
  }

  return (
    <AdminShell title="가입 요청" sub="로그인 화면에서 들어온 가입 요청이에요. 승인하면 바로 로그인할 수 있어요.">
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
          가입 요청을 불러오는 중이에요…
        </p>
      )}
      {rows && (
        <>
          <div className="wd-tabs" style={{ marginBottom: 14 }}>
            {TABS.map(([k, label]) => (
              <button type="button" key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
                {label}
                <small>{count(k)}</small>
              </button>
            ))}
          </div>
          {shown.length === 0 ? (
            <EmptyState icon="✓" title={tab === "PENDING" ? "기다리는 가입 요청이 없어요" : "가입 요청이 없어요"} description="새 요청이 오면 여기에 보여요." />
          ) : (
            <div className="wd-card" style={{ padding: "18px 22px 6px", overflowX: "auto" }}>
              <table className="wd-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>부서 · 전공</th>
                    <th>기수</th>
                    <th>요청</th>
                    <th className="num">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span className="wd-row" style={{ gap: 10 }}>
                          <Av name={r.name || r.email} size="sm" />
                          <span>
                            <b>{r.name || "이름 없음"}</b>
                            <span className="wd-t9 wd-faint" style={{ display: "block" }}>{r.email}</span>
                            {r.message && <span className="wd-t9" style={{ display: "block", marginTop: 4 }}>“{r.message}”</span>}
                          </span>
                        </span>
                      </td>
                      <td>{[r.dept, r.major].filter(Boolean).join(" · ") || "-"}</td>
                      <td>{r.cohort || "-"}</td>
                      <td className="wd-t10 wd-faint">{relTime(r.createdAt) || "-"}</td>
                      <td className="num">
                        {r.status === "PENDING" ? (
                          <span className="wd-row" style={{ gap: 6, justifyContent: "flex-end" }}>
                            <button type="button" className="wd-btn ghost sm" onClick={() => setRejecting(r)}>
                              반려
                            </button>
                            <button type="button" className="wd-btn sm" onClick={() => openApprove(r)}>
                              승인
                            </button>
                          </span>
                        ) : (
                          <span className={`wd-badge ${r.status === "APPROVED" ? "green" : r.status === "REJECTED" ? "red" : ""}`}>{STATUS_LABEL[r.status] ?? r.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {confirm && (
        <Modal
          eyebrow="SIGNUP"
          title={`${confirm.name || confirm.email}님 가입을 승인할까요?`}
          sub={confirm.email}
          onClose={() => !busy && setConfirm(null)}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => setConfirm(null)} disabled={busy}>
                취소
              </button>
              <button type="button" className="wd-btn" onClick={() => approve(confirm)} disabled={busy}>
                {busy ? "승인하는 중…" : "승인"}
              </button>
            </>
          }
        >
          <label className="wd-t10 wd-faint" htmlFor="link-member" style={{ display: "block", marginBottom: 8 }}>
            조직도의 누구인가요?
          </label>
          <select id="link-member" className="wd-input" value={linkTo} onChange={(e) => setLinkTo(e.target.value)} style={{ width: "100%" }}>
            <option value="">조직도에 없음 · 새 멤버로 추가</option>
            {unjoined.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.dept ? ` · ${m.dept}` : ""}
              </option>
            ))}
          </select>
          <p className="wd-t11" style={{ margin: "12px 0 0", lineHeight: 1.7 }}>
            {linkTo
              ? "승인하면 조직도의 이 멤버 계정에 이메일이 연결되고, 바로 로그인할 수 있어요."
              : `승인하면 이 이메일로 로그인할 수 있고, 팀원 목록에 ${confirm.dept ? `${confirm.dept} 소속으로 ` : ""}새로 추가돼요.`}
          </p>
        </Modal>
      )}
      {rejecting && (
        <Modal
          eyebrow="SIGNUP"
          title={`${rejecting.name || rejecting.email}님 가입 요청을 반려할까요?`}
          sub={rejecting.email}
          onClose={() => !busy && setRejecting(null)}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={() => setRejecting(null)} disabled={busy}>
                취소
              </button>
              <button type="button" className="wd-btn danger" onClick={() => reject(rejecting)} disabled={busy || !reason.trim()}>
                {busy ? "반려하는 중…" : "반려"}
              </button>
            </>
          }
        >
          <label className="wd-t10 wd-faint" htmlFor="reject-reason" style={{ display: "block", marginBottom: 8 }}>
            반려 사유
          </label>
          <textarea
            id="reject-reason"
            className="wd-input"
            rows={3}
            maxLength={300}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="예: 기수 확인이 필요해요"
            style={{ width: "100%", resize: "vertical" }}
          />
        </Modal>
      )}
      {toast.node}
    </AdminShell>
  );
}
