import React from "react";

interface StepProgressProps {
  currentStep: number; // 1 = Sign Up, 2 = Verification, 3 = Success
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const steps = ["Sign Up", "Verification", "Success"];

  return (
    <div className="d-flex justify-content-center align-items-center mb-4">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div key={label} className="d-flex align-items-center">
            {/* Circle */}
            <div
              className={`rounded-circle d-flex justify-content-center align-items-center fw-bold`}
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: isActive
                  ? "#0d6efd"
                  : isCompleted
                  ? "#198754"
                  : "#e9ecef",
                color: isActive || isCompleted ? "#fff" : "#6c757d",
              }}
            >
              {stepNumber}
            </div>

            {/* Label */}
            <span
              className="ms-2 me-3 fw-semibold"
              style={{
                color: isActive
                  ? "#0d6efd"
                  : isCompleted
                  ? "#198754"
                  : "#6c757d",
              }}
            >
              {label}
            </span>

            {/* Line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  height: "2px",
                  width: "50px",
                  backgroundColor:
                    currentStep > stepNumber ? "#198754" : "#dee2e6",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepProgress;
