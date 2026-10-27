"use client";

import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
  <div className="wd-card wd-empty" role="status">
  <span className="ill" aria-hidden="true">
  <span className="wd-empty-icon">{icon}</span>
  </span>
    <b>{title}</b>
    <p>{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          className="wd-btn line sm"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}