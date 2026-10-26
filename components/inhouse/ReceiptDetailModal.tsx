
"use client";

import { CONTRACTS, CONTRACT_STEPS, type ReceiptRow } from "@/lib/demo";
import { won, type Receipt } from "@/lib/inhouse";
import ModalPortal from "@/components/inhouse/ModalPortal";
import { Modal } from "@/components/inhouse/ui";

type Props =
  | {
      type: "receipt";
      item: Receipt;
      onClose: () => void;
    }
  | {
      type: "contract";
      item: ReceiptRow;
      onClose: () => void;
    };

export default function ReceiptDetailModal(props: Props) {
  if (props.type === "receipt") {
    const { item, onClose } = props;

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
                <small>입금일 · {item.date}</small>
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
                  <dd>운영 40% · 적립 30% · 배당 30%</dd>
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

  const { item, onClose } = props;
  const contract = CONTRACTS[item.project];

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
                    width: `${(contract.collected / contract.total) * 100}%`,
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
                  <small>{contract.stepDates[i]}</small>
                </div>
              ))}
            </div>
          </div>

          <dl className="wd-kv" style={{ marginBottom: 20 }}>
            <div>
              <dt>담당 PM</dt>
              <dd>{contract.pm}</dd>
            </div>
            <div>
              <dt>참여 인원</dt>
              <dd>{contract.staff}</dd>
            </div>
            <div>
              <dt>배분 기준</dt>
              <dd>{contract.split}</dd>
            </div>
            <div>
              <dt>다음 청구</dt>
              <dd>{contract.next}</dd>
            </div>
          </dl>

          <div className="wd-file">
            <span className="ext">PDF</span>
            <div>
              <b>{contract.file}</b>
              <small>계약서 · {contract.signed} 업로드</small>
            </div>
            <span className="end">↓</span>
          </div>
        </>
      ) : (
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
      )}
    </Modal>
  );
}
