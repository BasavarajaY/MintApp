// src/components/LoginForm.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOtp, resendOtp, verifyOtp } from "../api/auth";
import toast from "react-hot-toast";
import { brandColors } from "../styles/brandColors";
import StepHeader from "./StepHeader";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = React.useState<string>("");

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    try {
      setLoading(true);
      await requestOtp({ email });
      setOtpRequested(true);
      toast.success("OTP has been sent. Please check your email.");
    } catch (error) {
      console.error("OTP request failed:", error);
      toast.error("Failed to request OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (!otpValue || otpValue.length < 6) {
      setError("Please enter the complete Email OTP");
      // alert("Please enter the complete 6-digit OTP.");
      return;
    }
    setError("");
    try {
      setLoading(true);
      const response = await verifyOtp({ email, otp: otpValue });
      const accessToken = response.data?.access_token;
      if (!accessToken) throw new Error("Access token not found in response");

      localStorage.setItem("accessToken", accessToken);
      navigate("/app/dashboard");
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error("Invalid password or verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    try {
      setLoading(true);
      await resendOtp({ email });
      toast.success("OTP resent successfully. Check your email.");

      setResendCooldown(30);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      toast.error("Failed to resend OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, ""); // only digits allowed
    setOtp(newOtp);

    // auto move to next box
    if (value && index < otp.length - 1) {
      const next = document.querySelector<HTMLInputElement>(
        `#otp-${index + 1}`
      );
      next?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.querySelector<HTMLInputElement>(
        `#otp-${index - 1}`
      );
      prev?.focus();
    }
  };

  return (
    <div className="vh-100 d-flex flex-column">
      {/* 🔹 Step Header (no steps, but shows Sign Up) */}
      <StepHeader showSteps={false} showSignUpButton />

      {/* 🔹 Main Content */}
      <div className="d-flex justify-content-center align-items-center flex-grow-1 bg-light">
        {/* Login Card */}
        <div
          className="card shadow p-4"
          style={{
            width: "100%",
            maxWidth: "400px",
            borderRadius: "12px",
          }}
        >
          {/* Title */}
          <h3
            className="text-center fw-bold mb-4"
            style={{ color: brandColors.primary }}
          >
            Login to your account
          </h3>

          <form
            noValidate
            className={validated ? "was-validated" : ""}
            onSubmit={otpRequested ? handleLogin : handleRequestOtp}
          >
            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email Address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpRequested || loading}
              />
              <div className="invalid-feedback">
                Please enter a valid email.
              </div>
            </div>
            {/* OTP Input */}
            {otpRequested && (
              <div className="mb-3">
                <label htmlFor="otp" className="form-label fw-semibold">
                  Enter OTP (from email)
                </label>

                <div className="d-flex justify-content-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="form-control text-center mx-1"
                      style={{
                        width: "50px",
                        height: "50px",
                        fontSize: "1.5rem",
                      }}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      id={`otp-${index}`}
                      disabled={loading}
                    />
                  ))}
                </div>

                <div className="invalid-feedback">OTP is required.</div>
              </div>
            )}
            {error && (
              <div
                className="text-danger mt-2 fw-semibold mb-2"
                style={{ fontSize: "14px" }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : otpRequested
                ? "Login"
                : "Request OTP"}
            </button>

            {/* Resend OTP */}
            {otpRequested && (
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-link p-0 fw-semibold"
                  onClick={handleResendOtp}
                  disabled={loading || resendCooldown > 0 || !email}
                >
                  Resend OTP {resendCooldown > 0 && `(${resendCooldown}s)`}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
