// src/components/common/AppSpinner.tsx
import React from "react";
import "./AppSpinner.css";

interface SpinnerProps {
  fullScreen?: boolean;
  text?: string;
}

const AppSpinner: React.FC<SpinnerProps> = ({
  fullScreen = false,
  text = "Loading...",
}) => {
  return (
    <div className={`app-spinner-wrapper ${fullScreen ? "fullscreen" : ""}`}>
      <div className="app-spinner" />
      <div className="loading-text">{text}</div>
    </div>
  );
};

export default AppSpinner;
