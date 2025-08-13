// src/components/LoginForm.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOtp, resendOtp, verifyOtp } from "../api/auth";
import toast from "react-hot-toast";
import { brandColors } from "../styles/brandColors";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    try {
      setLoading(true);
      const response = await requestOtp({ email });
      console.log("OTP requested:", response);
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

    if (!password) {
      alert("Please enter the password from your email.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtp({ email, otp: password });
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

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundColor: brandColors.primary,
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "12px",
          backgroundColor: brandColors.white,
        }}
      >
        <h2 className="text-center mb-4" style={{ color: brandColors.primary }}>
          Login
        </h2>

        <form
          noValidate
          className={validated ? "was-validated" : ""}
          onSubmit={otpRequested ? handleLogin : handleRequestOtp}
        >
          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-bold">
              Email address
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
            <div className="invalid-feedback">Please enter a valid email.</div>
          </div>

          {/* Password */}
          {otpRequested && (
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-bold">
                Enter Password (from email)
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <div className="invalid-feedback">Password is required.</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn w-100 fw-bold"
            style={{
              backgroundColor: brandColors.secondary,
              borderColor: brandColors.secondary,
              color: brandColors.white,
            }}
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
                className="btn btn-link p-0"
                style={{
                  color: brandColors.secondary,
                  fontWeight: "bold",
                }}
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
  );
};

export default LoginForm;
