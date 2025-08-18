// src/components/StatusCell.tsx
import React from "react";

type StatusCellProps = {
  processStatus?: string;
  progressPercentage?: number;
  successMessage?: string;
  errorMessage?: string;
  showProgress?: boolean; // 👈 control whether to show progress bar or not
};

const StatusCell: React.FC<StatusCellProps> = ({
  processStatus,
  progressPercentage = 0,
  successMessage,
  errorMessage,
  showProgress = false,
}) => {
  const getProgressColor = () => {
    if (processStatus === "success") return "bg-success";
    if (processStatus === "failed") return "bg-danger";
    if (processStatus === "pending") return "bg-warning";
    return "bg-secondary";
  };

  return (
    <>
      {/* Status Badge */}
      <td className="py-2 px-3 text-capitalize">
        {processStatus ? (
          <span
            className={`badge ${
              processStatus === "success"
                ? "bg-success"
                : processStatus === "pending"
                ? "bg-warning text-dark"
                : processStatus === "failed"
                ? "bg-danger"
                : "bg-secondary"
            }`}
          >
            {processStatus.replace(/_/g, " ")}
          </span>
        ) : (
          "—"
        )}
      </td>

      {/* Progress Bar + Inline Message (only if migration in progress / selected) */}
      <td className="py-2 px-3">
        {showProgress ? (
          <>
            <div
              className="progress"
              style={{ height: "8px", marginTop: "6px" }}
            >
              <div
                className={`progress-bar ${getProgressColor()}`}
                role="progressbar"
                style={{ width: `${progressPercentage}%` }}
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            <small
              className={
                errorMessage
                  ? "text-danger fw-bold"
                  : successMessage
                  ? "text-success fw-bold"
                  : "text-muted"
              }
            >
              {errorMessage
                ? errorMessage
                : successMessage
                ? successMessage
                : processStatus
                ? `${progressPercentage}%`
                : ""}
            </small>
          </>
        ) : (
          <small className="text-muted">—</small>
        )}
      </td>
    </>
  );
};

export default StatusCell;
