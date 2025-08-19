import React from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import type { MigrationStatus } from "../types";

interface StatusAndProgressProps extends MigrationStatus {
  showProgress?: boolean;
}

const StatusAndProgress: React.FC<StatusAndProgressProps> = ({
  process_status: status,
  progress_percentage: percentage,
  showProgress = true,
}) => {
  const getBadgeClass = (status?: string) => {
    switch (status) {
      case "success":
        return "bg-success";
      case "pending | processing":
        return "bg-warning text-dark";
      case "failed":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const formatStatus = (status?: string) =>
    status ? status.replace(/_/g, " ") : "—";

  const getProgressVariant = (
    status?: string
  ): "success" | "danger" | "info" => {
    if (status === "success") return "success";
    if (status === "failed") return "danger";
    return "info";
  };

  // ✅ If no status & percentage, show just empty table cells
  if (!status && percentage === undefined) {
    return (
      <>
        <td className="py-2 px-3">—</td>
        {showProgress && <td className="py-2 px-3">—</td>}
      </>
    );
  }

  return (
    <>
      {/* Status Badge */}
      <td className="py-2 px-3 text-capitalize">
        <span className={`badge ${getBadgeClass(status)}`}>
          {formatStatus(status)}
        </span>
      </td>

      {/* Progress Bar */}
      {showProgress && (
        <td className="py-2 px-3">
          <div style={{ marginTop: "6px" }}>
            {percentage !== undefined ? (
              <ProgressBar
                now={percentage}
                label={`${percentage.toFixed(2)}%`}
                variant={getProgressVariant(status)}
                animated={status !== "success" && status !== "failed"}
              />
            ) : (
              "—"
            )}
          </div>
        </td>
      )}
    </>
  );
};

export default StatusAndProgress;
