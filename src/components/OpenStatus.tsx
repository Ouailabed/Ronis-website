import type { OpenStatus as Status } from "../lib/hours";

export default function OpenStatus({ status, fallback }: { status: Status | null; fallback?: string }) {
  if (!status) return fallback ? <span className="status">{fallback}</span> : null;
  const cls = status.open ? (status.closingSoon ? "status is-soon" : "status is-open") : "status";
  return (
    <span className={cls}>
      <i aria-hidden="true" />
      {status.closingSoon ? status.label.replace("Open now", "Closing soon") : status.label}
    </span>
  );
}
