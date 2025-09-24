// src/components/Verification.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
// import { onboardingRegister, onboardingVerifyotp } from "../api/auth";
// import { useLocation } from "react-router-dom";

const Verification: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(300); // 5 min timer
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // const location = useLocation();
  // const formData = location.state?.formData;

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; // allow only digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      alert("Please enter the 6-digit code");
      return;
    }
    try {
      setLoading(true);
      // await onboardingVerifyotp({ email: formData.email, otp: otpValue });
      // await onboardingRegister(formData);
      navigate("/app/success");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      console.log("Verifying OTP:", otpValue);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimeLeft(300);
    setOtp(Array(6).fill(""));
    inputRefs.current[0]?.focus();
    alert("Resend OTP API call here");
  };

  {
    error && <div className="text-danger">{error}</div>;
  }

  return (
    <AuthLayout
      steps={["Register", "Verification", "Login"]}
      currentStep={2}
      showSteps={true}
    >
      {/* Timer top-right */}
      <div className="mb-3 position-relative">
        <span className="text-primary fw-semibold position-absolute top-0 end-0">
          {formatTime(timeLeft)}
        </span>

        <h3 className="fw-bold text-center mb-3">Verify your account</h3>
        <p className="text-center text-muted mb-4">
          We’ve sent a verification code to your email. Please enter it below to
          continue.
        </p>
      </div>

      <p className="text-muted">
        Enter the 6-digit code sent to <strong>abc@gmail.com</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between mb-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              ref={(el) => void (inputRefs.current[idx] = el)}
              className="form-control text-center mx-1"
              style={{ width: "3rem", fontSize: "1.5rem" }}
            />
          ))}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          Verify
        </button>
      </form>

      <div className="text-center mt-3">
        <span
          className={`fw-semibold ${
            timeLeft > 0 ? "text-muted" : "text-primary"
          }`}
          style={{ cursor: timeLeft > 0 ? "not-allowed" : "pointer" }}
          onClick={timeLeft === 0 ? handleResend : undefined}
        >
          Resend Email OTP
        </span>
      </div>
    </AuthLayout>
  );
};

export default Verification;
