import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = sessionStorage.getItem("accessToken"); // or localStorage

  if (!token) {
    return <Navigate to="/app" replace />; // redirect to login
  }

  return <>{children}</>;
};

export default ProtectedRoute;
