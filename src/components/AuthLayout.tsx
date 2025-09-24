// src/components/AuthLayout.tsx
import React from "react";
import StepHeader from "./StepHeader";

interface AuthLayoutProps {
  steps?: string[]; // list of steps
  currentStep: number; // which step we are on
  showSteps?: boolean; // whether to display stepper
  children: React.ReactNode; // page content
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  steps = [],
  currentStep,
  showSteps = true,
  children,
}) => {
  return (
    <div className="d-flex flex-column vh-100 bg-light">
      {/* ✅ Pass steps + currentStep to StepHeader */}
      <StepHeader
        steps={steps}
        currentStep={currentStep}
        showSteps={showSteps}
      />

      {/* ✅ Page Content Area */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        <div
          className="card shadow p-4"
          style={{ width: "100%", maxWidth: "500px", borderRadius: "12px" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
