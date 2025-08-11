// src/components/common/StatusProgressBar.tsx

import React from "react";
import ProgressBar from "react-bootstrap/ProgressBar";

interface Props {
  percentage?: number;
  status?: string;
}

const StatusProgressBar: React.FC<Props> = ({ percentage, status }) => {
  if (percentage === undefined) return <>—</>;

  let variant: "success" | "danger" | "info" = "info";

  if (status === "success") variant = "success";
  else if (status === "failed") variant = "danger";

  return (
    <ProgressBar
      now={percentage}
      label={`${percentage.toFixed(2)}%`}
      variant={variant}
      animated={status !== "success" && status !== "failed"}
    />
  );
};

export default StatusProgressBar;
