import React from "react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="text-center p-5">
      <i
        className="bi bi-exclamation-triangle text-danger"
        style={{ fontSize: "2.5rem" }}
      ></i>

      <h5 className="mt-3">Oops! Something went wrong</h5>

      {message && <p className="text-muted">{message}</p>}

      {onRetry && (
        <button className="btn btn-outline-primary mt-2" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
