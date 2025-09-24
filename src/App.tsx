// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";
import Verification from "./components/Verification";
import Success from "./components/Success";

function App() {
  return (
    <>
      <Routes>
        <Route path="/app">
          <Route index element={<LoginForm />} />
          <Route path="register" element={<Register />} />
          <Route path="verification" element={<Verification />} />
          <Route path="success" element={<Success />} />
          <Route path="dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
