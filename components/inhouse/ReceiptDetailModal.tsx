
"use client";

import { useEffect, useState } from "react";
import { CONTRACT_STEPS, fetchContract, type Contract, type ReceiptRow } from "@/lib/finance";
import { won, type Pool, type Receipt } from "@/lib/inhouse";
import ModalPortal from "@/components/inhouse/ModalPortal";
import Attachments from "@/components/inhouse/Attachments";
import { Modal } from "@/components/inhouse/ui";

type Props =
  | {
      type: "receipt";
      item: Receipt;
      pools?: Pool[];
      onClose: () => void;
    }
  | {
      type: "contract";
      item: ReceiptRow;
      onClose: () => void;
    };

export default function ReceiptDetailModal(props: Props) {
  return props.type === "receipt" ? <ReceiptModal {...props} /> : <ContractModal {...props} />;
}

function ReceiptModal(props: Extract<Props, { type: "receipt" }>) {
    const { item, onClose, pools = [] } = props;
    const split = pools
      .filter((p) => p.ratio > 0)
      .map((p) => `${(p.label || p.id).replace(/풀$/, "")} ${p.ratio}%`)
      .join(" · ");

    return (
      <ModalPortal>
        <div
          className="pf-modal-bg"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <section
            className="pf-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${item.client} 수금 상세`}
          >
            <header>
              <div>
                <span>RECEIPT DETAIL</span>
                <h2>{item.client} 수금 내역</h2>
              </div>
              <button onClick={onClose} aria-label="닫기">
                ×
              </button>
            </header>

            <div className="pf-detail-body">
              <div className="pf-detail-amount">
                <span>{item.status}</span>
                <strong>{won.format(item.amount)}원</strong>
                <small>{item.status === "입금 완료" ? "입금일" : "일자"} · {item.date || "-"}</small>
              </div>

              <dl>
                <div>
                  <dt>거래처</dt>
                  <dd>{item.client}</dd>
                </div>
                <div>
                  <dt>프로젝트</dt>
                  <dd>{item.project}</dd>
                </div>
                <div>
                  <dt>수금 상태</dt>
                  <dd>{item.status}</dd>
                </div>
                <div>
                  <dt>풀 배분</dt>
                  <dd>{split || "설정 전"}</dd>
                </div>
              </dl>

              <button className="pf-detail-close" onClick={onClose}>
                확인
              </button>
            </div>
          </section>
        </div>
      </ModalPortal>
    );

}

function ContractModal(props: Extract<Props, { type: "contract" }>) {
  const { item, onClose } = props;
  const [contract, setContract] = useState<Contract | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setContract(undefined);
    setError("");
    fetchContract(item.project)
      .then((c) => alive && setContract(c))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "계약 정보를 불러오지 못했어요."));
    return () => {
      alive = false;
    };
  }, [item.project]);

  return (
    <Modal
      eyebrow="CONTRACT"
      title={item.project}
      sub={`${item.client}${contract ? ` · 계약 ${contract.signed}` : ""}`}
      size="lg"
      onClose={onClose}
      footer={
        <button type="button" className="wd-btn" onClick={onClose}>
          닫기
        </button>
      }
    >
      {contract === undefined && !error && (
        <p className="wd-t11 wd-faint" aria-busy="true">
          계약 정보를 불러오는 중이에요…
        </p>
      )}
      {error && (
        <div className="wd-banner danger" style={{ marginBottom: 16 }}>
          <span className="ico">!</span>
          <div>
            <b>{error}</b>
          </div>
        </div>
      )}
      {contract ? (
        <>
          <div
            className="wd-between"
            style={{ marginBottom: 20, flexWrap: "wrap" }}
          >
            <div className="wd-stat">
              <small>총 계약 금액</small>
              <strong>{won.format(contract.total)}원</strong>
            </div>

            <div style={{ textAlign: "right" }}>
              <span className="wd-t9 wd-faint">
                수금 {won.format(contract.collected)}원 /{" "}
                {won.format(contract.total)}원
              </span>
              <div className="wd-bar" style={{ width: 220, marginTop: 8 }}>
                <i
                  style={{
                    width: `${contract.total ? Math.min(100, (contract.collected / contract.total) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className="wd-card soft"
            style={{ padding: "18px 10px", marginBottom: 20 }}
          >
            <div className="wd-line">
              {CONTRACT_STEPS.map((step, i) => (
                <div
                  key={step}
                  className={
                    i < contract.step
                      ? "done"
                      : i === contract.step
                        ? "now"
                        : ""
                  }
                >
                  <span className="wd-av">
                    {i < contract.step ? "✓" : i + 1}
                  </span>
                  <b>{step}</b>
                  <small>{contract.stepDates[i] ?? ""}</small>
                </div>
              ))}
            </div>
          </div>

          <dl className="wd-kv" style={{ marginBottom: 20 }}>
            <div>
              <dt>담당 PM</dt>
              <dd>{contract.pm || "-"}</dd>
            </div>
            <div>
              <dt>참여 인원</dt>
              <dd>{contract.staff || "-"}</dd>
            </div>
            <div>
              <dt>배분 기준</dt>
              <dd>{contract.split || "-"}</dd>
            </div>
            <div>
              <dt>다음 청구</dt>
              <dd>{contract.next || "-"}</dd>
            </div>
          </dl>

          {contract.file ? (
            <Attachments files={[contract.file]} title="계약서" />
          ) : (
            contract.fileName && (
              <div className="wd-file">
                <span className="ext">PDF</span>
                <div>
                  <b>{contract.fileName}</b>
                  <small>계약서{contract.signed ? ` · ${contract.signed}` : ""}</small>
                </div>
              </div>
            )
          )}
        </>
      ) : contract === null ? (
        <dl className="wd-kv">
          <div>
            <dt>금액</dt>
            <dd>{won.format(item.amount)}원</dd>
          </div>
          <div>
            <dt>상태</dt>
            <dd>{item.status}</dd>
          </div>
          <div>
            <dt>일자</dt>
            <dd>{item.date}</dd>
          </div>
          <div>
            <dt>계약 정보</dt>
            <dd>아직 등록되지 않았어요</dd>
          </div>
        </dl>
      ) : null}
    </Modal>
  );
}
