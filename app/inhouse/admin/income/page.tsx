"use client";

import { useState } from "react";
import AdminShell from "@/components/inhouse/AdminShell";
import { Modal, useToast } from "@/components/inhouse/ui";
import { ORDERS, ORDER_TONE, POOL_SPLIT, type Order } from "@/lib/admin";
import { PEOPLE } from "@/lib/demo";

const won = (n: number) => n.toLocaleString("ko-KR");
const digits = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;
const today = () => new Date().toISOString().slice(0, 10);

export default function AdminIncome() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [modal, setModal] = useState<"" | "income" | "order">("");
  const [income, setIncome] = useState({ orderId: "", date: today(), amount: "" });
  const [order, setOrder] = useState({ project: "", client: "", pm: "", total: "" });

  const open = orders.filter((o) => o.collected < o.total);
  const amount = digits(income.amount);
  const target = orders.find((o) => o.id === income.orderId);
  const over = target ? amount > target.total - target.collected : false;
  const close = () => setModal("");

  return (
    <AdminShell
      title="수주 · 입금"
      sub="입금을 등록하면 배분 기준(운영 60 · 적립 25 · 배당 15)대로 풀에 나눠 들어가요."
      right={
        <div className="wd-row">
          <button type="button" className="wd-btn line" onClick={() => setModal("order")}>
            + 수주 등록
          </button>
          <button type="button" className="wd-btn" onClick={() => setModal("income")}>
            입금 등록
          </button>
        </div>
      }
    >
      <div className="wd-card" style={{ padding: "18px 22px 6px", overflowX: "auto" }}>
        <table className="wd-table">
          <thead>
            <tr>
              <th>수주 건</th>
              <th>고객사</th>
              <th>담당 PM</th>
              <th>상태</th>
              <th className="num">계약 / 수금</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <b>{o.project}</b>
                </td>
                <td>{o.client}</td>
                <td>{o.pm}</td>
                <td>
                  <span className={`wd-badge ${ORDER_TONE[o.status]}`}>{o.status}</span>
                </td>
                <td className="num">
                  {won(o.total)} / {won(o.collected)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === "income" && (
        <Modal
          eyebrow="INCOME"
          title="입금 등록"
          sub="통장에 들어온 금액을 적으면 풀 배분이 자동으로 계산돼요."
          onClose={close}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={close}>
                취소
              </button>
              <button type="submit" form="income-form" className="wd-btn" disabled={!target || !amount || over}>
                등록하고 알림 보내기
              </button>
            </>
          }
        >
          <form
            id="income-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!target || !amount || over) return;
              setOrders((os) =>
                os.map((o) => {
                  if (o.id !== target.id) return o;
                  const collected = o.collected + amount;
                  return { ...o, collected, status: collected >= o.total ? "수금 완료" : o.status };
                }),
              );
              toast.show(`${won(amount)}원 입금을 반영하고 재정 알림을 보냈어요`);
              setIncome({ orderId: "", date: today(), amount: "" });
              close();
            }}
          >
            <label className="wd-field">
              <span>수주 건</span>
              <select className="wd-input" required value={income.orderId} onChange={(e) => setIncome({ ...income, orderId: e.target.value })}>
                <option value="">선택해 주세요</option>
                {open.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.project} · {o.client} (남은 {won(o.total - o.collected)}원)
                  </option>
                ))}
              </select>
            </label>
            <div className="wd-grid g2">
              <label className="wd-field">
                <span>입금일</span>
                <input className="wd-input" type="date" required value={income.date} onChange={(e) => setIncome({ ...income, date: e.target.value })} />
              </label>
              <label className="wd-field">
                <span>
                  금액 {over && <em style={{ color: "#f04452" }}>남은 금액보다 커요</em>}
                </span>
                <input className="wd-input" inputMode="numeric" required value={amount ? won(amount) : ""} onChange={(e) => setIncome({ ...income, amount: e.target.value })} placeholder="0" />
              </label>
            </div>
            <div className="wd-grid g3">
              {POOL_SPLIT.map(([name, rate, tone]) => (
                <div key={name} className="wd-card soft" style={{ padding: 14 }}>
                  <span className="wd-t9 wd-faint" style={{ display: "block" }}>
                    {name} · {Math.round(rate * 100)}%
                  </span>
                  <b className={`wd-badge ${tone}`} style={{ display: "inline-flex", marginTop: 6 }}>
                    {won(Math.round(amount * rate))}원
                  </b>
                </div>
              ))}
            </div>
          </form>
        </Modal>
      )}

      {modal === "order" && (
        <Modal
          eyebrow="ORDER"
          title="수주 등록"
          onClose={close}
          footer={
            <>
              <button type="button" className="wd-btn ghost" onClick={close}>
                취소
              </button>
              <button type="submit" form="order-form" className="wd-btn">
                등록
              </button>
            </>
          }
        >
          <form
            id="order-form"
            onSubmit={(e) => {
              e.preventDefault();
              setOrders((os) => [{ id: `o-${Date.now()}`, project: order.project, client: order.client, pm: order.pm, status: "제작", total: digits(order.total), collected: 0 }, ...os]);
              toast.show("수주를 등록했어요");
              setOrder({ project: "", client: "", pm: "", total: "" });
              close();
            }}
          >
            <label className="wd-field">
              <span>수주 건</span>
              <input className="wd-input" required value={order.project} onChange={(e) => setOrder({ ...order, project: e.target.value })} placeholder="예: 브랜드 사이트 리뉴얼" />
            </label>
            <div className="wd-grid g2">
              <label className="wd-field">
                <span>고객사</span>
                <input className="wd-input" required value={order.client} onChange={(e) => setOrder({ ...order, client: e.target.value })} />
              </label>
              <label className="wd-field">
                <span>담당 PM</span>
                <select className="wd-input" required value={order.pm} onChange={(e) => setOrder({ ...order, pm: e.target.value })}>
                  <option value="">선택해 주세요</option>
                  {PEOPLE.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} · {p.dept}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="wd-field" style={{ marginBottom: 0 }}>
              <span>계약 금액</span>
              <input className="wd-input" inputMode="numeric" required value={digits(order.total) ? won(digits(order.total)) : ""} onChange={(e) => setOrder({ ...order, total: e.target.value })} placeholder="0" />
            </label>
          </form>
        </Modal>
      )}
      {toast.node}
    </AdminShell>
  );
}
