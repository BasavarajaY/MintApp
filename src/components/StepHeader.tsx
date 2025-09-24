// src/components/StepHeader.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface StepHeaderProps {
  steps?: string[];
  currentStep?: number;
  showSteps?: boolean; // If false, only title + optional button
  showSignUpButton?: boolean;
}

const StepHeader: React.FC<StepHeaderProps> = ({
  steps = [],
  currentStep = 1,
  showSteps = true,
  showSignUpButton = false,
}) => {
  const navigate = useNavigate();

  return (
    <header
      className="d-flex justify-content-between align-items-center px-4 py-2"
      style={{ backgroundColor: "#003DA5", height: "65px" }}
    >
      <div className="d-flex align-items-center">
        {/* Left: Logo + App title */}
        <img
          src="/logo.png"
          alt="Logo"
          style={{ height: "50px", marginRight: "10px" }}
        />
        <h6 className="mb-0 fw-bold text-white">Migration Intelligence Tool</h6>
      </div>

      {/* Right: Steps OR SignUp */}
      <div className="d-flex align-items-center">
        {showSteps ? (
          <>
            {steps.map((step, index) => (
              <div key={index} className="d-flex align-items-center">
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center fw-semibold
                    ${
                      currentStep === index + 1
                        ? "bg-white text-primary"
                        : "bg-light text-muted border"
                    }`}
                  style={{ width: 32, height: 32 }}
                >
                  {index + 1}
                </div>
                <span
                  className={`ms-2 me-3 fw-medium ${
                    currentStep === index + 1 ? "text-white" : "text-light"
                  }`}
                >
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className="me-3"
                    style={{ width: 40, height: 2, background: "#ddd" }}
                  />
                )}
              </div>
            ))}

            {showSignUpButton && (
              <button
                className="btn btn-outline-light fw-bold ms-3"
                onClick={() => navigate("/app/register")}
              >
                Sign Up
              </button>
            )}
          </>
        ) : (
          showSignUpButton && (
            <button
              className="btn btn-outline-light fw-bold"
              onClick={() => navigate("/app/register")}
            >
              Sign Up
            </button>
          )
        )}
      </div>
    </header>
  );
};

export default StepHeader;
