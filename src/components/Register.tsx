// src/pages/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { onboardingSendotp } from "../api/auth";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    mobile: "",
    subscription_plan: "basic",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onboardingSendotp({ email: formData.email });
      // await onboardingRegister(formData);
      navigate("/app/verification", { state: { formData } });
    } catch (err: any) {
      setError(err.message || "Error during verification or registration");
    } finally {
      setLoading(false);
    }
  };
  {
    error && <div className="text-danger">{error}</div>;
  }

  return (
    <AuthLayout
      steps={["Register", "Verification", "Login"]}
      currentStep={1}
      showSteps={true}
    >
      <h3 className="fw-bold text-center mb-3">Create your Account</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Company Name</label>
          <input
            type="text"
            className="form-control"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Mobile Number</label>
          <input
            type="tel"
            className="form-control"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          Continue
        </button>
      </form>

      <p className="text-center mt-3">
        Already have an account?{" "}
        <span
          className="text-primary fw-bold"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/app/login")}
        >
          Login Instead
        </span>
      </p>
    </AuthLayout>
  );
};

export default Register;
