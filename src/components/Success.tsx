// src/pages/Success.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import StepHeader from "../components/StepHeader";

interface SuccessProps {
  email?: string;
}

const Success: React.FC<SuccessProps> = ({ email = "your email" }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/app/");
  };

  return (
    <div className="d-flex flex-column vh-100">
      {/* Shared Step Header */}
      <StepHeader currentStep={3} />

      {/* Page Content */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center bg-light">
        <div
          className="card shadow p-4 text-center"
          style={{ borderRadius: "12px", maxWidth: "500px", width: "100%" }}
        >
          {/* Success Icon */}
          <div
            className="d-flex align-items-center justify-content-center bg-success bg-opacity-10 mx-auto mb-4"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
            }}
          >
            <span style={{ fontSize: "40px", color: "green" }}>✔</span>
          </div>

          {/* Title */}
          <h3 className="fw-bold mb-2">Welcome to MINT! 🎉</h3>
          <p className="text-muted mb-4">
            Your account has been successfully created and verified.
          </p>

          {/* Admin Info */}
          <div className="bg-light border rounded p-3 mb-4">
            <span>
              You are the <strong>Admin</strong> for{" "}
              <span className="text-primary">{email}</span>
            </span>
          </div>

          {/* Button */}
          <button
            className="btn btn-primary w-100 fw-semibold"
            onClick={handleGetStarted}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
